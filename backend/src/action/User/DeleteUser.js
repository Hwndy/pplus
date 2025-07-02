const models = require('../../models');

async function DeleteUser(id)
{
    const user = await models.User.findByPk(id, {include: [
        {
            model: models.Role,
            as: 'role'
        }
    ]});

    if(user.role.name !== 'Company')
    {
        return await user.destroy();
    }

    return false;
}

module.exports = DeleteUser;