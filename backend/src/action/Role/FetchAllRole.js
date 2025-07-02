const { paginate } = require('../../helper/paginate');
const models = require('../../models');

async function FetchAllRole(page = 1)
{
    const pageSize = 10;
    const role = await paginate(models.Role, {
        page,
        pageSize,
        include: [
            {
                model: models.RolesPermissions,
                as: 'rolesPermissions',
                include: [
                    {
                        model: models.Permission,
                        as: 'permission'
                    }
                ]
            }
        ]
    });

    if(role)
    {
        return role;
    }

    return false;

}

module.exports = FetchAllRole;