const express = require('express');
const router = express.Router();
const deviceDao = require("./../dao/device-dao");

router.get('/files', async function (req, res, next) {
    let q = req.query.q;

    let device = await deviceDao.searchDevice("slave");
    res.send(device);
});

module.exports = router;