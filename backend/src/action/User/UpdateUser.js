const models = require('../../models');

async function UpdateUser(id, data)
{
    const user = await models.User.findByPk(id);

    if(user)
    {
        return await user.update(data);
    }

    return false;
}

module.exports = UpdateUser;