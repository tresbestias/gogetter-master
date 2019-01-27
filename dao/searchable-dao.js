const config = require("../config");
const esClient = require("./internals/es-client");

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

const search = async function (query, from, size) {
    if (!from) {
        from = 0; size = 25;
    } else if (!size) {
        size = 25;
    }
    try {
        const response = await esClient.search({
            index: config.ES_SEARCHABLE_INDEX,
            type: config.ES_TYPE,
            body: {
                query:{
                    regexp:{
                        text:".*" + query + ".*"
                    }
                }
            },
            from:from,
            size:size
        });
        const allSearchables = [];
        for(let i in response.hits.hits) {
            const searchable = response.hits.hits[i]["_source"];
            allSearchables.push(searchable);
        }
        return allSearchables;
    } catch (e) {
        return null;
    }};

const getSearchable = async function (searchableId) {
    try {
        let searchable = await esClient.get({
            index: config.ES_SEARCHABLE_INDEX,
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
