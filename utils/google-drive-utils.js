let deviceUtils = require("utils/device-utils");

let addGoogleDriveKey = async function (key, email) {
    let device = await deviceUtils.searchDeviceByType("Drive");
    if (device == null) {
        // create
    } else {
        // edit
    }
    return device;
};

let fetchGoogleDriveData = async function (deviceId, afterTime) {
    if (afterTime == null) {
        // full sync
    } else {
        // partial sync
    }
};

module.exports.addGoogleDriveKey = addGoogleDriveKey;
module.exports.fetchGoogleDriveData = fetchGoogleDriveData;
