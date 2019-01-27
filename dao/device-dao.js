const config = require("../config");
const esClient = require("./internals/es-client");
const uuidv1 = require("uuid/v1");

const generateId = function () {
    return uuidv1();
};

const getDevice = async function (deviceId) {
    try {
        let device = await esClient.get({
            index: config.ES_DEVICE_INDEX,
            type: config.ES_TYPE,
            id: deviceId
        });
        device = device["_source"];
        device.information = JSON.parse(device.information);
        // return device;
        return device;
    } catch (e) {
        return null;
    }
};

const removeDevice = async function (deviceId) {
    try {
        let device = await esClient.delete({
            index: config.ES_DEVICE_INDEX,
            type: config.ES_TYPE,
            id: deviceId
        });
        return true;
    } catch (e) {
        return null;
    }
};

const createDevice = async function (type, information, optionalId) {
    try {
        let device = {
            id: optionalId ? optionalId : generateId(),
            active: true,
            lastSynced: 0,
            checkpoint:"",
            type: type,
            information: JSON.stringify(information)
        };
        let response = await esClient.index({
            index: config.ES_DEVICE_INDEX,
            type: config.ES_TYPE,
            id: device.id,
            body: device
        });
        device.information = JSON.parse(device.information);
        return device;
    } catch (e) {
        return null;
    }
};

const editDevice = async function (device) {
    try {
        device.information = JSON.stringify(device.information);
        //parseInt(Date.now() / 1000)
        let response = await esClient.index({
            index: config.ES_DEVICE_INDEX,
            type: config.ES_TYPE,
            id: device.id,
            body: device
        });
        device.information = JSON.parse(device.information);
        return device;
    } catch (e) {
        return null;
    }
};

const searchDevice = async function (type) {
    try {
        const response = await esClient.search({
            index: config.ES_DEVICE_INDEX,
            type: config.ES_TYPE,
            body: {
               query:{
                   term:{
                       type:type
                   }
               }
            }
        });
        if (response.hits.total != 1) {
            return false;
        }
        const device = response.hits.hits[0]["_source"];
        device.information = JSON.parse(device.information);
        return device;
    } catch (e) {
        return null;
    }
};

const getAllDevice = async function (type) {
    try {
        const response = await esClient.search({
            index: config.ES_DEVICE_INDEX,
            type: config.ES_TYPE,
            body: {
                query:{
                    term:{
                        type:type
                    }
                },
                size:500
            }
        });
        const allDevices = [];
        for(let i in response.hits.hits) {
            const device = response.hits.hits[i]["_source"];
            device.information = JSON.parse(device.information);
            allDevices.push(device);
        }
        return allDevices;
    } catch (e) {
        return null;
    }
};

module.exports.getDevice = getDevice;
module.exports.createDevice = createDevice;
module.exports.removeDevice = removeDevice;
module.exports.editDevice = editDevice;
module.exports.searchDevice = searchDevice;
module.exports.getAllDevice = getAllDevice;