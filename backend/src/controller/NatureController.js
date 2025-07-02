const CreateNature = require("../action/Nature/CreateNature");
const DeleteNature = require("../action/Nature/DeleteNature");
const FetchAllNature = require("../action/Nature/FetchAllNature");
const FetchSingleNature = require("../action/Nature/FetchSingleNature");
const UpdateNature = require("../action/Nature/UpdateNature");
const { success, error } = require("../helper/ApiResponse");
const { NatureCollection, NatureResource } = require("../response/NatureResponse");

async function index(req, res)
{
    if(nature = await FetchAllNature(req.query.page))
    {
        return success(res, NatureCollection(nature), 'All Natures');
    }

    return success(res, {}, 'No Nature found');
}

async function show(req, res)
{
    if(nature = await FetchSingleNature(req.params.id))
    {
        return success(res, NatureResource(nature), 'Single Nature');
    }

    return error(res, 'Nature Not found');
}

async function store(req, res)
{
    if(await CreateNature(req.NatureData))
    {
        return success(res, {}, 'Nature Created');
    }

    return error(res, 'Cannot create Nature');
}

async function update(req, res)
{
    if(await UpdateNature(req.params.id, req.NatureData))
    {
        return success(res, {}, 'Nature Updated');
    }

    return error(res, 'Nature not found');
}

async function destroy(req, res)
{
    if(await DeleteNature(req.params.id))
    {
        return success(res, {}, 'Nature Deleted');
    }

    return error(res, 'Nature not found');
}

module.exports = {
    index,
    show,
    store,
    update,
    destroy
}