const express = require('express');
const router = express.Router();
const deviceDao = require("./../dao/device-dao");

router.get('/register-slave', async function (req, res, next) {
    let device = await deviceDao.createDevice("slave", {"ip": "localhost"});
    res.send(device);
});

router.get('/get-slave', async function (req, res, next) {
    let device = await deviceDao.searchDevice("slave");
    res.send(device);
});

module.exports = router;