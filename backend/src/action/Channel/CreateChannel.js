const models = require('../../models');

async function CreateChannel(data)
{
    const channel = await models.Channel.create(data);

    if(channel)
    {
        return true;
    }

    return false;
}

module.exports = CreateChannel;