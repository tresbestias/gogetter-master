const {google} = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const deviceDao = require("../dao/device-dao");
const searchableDao = require("../dao/searchable-dao");
const config = require("../config");
const loginutils = require("accounts-login.js")



const getGoogleMailRedirectUrl = function () {
    return loginutils.getOAuth2Client(config.GOOGLE_CREDENTIALS).generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
};

const loginGoogleMailKey = async function (tokenCode) {
    let oAuth2Client = loginutils.getOAuth2Client(config.GMAIL_CREDENTIALS);
    let {tokens} = await oAuth2Client.getToken(tokenCode);
    let device = await deviceDao.searchDevice("mail");
    if (!device) {
        device = await deviceDao.createDevice("mail", {auth:tokens});
    } else {
        device.information = {auth:tokens};
        device.active = true;
        device.checkpoint = "";
        await deviceDao.editDevice(device);
    }
    return device;
};


const fetchGoogleMailContent = async function (last_synced_date) {
    let device;
    device = await deviceDao.searchDevice("mail");
    if (!device) {
        // do nothing
    } else {
        let oAuth2Client = loginutils.authorize(device,config.GMAIL_CREDENTIALS);
        await oAuth2Client.refreshAccessToken()
        let gmail = google.gmail({version: 'v1', auth: oAuth2Client});
        
        let newmessages = []
        if (!device.checkpoint) {
            let data = await new Promise((resolve, reject) => {
                gmail.users.messages.list({
                    userId: 'me',
                }, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res.data);
                    }
                });
            });

            let nextPageToken = data.nextPageToken;
            do {
                for (let i in data.messages) {
                    let message = data.messages[i];
                    let message_subject = ''
                    let headers = await new Promise((resolve, reject) => {
                        gmail.users.messages.get({
                            userId: 'me',
                            id:message.id,
                        }, (err, res) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(res.data.headers);
                            }
                        });
                    });
                    headers.forEach((header) => {
                        if (`${header.name}` == 'Subject') { message_subject = header.value }
                    });
                    newmessages.push({
                        id: message.id,
                        text: message_subject,
                        type: 'mail',
                        //updateTime: message.internalDate,
                        createTime: message.internalDate,
                        owner: device.id
                    });
                }
                let data = await new Promise((resolve, reject) => {
                    gmail.users.messages.list({
                        userId: 'me',
                        pageToken = nextPageToken,
                    }, (err, res) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(res.data);
                        }
                    });
                });
                await searchableDao.makeSearchable(newmessages);
                newmessages = [];
            } while (nextPageToken);
        } else {
            if (!last_synced_date) return
            let recent_mails = await new Promise((resolve, reject) => {
                gmail.users.messages.list({
                    userId: 'me',
                    pageToken : device.checkpoint,
                    q : 'after'+last_synced_date.toString()
                }, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res.data);
                    }
                });
            });

            for (let i in recent_mails.messages) {
                let message = recent_mails.messages[i];
                let message_subject = ''
                let recent_headers = await new Promise((resolve, reject) => {
                    gmail.users.messages.get({
                        userId: 'me',
                        id:message.id,
                    }, (err, res) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(res.data.headers);
                        }
                    });
                });
                recent_headers.forEach((header) => {
                    if (`${header.name}` == 'Subject') { message_subject = header.value }
                });
                newmessages.push({
                    id: message.id,
                    text: message_subject,
                    type: 'mail',
                    //updateTime: message.internalDate,
                    createTime: message.internalDate,
                    owner: device.id
                });
            }
        }
    }

};

const clearMail = async function () {
    let device;
    try {
        device = await deviceDao.searchDevice("mail");
        if (device) {
            await searchableDao.clearSearchables(device.id);
            await deviceDao.removeDevice(device.id);
        }
    } catch (e) {
        return null;
    }
};


module.exports.fetchGoogleMailContent = fetchGoogleMailContent;
module.exports.getGoogleMailRedirectUrl = getGoogleMailRedirectUrl;
module.exports.loginGoogleMailKey = loginGoogleMailKey;
module.exports.fetchGoogleMailContent = fetchGoogleMailContent;
module.exports.clearMail = clearMail;

