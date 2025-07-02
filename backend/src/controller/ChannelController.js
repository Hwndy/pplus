const CreateChannel = require("../action/Channel/CreateChannel");
const DeleteChannel = require("../action/Channel/DeleteChannel");
const FetchAllChannel = require("../action/Channel/FetchAllChannel");
const FetchSingleChannel = require("../action/Channel/FetchSingleChannel");
const UpdateChannel = require("../action/Channel/UpdateChannel");
const { success, error } = require("../helper/ApiResponse");
const { ChannelCollection, ChannelResource } = require("../response/ChannelResponse");

async function index(req, res)
{
    if(channel = await FetchAllChannel(req.query.page))
    {
        return success(res, ChannelCollection(channel), 'All Channels');
    }

    return success(res, {}, 'No Channel found');
}

async function show(req, res)
{
    if(channel = await FetchSingleChannel(req.params.id))
    {
        return success(res, ChannelResource(channel), 'Single Channel');
    }

    return error(res, 'Channel Not found');
}

async function store(req, res)
{
    if(await CreateChannel(req.ChannelData))
    {
        return success(res, {}, 'Channel Created');
    }

    return error(res, 'Cannot create Channel');
}

async function update(req, res)
{
    if(await UpdateChannel(req.params.id, req.ChannelData))
    {
        return success(res, {}, 'Channel Updated');
    }

    return error(res, 'Channel not found');
}

async function destroy(req, res)
{
    if(await DeleteChannel(req.params.id))
    {
        return success(res, {}, 'Channel Deleted');
    }

    return error(res, 'Channel not found');
}

module.exports = {
    index,
    show,
    store,
    update,
    destroy
}