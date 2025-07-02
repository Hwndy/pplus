const models = require('../../models');

async function CreateRole(roleData, permissionData)
{
    const role = await models.Role.create(roleData);

    if(role)
    {
        if(permissionData){

            await Promise.all(permissionData.map(async (p) => {
                await models.RolesPermissions.create({
                    role_id: role.id,
                permission_id: p
                });
            }));
        }   
        
        return true;
    }

    return false;
}

module.exports = CreateRole;