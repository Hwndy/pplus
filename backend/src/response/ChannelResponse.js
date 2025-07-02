const { paginationLinks } = require("../helper/paginate")

function ChannelResource(channel)
{
    return {
        id: channel.id,
        name: channel.name
    }
}

function ChannelCollection(channels)
{
    return {
        channel: channels.data.map(channel => ChannelResource(channel)),
        meta: {
            total: channels.total,
            currentPage: channels.currentPage,
            totalPage: channels.totalPages,
            pageSize: channels.pageSize
        },
        links: paginationLinks('channels', channels.currentPage, channels.totalPages)
    }
}

module.exports = {
    ChannelResource,
    ChannelCollection
}