const generateWebToken = require('../../helper/jwt');
const models = require('../../models');

async function LoginAction(data)
{
    const user = await models.User.findOne({where: {email: data.email},
        include : [
            {
                model: models.Role,
                as: 'role'
            }
        ]
    });

    if(user?.comparePassword(user.password))
    {
        const token = await generateWebToken(user)

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role.name,
            status: user.active ? 'enabled' : 'disabled',
            token: token
        };
    }

    return false;
}

module.exports = LoginAction;