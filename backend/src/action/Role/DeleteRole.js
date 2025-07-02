const models = require('../../models');

async function DeleteRole(id)
{
    const role = await models.Role.findByPk(id);

    if(role.name !== "Company")
    {
        const permission = await models.RolesPermissions.findAll({where: {role_id: role.id}});

        if(permission?.length > 0)
        {
            await Promise.all(permission.map(async (p) => {
                await p.destroy();
            }));
        }
        return await role.destroy();
    }

    return false;
}

module.exports = DeleteRole;