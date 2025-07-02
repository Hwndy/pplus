const { paginationLinks } = require("../helper/paginate")
const { RolesPermissionArray } = require("./RolesPermissionResponse")

function RoleResource(role)
{
    return {
        id: role.id,
        name: role.name,
        permissions: RolesPermissionArray(role.rolesPermissions)
    }
}

function RoleCollection(roles)
{
    return {
        data: roles.data.map(role => RoleResource(role)),
        meta: {
            total: roles.total,
            currentPage: roles.currentPage,
            totalPage: roles.totalPages,
            pageSize: roles.pageSize
        },
        links: paginationLinks('roles', roles.currentPage, roles.totalPages)
    }
}

module.exports = {
    RoleResource,
    RoleCollection
}