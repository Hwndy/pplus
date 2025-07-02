const models = require('../../models');

async function FetchSinglePermission(id)
{
    const permission = await models.Permission.findByPk(id);

    if(permission)
    {
        return permission;
    }

    return false;
}

module.exports = FetchSinglePermission;