const { paginationLinks } = require("../helper/paginate")

function PlacementResource(placement)
{
    return {
        id: placement.id,
        name: placement.name
    }
}

function PlacementCollection(placements)
{
    return {
        placement: placements.data.map(placement => PlacementResource(placement)),
        meta: {
            total: placements.total,
            currentPage: placements.currentPage,
            totalPage: placements.totalPages,
            pageSize: placements.pageSize
        },
        links: paginationLinks('placements', placements.currentPage, placements.totalPages)
    }
}

module.exports = {
    PlacementResource,
    PlacementCollection
}