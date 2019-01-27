const express = require('express');
const router = express.Router();
const deviceDao = require("./../dao/device-dao");
const slaveUtils = require("../utils/slave-utils");

router.get('/get-slave', async function (req, res, next) {
    let device = await deviceDao.searchDevice("slave");
    res.send(device);
});

router.get('/clear-inactive-slaves', async function (req, res, next) {
    await slaveUtils.clearInactiveSlaves()
});

module.exports = router;