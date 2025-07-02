const CreatePublication = require("../action/Publication/CreatePublication");
const DeletePublication = require("../action/Publication/DeletePublication");
const FetchAllPublication = require("../action/Publication/FetchAllPublication");
const FetchSinglePublication = require("../action/Publication/FetchSinglePublication");
const UpdatePublication = require("../action/Publication/UpdatePublication");
const { success, error } = require("../helper/ApiResponse");
const { PublicationCollection, PublicationResource } = require("../response/PublicationResponse");

async function index(req, res)
{
    if(publication = await FetchAllPublication(req.query.page))
    {
        return success(res, PublicationCollection(publication), 'All Publications');
    }

    return success(res, {}, 'No Publication found');
}

async function show(req, res)
{
    if(publication = await FetchSinglePublication(req.params.id))
    {
        return success(res, PublicationResource(publication), 'Single Publication');
    }

    return error(res, 'Publication Not found');
}

async function store(req, res)
{
    if(await CreatePublication(req.PublicationData))
    {
        return success(res, {}, 'Publication Created');
    }

    return error(res, 'Cannot create publication');
}

async function update(req, res)
{
    if(await UpdatePublication(req.params.id, req.PublicationData))
    {
        return success(res, {}, 'Publication Updated');
    }

    return error(res, 'Publication not found');
}

async function destroy(req, res)
{
    if(await DeletePublication(req.params.id))
    {
        return success(res, {}, 'Publication Deleted');
    }

    return error(res, 'Publication not found');
}

module.exports = {
    index,
    show,
    store,
    update,
    destroy
}