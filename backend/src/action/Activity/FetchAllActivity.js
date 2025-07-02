const { paginate } = require('../../helper/paginate');
const models = require('../../models');

async function FetchAllActivity(page = 1)
{
    pageSize = 10;
    const activity = await paginate(models.Activity, {
        page,
        pageSize
    });

    if(activity)
    {
        return activity;
    }

    return false;
}

module.exports = FetchAllActivity;