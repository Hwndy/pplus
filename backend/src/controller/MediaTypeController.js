const CreateMediaType = require("../action/MediaType/CreateMediaType");
const DeleteMediaType = require("../action/MediaType/DeleteMediaType");
const FetchAllMediaType = require("../action/MediaType/FetchAllMediaType");
const FetchSingleMediaType = require("../action/MediaType/FetchSingleMediaType");
const UpdateMediaType = require("../action/MediaType/UpdateMediaType");
const { success, error } = require("../helper/ApiResponse");
const { MediaTypeCollection, MediaTypeResource } = require("../response/MediaTypeResponse");

async function index(req, res)
{
    if(type = await FetchAllMediaType(req.query.page))
    {
        return success(res, MediaTypeCollection(type), 'All Media Types');
    }

    return success(res, {}, 'No type found');
}

async function show(req, res)
{
    if(type = await FetchSingleMediaType(req.params.id))
    {
        return success(res, MediaTypeResource(type), 'Single Media Type');
    }

    return error(res, 'type Not found');
}

async function store(req, res)
{
    if(await CreateMediaType(req.MediaTypeData))
    {
        return success(res, {}, 'Media Type Created');
    }

    return error(res, 'Cannot create type');
}

async function update(req, res)
{
    if(await UpdateMediaType(req.params.id, req.MediaTypeData))
    {
        return success(res, {}, 'type Updated');
    }

    return error(res, 'type not found');
}

async function destroy(req, res)
{
    if(await DeleteMediaType(req.params.id))
    {
        return success(res, {}, 'type Deleted');
    }

    return error(res, 'type not found');
}

module.exports = {
    index,
    show,
    store,
    update,
    destroy
}