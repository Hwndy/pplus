const CreatePlacement = require("../action/Placement/CreatePlacement");
const DeletePlacement = require("../action/Placement/DeletePlacement");
const FetchAllPlacement = require("../action/Placement/FetchPlacement");
const FetchSinglePlacement = require("../action/Placement/FetchSinglePlacement");
const UpdatePlacement = require("../action/Placement/UpdatePlacement");
const { success, error } = require("../helper/ApiResponse");
const { PlacementCollection, PlacementResource } = require("../response/PlacementResponse");

async function index(req, res)
{
    if(placement = await FetchAllPlacement(req.query.page))
    {
        return success(res, PlacementCollection(placement), 'All Placements');
    }

    return success(res, {}, 'No placement found');
}

async function show(req, res)
{
    if(placement = await FetchSinglePlacement(req.params.id))
    {
        return success(res, PlacementResource(placement), 'Single Placement');
    }

    return error(res, 'placement Not found');
}

async function store(req, res)
{
    if(await CreatePlacement(req.PlacementData))
    {
        return success(res, {}, 'Placement Created');
    }

    return error(res, 'Cannot create placement');
}

async function update(req, res)
{
    if(await UpdatePlacement(req.params.id, req.PlacementData))
    {
        return success(res, {}, 'placement Updated');
    }

    return error(res, 'placement not found');
}

async function destroy(req, res)
{
    if(await DeletePlacement(req.params.id))
    {
        return success(res, {}, 'placement Deleted');
    }

    return error(res, 'placement not found');
}

module.exports = {
    index,
    show,
    store,
    update,
    destroy
}