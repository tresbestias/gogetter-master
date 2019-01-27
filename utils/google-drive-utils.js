const deviceDao = require("../dao/device-dao");
const searchableDao = require("../dao/searchable-dao");

const addGoogleDriveKey = async function (key, email) {
    let device = await deviceDao.searchDevice("drive");
    if (device === null) {
        await deviceDao.createDevice("drive", {"key":key, "email":email});
    } else {
        device.information = {"key":key, "email":email};
        device.active = true;
        await deviceDao.editDevice(device);
    }
    return device;
};

const fetchGoogleDriveData = async function (deviceId) {
    let device;
    try {
        device = await deviceDao.getDevice(deviceId);
        if (device.active === false) {
            // do something
        } else {
            // fetch again
        }
    } catch (e) {
        if (device) {
            device.active = false;
            await deviceDao.editDevice(device);
        }
    }
};

const createGoogleUrl = async function (searchableId) {
    let searchable = await searchableDao.getSearchable(searchableId);
    if (searchable != null) {

    } else {
        return null;
    }
};

module.exports.addGoogleDriveKey = addGoogleDriveKey;
module.exports.fetchGoogleDriveData = fetchGoogleDriveData;
