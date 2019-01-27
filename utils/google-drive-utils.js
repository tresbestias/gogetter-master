const {google} = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const deviceDao = require("../dao/device-dao");
const searchableDao = require("../dao/searchable-dao");
const config = require("../config");

const getOAuth2Client = function () {
    const {client_secret, client_id} = config.GOOGLE_CREDENTIALS;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, "http://localhost:3000/google/login");
    return oAuth2Client;
};

const authorize = function (device) {
    const oAuth2Client = getOAuth2Client();
    oAuth2Client.setCredentials(device.information.auth);
    return oAuth2Client;
};

const getGoogleRedirectUrl = function () {
    return getOAuth2Client().generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
};

const loginGoogleDriveKey = async function (tokenCode) {
    let oAuth2Client = getOAuth2Client();
    let {tokens} = await oAuth2Client.getToken(tokenCode);
    let device = await deviceDao.searchDevice("drive");
    if (!device) {
        device = await deviceDao.createDevice("drive", {auth:tokens});
    } else {
        device.information = {auth:tokens};
        device.active = true;
        device.checkpoint = "";
        await deviceDao.editDevice(device);
    }
    return device;
};

const fetchGoogleDriveData = async function () {
    let device;
    try {
        device = await deviceDao.searchDevice("drive");
        if (!device) {
            // do nothing
        } else {
            let oAuth2Client = authorize(device);
            await oAuth2Client.refreshAccessToken()
            let drive = google.drive({version: 'v3', auth: oAuth2Client});
            let deletedFiles = [];
            let changedFiles = [];

            if (!device.checkpoint) {
                device.checkpoint = await new Promise((resolve, reject) => {
                    drive.changes.getStartPageToken({}, (err, res) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(res.data.startPageToken);
                        }
                    });
                });

                let nextPageToken = undefined;
                do {
                    let data = await new Promise((resolve, reject) => {
                        drive.files.list({
                            corpora: "user,allTeamDrives",
                            includeTeamDriveItems: true,
                            pageSize: 1000,
                            supportsTeamDrives: true,
                            pageToken: nextPageToken,
                            fields: "nextPageToken, files(id, name, kind, modifiedTime, createdTime)"
                        }, (err, res) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(res.data);
                            }
                        });
                    });
                    nextPageToken = data.nextPageToken
                    for (let i in data.files) {
                        let file = data.files[i];
                        changedFiles.push({
                            id: file.id,
                            text: file.name,
                            type: file.kind,
                            // updateTime: file.modifiedTime,
                            // createTime: file.createdTime,
                            owner: device.id

                        });
                    }
                    await searchableDao.makeSearchable(changedFiles);
                    changedFiles = [];
                } while (nextPageToken);
            } else {
                let listResult = await new Promise((resolve, reject) => {
                    drive.changes.list({
                        pageToken: device.checkpoint,
                        fields: "*",
                        supportsTeamDrives: true
                    }, (err, res) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(res.data);
                        }
                    });
                });

                if (listResult.nextPageToken)
                    device.checkpoint = listResult.nextPageToken;
                else
                    device.checkpoint = listResult.newStartPageToken;

                for (let i in listResult.changes) {
                    let change = listResult.changes[i];
                    if (change.removed) {
                        deletedFiles.push(change.fileId);
                    } else {
                        changedFiles.push({
                            id: change.fileId,
                            text: change.file.name,
                            type: change.file.kind,
                            // updateTime: change.time,
                            // createTime: change.file.createdTime,
                            owner: device.id

                        })
                    }
                }
            }
            if (changedFiles.length > 0) {
                await searchableDao.makeSearchable(changedFiles);
            }
            if (deletedFiles.length > 0) {
                await searchableDao.deleteSearchable(deletedFiles);
            }
            await deviceDao.editDevice(device);
        }
    } catch (e) {
        if (device) {
            device.active = false;
            device.checkpoint = "";
            await deviceDao.editDevice(device);
        }
    }
};

const createDownloadableUrl = async function (searchable) {
    let device = searchable.owner;
    if (!device || device.active === false) {
        return null;
    }
    let oAuth2Client = authorize(device);
    let drive = google.drive({version: 'v3', auth: oAuth2Client});
    let resp = await new Promise((resolve, reject) => {
        drive.files.get({
            fileId: searchable.id,
            supportsTeamDrives: true,
            fields: "webViewLink"
        }, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res.data);
            }
        });
    });
    return resp.webViewLink;
};

const clearDrive = async function () {
    let device;
    try {
        device = await deviceDao.searchDevice("drive");
        if (device) {
            await searchableDao.clearSearchables(device.id);
            await deviceDao.removeDevice(device.id);
        }
    } catch (e) {
        return null;
    }
};

module.exports.getGoogleRedirectUrl = getGoogleRedirectUrl;
module.exports.loginGoogleDriveKey = loginGoogleDriveKey;
module.exports.fetchGoogleDriveData = fetchGoogleDriveData;
module.exports.createDownloadableUrl = createDownloadableUrl;
module.exports.clearDrive = clearDrive;
