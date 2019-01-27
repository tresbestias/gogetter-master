const config = require("../config");
const esClient = require("dao/internals/es-client");

const makeSearchable = async function (searchables) {
    try {
        let body = [];
        for (let i in searchables) {
            let searchable = searchables[i];
            body.push({index: {_index: config.ES_SEARCHABLE_INDEX, _type: config.ES_TYPE, _id: searchable.id}});
            body.push(searchable);
        }
        await esClient.bulk({
            body: body
        });
        return true;
    }catch (e) {
        return false;
    }
};

const deleteSearchable = async function (ids) {
    try {
        let body = [];
        for (let i in ids) {
            let id = ids[i];
            body.push({delete: {_index: config.ES_SEARCHABLE_INDEX, _type: config.ES_TYPE, _id: id}});
        }
        await esClient.bulk({
            body: body
        });
        return true;
    }catch (e) {
        return false;
    }
};

const search = async function (query) {
    try {

    } catch (e) {
        return [];
    }
};

const getSearchable = async function (searchableId) {
    try {
        let searchable = await esClient.get({
            index: config.ES_DEVICE_INDEX,
            type: config.ES_TYPE,
            id: searchableId
        });
        return searchable["_source"];
    } catch (e) {
        return null;
    }
};



module.exports.makeSearchable = makeSearchable;
module.exports.deleteSearchable = deleteSearchable;
module.exports.search = search;
module.exports.getSearchable = getSearchable;
