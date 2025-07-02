const models = require('../../models');

async function FetchSingleChannel(id)
{
    const channel = await models.Channel.findByPk(id);

    if(channel)
    {
        return channel;
    }

    return false;
}

module.exports = FetchSingleChannel;