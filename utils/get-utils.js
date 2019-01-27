let searchableDao = require("./../dao/searchable-dao")

const searchData = async function (query, from, size) {
    return await searchableDao.search(query, from, size)
};