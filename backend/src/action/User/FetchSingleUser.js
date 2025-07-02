const models = require('../../models');

async function FetchSingleUser(id)
{
    const user = await models.User.findByPk(id, {include: [
        {
            model: models.Role,
            as: 'role'
        }
    ]});

    if(user)
    {
        return user;
    }

    return false;
}

module.exports = FetchSingleUser;