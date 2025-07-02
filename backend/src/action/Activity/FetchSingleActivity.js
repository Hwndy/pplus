const models = require('../../models');

async function FetchSingleActivity(id)
{
    const activity = await models.Activity.findByPk(id);

    if(activity)
    {
        return activity;
    }

    return false;
}

module.exports = FetchSingleActivity;