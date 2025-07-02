const CreateActivity = require("../action/Activity/CreateActivity");
const DeleteActivity = require("../action/Activity/DeleteActivity");
const FetchAllActivity = require("../action/Activity/FetchAllActivity");
const FetchSingleActivity = require("../action/Activity/FetchSingleActivity");
const UpdateActivity = require("../action/Activity/UpdateActivity");
const { error, success } = require("../helper/ApiResponse");
const { ActivityCollection, ActivityResource } = require("../response/ActivityResponse");

async function index(req, res)
{
    if(activity = await FetchAllActivity(req.query.page))
    {
        return success(res, ActivityCollection(activity), 'All Activitys');
    }

    return success(res, {}, 'No Activity found');
}

async function show(req, res)
{
    if(activity = await FetchSingleActivity(req.params.id))
    {
        return success(res, ActivityResource(activity), 'Single Activity');
    }

    return error(res, 'Activity Not found');
}

async function store(req, res)
{
    if(await CreateActivity(req.ActivityData))
    {
        return success(res, {}, 'Activity Created');
    }

    return error(res, 'Cannot create Activity');
}

async function update(req, res)
{
    if(await UpdateActivity(req.params.id, req.ActivityData))
    {
        return success(res, {}, 'Activity Updated');
    }

    return error(res, 'Activity not found');
}

async function destroy(req, res)
{
    if(await DeleteActivity(req.params.id))
    {
        return success(res, {}, 'Activity Deleted');
    }

    return error(res, 'Activity not found');
}

module.exports = {
    index,
    show,
    store,
    update,
    destroy
}