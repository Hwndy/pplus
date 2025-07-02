const models = require('../../models');

async function RegisterAction(userData)
{
    const user = await models.User.create(userData);

    if(user)
    {
        return user;
    }

    return false;
}

module.exports = RegisterAction;