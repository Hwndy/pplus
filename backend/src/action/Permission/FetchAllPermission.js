const { paginate } = require('../../helper/paginate');
const models = require('../../models');

async function FetchAllPermission(page = 1)
{
    const pageSize = 10;
    const permission = await paginate(models.Permission, {
        page,
        pageSize
    });

    if(permission)
    {
        return permission;
    }

    return false;
}

module.exports = FetchAllPermission;