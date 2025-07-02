const { paginationLinks } = require("../helper/paginate")

function NatureResource(nature)
{
    return {
        id: nature.id,
        name: nature.name
    }
}

function NatureCollection(natures)
{
    return {
        nature: natures.data.map(nature => NatureResource(nature)),
        meta: {
            total: natures.total,
            currentPage: natures.currentPage,
            totalPage: natures.totalPages,
            pageSize: natures.pageSize
        },
        links: paginationLinks('natures', natures.currentPage, natures.totalPages)
    }
}

module.exports = {
    NatureResource,
    NatureCollection
}