const models = require('../../models');

async function UpdatePlacement(id, data)
{
    const placement = await models.Placement.findByPk(id);

    if(placement)
    {
        return placement.update(data);
    }

    return false;
}

module.exports = UpdatePlacement;