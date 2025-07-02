const models = require('../../models');

async function FetchSinglePlacement(id)
{
    const placement = await models.Placement.findByPk(id);

    if(placement)
    {
        return placement;
    }

    return false;
}

module.exports = FetchSinglePlacement;