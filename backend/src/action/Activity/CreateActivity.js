const models = require('../../models');

async function CreateActivity(data)
{
    const activity = await models.Activity.create(data);

    if(activity)
    {
        return true;
    }

    return false;
}

module.exports = CreateActivity;