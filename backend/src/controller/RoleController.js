const CreateRole = require("../action/Role/CreateRole");
const DeleteRole = require("../action/Role/DeleteRole");
const FetchAllRole = require("../action/Role/FetchAllRole");
const FetchSingleRole = require("../action/Role/FetchSingleRole");
const UpdateRole = require("../action/Role/UpdateRole");
const { success, error } = require("../helper/ApiResponse");
const { RoleCollection, RoleResource } = require("../response/RoleResponse");

async function index(req, res)
{
    if(role = await FetchAllRole(req.query.page))
    {
        return success(res, RoleCollection(role), 'All Roles');
    }

    return success(res, {}, 'No Role Found');
}

async function show(req, res)
{
    if(role = await FetchSingleRole(req.params.id))
    {
        return success(res, RoleResource(role), 'Single Role');
    }

    return error(res, 'Role not found');
}

async function store(req, res)
{
    if(await CreateRole(req.RoleData, req.Permission))
    {
        return success(res, {}, 'Role Created');
    }

    return error(res, 'Cannot create role');
}

async function update(req, res)
{
    if(await UpdateRole(req.params.id, req.RoleData, req.Permission))
    {
        return success(res, {}, 'Role updated');
    }

    return error(res, 'Role not found');
}

async function destroy(req, res)
{
    if(await DeleteRole(req.params.id))
    {
        return success(res, {}, 'Role Deleted');
    }

    return error(res, 'role not found');
}

module.exports = {
    index,
    show,
    store,
    update,
    destroy
}