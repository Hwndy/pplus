const CreateCampaignType = require("../action/CampaignType/CreateCampaignType");
const DeleteCampaignType = require("../action/CampaignType/DeleteCampaignType");
const FetchAllCampaignType = require("../action/CampaignType/FetchAllCampaignType");
const FetchSingleCampaignType = require("../action/CampaignType/FetchSingleCampaignType");
const UpdateCampaignType = require("../action/CampaignType/UpdateCampaignType");
const { success, error } = require("../helper/ApiResponse");
const { CampaignTypeCollection, CampaignTypeResource } = require("../response/CampaignType");

async function index(req, res)
{
    if(campaignType = await FetchAllCampaignType(req.query.page))
    {
        return success(res, CampaignTypeCollection(campaignType), 'All CampaignTypes');
    }

    return success(res, {}, 'No CampaignType found');
}

async function show(req, res)
{
    if(campaignType = await FetchSingleCampaignType(req.params.id))
    {
        return success(res, CampaignTypeResource(campaignType), 'Single CampaignType');
    }

    return error(res, 'CampaignType Not found');
}

async function store(req, res)
{
    if(await CreateCampaignType(req.CampaignTypeData))
    {
        return success(res, {}, 'CampaignType Created');
    }

    return error(res, 'Cannot create CampaignType');
}

async function update(req, res)
{
    if(await UpdateCampaignType(req.params.id, req.CampaignTypeData))
    {
        return success(res, {}, 'CampaignType Updated');
    }

    return error(res, 'CampaignType not found');
}

async function destroy(req, res)
{
    if(await DeleteCampaignType(req.params.id))
    {
        return success(res, {}, 'CampaignType Deleted');
    }

    return error(res, 'CampaignType not found');
}

module.exports = {
    index,
    show,
    store,
    update,
    destroy
}