const models = require('../../models');

async function DeleteChannel(id)
{
    const channel = await models.Channel.findByPk(id);

    if(channel)
    {
        return await channel.destroy();
    }

    return false;
}

module.exports = DeleteChannel;