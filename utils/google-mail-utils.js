const {google} = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const deviceDao = require("../dao/device-dao");
const searchableDao = require("../dao/searchable-dao");
const config = require("../config");
const loginutils = require("accounts-login.js")


const getOAuth2Client = function () {
    const {client_secret, client_id} = config.GMAIL_CREDENTIALS;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, "http://localhost:3000/google/mail-login");
    return oAuth2Client;
};

const authorize = function (device) {
    const oAuth2Client = getOAuth2Client();
    oAuth2Client.setCredentials(device.information.auth);
    return oAuth2Client;
};

const getGoogleMailRedirectUrl = function () {
    return loginutils.getOAuth2Client().generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
};

const loginGoogleMailKey = async function (tokenCode) {
    let oAuth2Client = loginutils.getOAuth2Client();
    let {tokens} = await oAuth2Client.getToken(tokenCode);
    let device = await deviceDao.searchDevice("mail");
    if (!device) {
        device = await deviceDao.createDevice("mail", {auth:tokens});
    } else {
        device.information = {auth:tokens};
        device.active = true;
        device.checkpoint = "";
        device.lastSynced = 1547987069;
        await deviceDao.editDevice(device);
    }
    return device;
};


const fetchGoogleMailContent = async function () {
    let device;
    device = await deviceDao.searchDevice("mail");
    if (!device) {
        // do nothing
    } else {
        let oAuth2Client = loginutils.authorize(device);
        await oAuth2Client.refreshAccessToken()
        let gmail = google.gmail({version: 'v1', auth: oAuth2Client});
        
        let newmessages = [];
        let currTime = parseInt(Date.now()/1000);

        let nextPageToken;
        do {
            let data = await new Promise((resolve, reject) => {
                gmail.users.messages.list({
                    userId: 'me',
                    pageToken : nextPageToken,
                    q : 'after'+device.lastSynced,
                }, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res.data);
                    }
                });
            });

            nextPageToken = data.nextPageToken;
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
                    // createTime: message.internalDate,
                    owner: device.id
                });
            }
            await searchableDao.makeSearchable(newmessages);
            newmessages = [];
        } while (nextPageToken);

        device.lastSynced = currTime;
        await deviceDao.editDevice(device);

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

module.exports.getOAuth2Client = getOAuth2Client;
module.exports.authorize = authorize;
module.exports.fetchGoogleMailContent = fetchGoogleMailContent;
module.exports.getGoogleMailRedirectUrl = getGoogleMailRedirectUrl;
module.exports.loginGoogleMailKey = loginGoogleMailKey;
module.exports.fetchGoogleMailContent = fetchGoogleMailContent;
module.exports.clearMail = clearMail;

