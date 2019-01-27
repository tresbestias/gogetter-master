const express = require('express');
const router = express.Router();
const googleDriveUtils = require("./../utils/google-drive-utils");

router.get('/redirect-url', async function (req, res, next) {
    let newVar = googleDriveUtils.getGoogleRedirectUrl();
    res.send(newVar);
});

router.get('/login', async function (req, res, next) {
    let code = req.query.code;
    let newVar = await googleDriveUtils.loginGoogleDriveKey(code);
    res.send(newVar);
});

router.get('/remove-drive', async function (req, res, next) {
    await googleDriveUtils.clearDrive();
    res.send({"ack":true});
});

module.exports = router;