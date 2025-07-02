const models = require('../../models');

async function DeletePlacement(id)
{
    const placement = await models.Placement.findByPk(id);

    if(placement)
    {
        return await placement.destroy();
    }

    return false;
}

module.exports = DeletePlacement;