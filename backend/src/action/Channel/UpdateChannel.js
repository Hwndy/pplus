const models = require('../../models');

async function UpdateChannel(id, data)
{
    const channel = await models.Channel.findByPk(id);

    if(channel)
    {
        return channel.update(data);
    }

    return false;
}

module.exports = UpdateChannel;