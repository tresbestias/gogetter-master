const express = require('express');
const router = express.Router();
const getUtils = require("./../utils/get-utils");

router.get('/files', async function (req, res, next) {
    let q = req.query.q;
    let newVar = await getUtils.searchData(q, 0, 100);
    res.send(newVar);
});

router.get('/file/get', async function (req, res, next) {
    let id = req.query.id;
    let url = await getUtils.getDownloadableUrl(id);
    res.redirect(url);
});

module.exports = router;