const { paginate } = require('../../helper/paginate');
const models = require('../../models');

async function FetchAllPlacement(page = 1)
{
    pageSize = 10;
    const placement = await paginate(models.Placement, {
        page,
        pageSize
    });

    if(placement)
    {
        return placement;
    }

    return false;
}

module.exports = FetchAllPlacement;