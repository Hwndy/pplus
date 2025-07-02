const CreateEditorial = require("../action/Editorial/CreateEditorial");
const DeleteEditorial = require("../action/Editorial/DeleteEditorial");
const FetchAllEditorial = require("../action/Editorial/FetchAllEditorial");
const FetchSingleEditorial = require("../action/Editorial/FetchSingleEditorial");
const UpdateEditorial = require("../action/Editorial/UpdateEditorial");
const { success, error } = require("../helper/ApiResponse");
const { EditorialCollection, EditorialResource } = require("../response/EditorialResponse");

async function index(req, res)
{
    if(editorial = await FetchAllEditorial(req.query.page))
    {
        return success(res, EditorialCollection(editorial), 'All Editorials');
    }

    return success(res, {}, 'No editorial found');
}

async function show(req, res)
{
    if(editorial = await FetchSingleEditorial(req.params.id))
    {
        return success(res, EditorialResource(editorial), 'Single Editorial');
    }

    return error(res, 'editorial Not found');
}

async function store(req, res)
{
    if(await CreateEditorial(req.EditorialData))
    {
        return success(res, {}, 'Editorial Created');
    }

    return error(res, 'Cannot create editorial');
}

async function update(req, res)
{
    if(await UpdateEditorial(req.params.id, req.EditorialData))
    {
        return success(res, {}, 'editorial Updated');
    }

    return error(res, 'editorial not found');
}

async function destroy(req, res)
{
    if(await DeleteEditorial(req.params.id))
    {
        return success(res, {}, 'editorial Deleted');
    }

    return error(res, 'editorial not found');
}

module.exports = {
    index,
    show,
    store,
    update,
    destroy
}