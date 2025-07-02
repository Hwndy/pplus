const models = require('../../models');

async function UpdateActivity(id, data)
{
    const activity = await models.Activity.findByPk(id);

    if(activity)
    {
        return activity.update(data);
    }

    return false;
}

module.exports = UpdateActivity;