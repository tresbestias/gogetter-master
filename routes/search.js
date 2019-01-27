const express = require('express');
const router = express.Router();
const getUtils = require("./../utils/get-utils");

router.get('/files', async function (req, res, next) {
    let q = req.query.q;
    let from = req.query.from ? parseInt(req.query.from) : 0;
    let size = req.query.size ? parseInt(req.query.size) : 100;
    let newVar = await getUtils.searchData(q, from, size);
    res.send(newVar);
});

router.get('/file/get', async function (req, res, next) {
    let id = req.query.id;
    let url = await getUtils.getDownloadableUrl(id);
    res.redirect(url);
});

router.get('/devices', async function (req, res, next) {
    let allDevices = await getUtils.getStatewiseDevices();
    res.send(allDevices);
});

module.exports = router;