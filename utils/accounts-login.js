const {google} = require('googleapis');
//const SCOPES = ['https://www.googleapis.com/auth/drive'];
// const deviceDao = require("../dao/device-dao");
// const searchableDao = require("../dao/searchable-dao");
// const config = require("../config");

const getOAuth2Client = function (pass_config) {
    const {client_secret, client_id} = pass_config;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, "http://localhost:3000/google/login");
    return oAuth2Client;
};

const authorize = function (device,pass_config) {
    const oAuth2Client = getOAuth2Client(pass_config);
    oAuth2Client.setCredentials(device.information.auth);
    return oAuth2Client;
};



module.exports.getOAuth2Client = getOAuth2Client;
module.exports.authorize = authorize;
