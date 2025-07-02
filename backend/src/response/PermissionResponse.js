const { paginationLinks } = require("../helper/paginate")

function PermissionResource(permission)
{
    return {
        id: permission.id,
        name: permission.name
    }
}

function PermissionCollection(permissions)
{
    return {
        data: permissions.data.map(permission => PermissionResource(permission)),
        meta: {
            total: permissions.total,
            currentPage: permissions.currentPage,
            totalPage: permissions.totalPages,
            pageSize: permissions.pageSize
        },
        links: paginationLinks('permissions', permissions.currentPage, permissions.totalPages)
    }
}

module.exports = {
    PermissionResource,
    PermissionCollection
}