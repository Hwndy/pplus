const models = require('../../models');

async function UpdatePermission(id, data)
{
    const permission = await models.Permission.findByPk(id);

    if(permission)
    {
        return await permission.update(data);
    }

    return false;
}

module.exports = UpdatePermission;