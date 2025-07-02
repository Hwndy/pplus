const models = require('../../models');

async function CreatePermission(data)
{
    const permission = await models.Permission.create(data);

    if(permission)
    {
        return true;
    }

    return false;
}

module.exports = CreatePermission;