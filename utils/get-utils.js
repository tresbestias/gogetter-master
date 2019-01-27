let searchableDao = require("./../dao/searchable-dao");
let deviceDao = require("./../dao/device-dao");
let googleDriveUtil = require("./google-drive-utils");
let slaveUtils = require("./slave-utils");

const searchData = async function (query, from, size) {
    let newVar = await searchableDao.search(query, from, size);
    let deviceList = [];
    for (let i in newVar) {
        let searchable = newVar[i];
        let owner = searchable["owner"];
        if (deviceList.indexOf(owner) == -1) {
            deviceList.push(owner);
        }
    }
    let devices = {};
    for (let i in deviceList) {
        let deviceId = deviceList[i];
        let device = await deviceDao.getDevice(deviceId);
        devices[deviceId] = device
    }
    for (let i in newVar) {
        let searchable = newVar[i];
        searchable["owner"] = devices[searchable["owner"]];
    }
    return newVar;
};

const getDownloadableUrl = async function(searchableId) {
    let searchable = await searchableDao.getSearchable(searchableId);
    if (!searchable) {
        return null;
    }
    let device = await deviceDao.getDevice(searchable.owner);
    if (!device) {
        return null;
    }
    searchable.owner = device;
    if (searchable.owner.type === "drive") {
        return await googleDriveUtil.createDownloadableUrl(searchable);
    } else if (searchable.owner.type === "slave") {
        return await slaveUtils.getDownloadableLink(searchable);
    }
    else {
        return null;
    }
};

module.exports.searchData = searchData;
module.exports.getDownloadableUrl = getDownloadableUrl;