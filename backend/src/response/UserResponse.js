const { paginationLinks } = require("../helper/paginate");

function UserResource(user)
{
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        gender: user.gender,
        status: user.active ? 'enabled' : 'disabled',
        role: user.role.name,
        date: user.createdAt
    }
}

function UserCollection(users)
{
    return {
        data: users.data.map(project => UserResource(project)),
        meta: {
            total: users.total,
            currentPage: users.currentPage,
            totalPage: users.totalPages,
            pageSize: users.pageSize
        },
        links: paginationLinks('users', users.currentPage, users.totalPages)
    };
}

module.exports = {
    UserResource, UserCollection
}