const FetchAllPermission = require("../action/Permission/FetchAllPermission");
const FetchSinglePermission = require("../action/Permission/FetchSinglePermission");
const CreatePermission = require("../action/Permission/CreatePermission");
const UpdatePermission = require("../action/Permission/UpdatePermission");
const DeletePermission = require("../action/Permission/DeletePermission");
const { success, error } = require('../helper/ApiResponse');
const { PermissionCollection, PermissionResource } = require("../response/PermissionResponse");

async function index(req, res)
{
    if(permission = await FetchAllPermission(req.query.page))
    {
        return success(res, PermissionCollection(permission), 'All Permission');
    }

    return success(res, {}, 'No Permission found');
}

async function show(req, res)
{
    if(permission = await FetchSinglePermission(req.params.id))
    {
        return success(res, PermissionResource(permission), 'Single Permission');
    }

    return error(res, 'Permission not found');
}

async function store(req, res)
{
    if(await CreatePermission(req.PermissionData))
    {
        return success(res, {}, 'Permission Created');
    }

    return error(res, 'Problem Creating Permission');
}

async function update(req, res)
{
    if(await UpdatePermission(req.params.id, req.PermissionData))
    {
        return success(res, {}, 'Permission Updated');
    }

    return error(res, 'Permission not found');
}

async function destroy(req, res)
{
    if(await DeletePermission(req.params.id))
    {
        return success(res, {}, 'Permission Deleted');
    }

    return error(res, 'Permission not found');
}

module.exports = {
    index,
    show,
    store,
    update,
    destroy
}