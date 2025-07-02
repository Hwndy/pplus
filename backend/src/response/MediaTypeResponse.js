const { paginationLinks } = require("../helper/paginate")

function MediaTypeResource(type)
{
    console.log(type);
    return {
        id: type.id,
        name: type.name
    }
}

function MediaTypeCollection(types)
{
    return {
        type: types.data.map(type => MediaTypeResource(type)),
        meta: {
            total: types.total,
            currentPage: types.currentPage,
            totalPage: types.totalPages,
            pageSize: types.pageSize
        },
        links: paginationLinks('types', types.currentPage, types.totalPages)
    }
}

module.exports = {
    MediaTypeResource,
    MediaTypeCollection
}