const { paginate } = require('../../helper/paginate');
const models = require('../../models');

async function FetchAllChannel(page = 1)
{
    pageSize = 10;
    const channel = await paginate(models.Channel, {
        page,
        pageSize
    });

    if(channel)
    {
        return channel;
    }

    return false;
}

module.exports = FetchAllChannel;