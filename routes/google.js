const express = require('express');
const router = express.Router();
const googleDriveUtils = require("./../utils/google-drive-utils");
const googleMailUtils = require("./../utils/google-mail-utils");

router.get('/drive-redirect-url', async function (req, res, next) {
    let newVar = googleDriveUtils.getGoogleDriveRedirectUrl();
    res.send(newVar);
});

router.get('/drive-login', async function (req, res, next) {
    let code = req.query.code;
    let newVar = await googleDriveUtils.loginGoogleDriveKey(code);
    res.send(newVar);
});

router.get('/mail-redirect-url', async function (req, res, next) {
    let newVar = googleMailUtils.getGoogleMailRedirectUrl();
    res.send(newVar);
});

router.get('/mail-login', async function (req, res, next) {
    let code = req.query.code;
    let newVar = await googleMailUtils.loginGoogleMailKey(code);
    res.send(newVar);
});

module.exports = router;