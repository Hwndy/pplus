const { paginationLinks } = require("../helper/paginate")

function ActivityResource(activity)
{
    return {
        id: activity.id,
        name: activity.name
    }
}

function ActivityCollection(activities)
{
    return {
        activity: activities.data.map(activity => ActivityResource(activity)),
        meta: {
            total: activities.total,
            currentPage: activities.currentPage,
            totalPage: activities.totalPages,
            pageSize: activities.pageSize
        },
        links: paginationLinks('activitiess', activities.currentPage, activities.totalPages)
    }
}

module.exports = {
    ActivityResource,
    ActivityCollection
}