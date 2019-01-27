const config = require("../../config");
const elasticsearch = require("elasticsearch");

const esClient = new elasticsearch.Client({
    host:config.ES_HOST,
    log: 'trace'
});

module.exports = esClient;
