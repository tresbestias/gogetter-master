const axios = require("axios")
const deviceDao = require("../dao/device-dao");
const searchableDao = require("../dao/searchable-dao");

const newSlaveSetup = async function (ip, deviceId) {
    let device;
    if(deviceId === "") {
        device = await deviceDao.createDevice("slave", {ip: ip});
    } else {
        let device = await deviceDao.getDevice(deviceId);
        if (device === null) {
            device = await deviceDao.createDevice("slave", {ip: ip}, deviceId);
        } else if (device.information.ip !== ip || !device.active) {
            device.information.ip = ip;
            device.active = true;
            await deviceDao.editDevice(device);
        }
    }
    await informSlave(device);
    return device;
};

const informSlave = async function (device) {
    try {
        let response = await axios.get("http://" + device.information.ip + ":3002/ping?device=" + device.id);
    } catch (e) {
        device.active = false;
        await deviceDao.editDevice(device);
    }
};

const syncPartialData = async function () {
    let deviceList = await deviceDao.getAllDevice("slave");
    for (let i in deviceList) {
        let device = deviceList[i];
        if (device == null || device.active === false) {
            continue;
        }
        await syncPartialDataPerDevice(device);
    }
};

const syncPartialDataPerDevice = async function (device) {
    try {
        let response = await axios.get("http://" + device.information.ip + ":3002/index?from=" + device.lastSynced);
        if (response.data.updateResult && response.data.updateResult.length > 0) {
            let updates = [];
            for (let i in response.data.updateResult) {
                let update = response.data.updateResult[i];
                update.owner = device.id;
                updates.push(update);
            }
            await searchableDao.makeSearchable(updates);
        }
        if (response.data.deleteResult && response.data.deleteResult.length > 0) {
            await searchableDao.deleteSearchable(response.data.deleteResult);
        }
        device.lastSynced = response.data.nowTime;
        await deviceDao.editDevice(device);
    } catch (e) {
        device.active = false;
        try {
            await deviceDao.editDevice(device);
        } catch (e) {
            return false;
        }
    }
    return true;
};

module.exports.newSlaveSetup = newSlaveSetup;
module.exports.informSlave = informSlave;
module.exports.syncPartialData = syncPartialData;
module.exports.syncPartialDataPerDevice = syncPartialDataPerDevice;
