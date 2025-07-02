const models = require('../../models');

async function DeleteActivity(id)
{
    const activity = await models.Activity.findByPk(id);

    if(activity)
    {
        return await activity.destroy();
    }

    return false;
}

module.exports = DeleteActivity;