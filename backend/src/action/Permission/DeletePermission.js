const models = require('../../models');

async function DeletePermission(id)
{
    const permission = await models.Permission.findByPk(id);

    if(permission)
    {
        return await permission.destroy();
    }

    return false;
}

module.exports = DeletePermission;