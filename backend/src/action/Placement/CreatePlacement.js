const models = require('../../models');

async function CreatePlacement(data)
{
    const placement = await models.Placement.create(data);

    if(placement)
    {
        return true;
    }

    return false;
}

module.exports = CreatePlacement;