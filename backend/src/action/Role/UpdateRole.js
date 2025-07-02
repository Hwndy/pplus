const models = require('../../models');

async function UpdateRole(id, data, PermissionData)
{
    const role = await models.Role.findByPk(id);

    if(role)
    {
        if(PermissionData){
        
            await Promise.all(PermissionData.map(async (p) => {
                await models.RolesPermissions.create({
                    role_id: role.id,
                    permission_id: p
                });
            }));
        }   
        
        return await role.update(data);
    }

    return false;
}

module.exports = UpdateRole;