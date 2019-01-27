const express = require('express');
const router = express.Router();
const googleDriveUtils = require("./../utils/google-drive-utils");
const googleMailUtils = require("./../utils/google-mail-utils");

router.get('/drive-redirect-url', async function (req, res, next) {
    let newVar = googleDriveUtils.getGoogleDriveRedirectUrl();
    res.redirect(newVar);
});

router.get('/drive-login', async function (req, res, next) {
    let code = req.query.code;
    let newVar = await googleDriveUtils.loginGoogleDriveKey(code);
    res.send(newVar);
});

router.get('/remove-drive', async function (req, res, next) {
    await googleDriveUtils.clearDrive();
    res.send({"ack":true});
});

router.get('/mail-redirect-url', async function (req, res, next) {
    let newVar = googleMailUtils.getGoogleMailRedirectUrl();
    res.redirect(newVar);
});

router.get('/mail-login', async function (req, res, next) {
    let code = req.query.code;
    let newVar = await googleMailUtils.loginGoogleMailKey(code);
    res.send(newVar);
});

router.get('/remove-mail', async function (req, res, next) {
    await googleMailUtils.clearMails();
    res.send({"ack":true});
});

module.exports = router;