const models = require('../../models');

async function FetchSingleRole(id)
{
    const role = await models.Role.findByPk(id);
    
    if(role)
    {
        return role; 
    }

    return false;
}

module.exports = FetchSingleRole;