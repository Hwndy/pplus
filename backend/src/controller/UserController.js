const RegisterAction = require("../action/Auth/RegisterAction");
const DeleteUser = require("../action/User/DeleteUser");
const FetchAllUser = require("../action/User/FetchAllUser");
const FetchSingleUser = require("../action/User/FetchSingleUser");
const UpdateUser = require("../action/User/UpdateUser");
const { success, error } = require("../helper/ApiResponse");
const { UserResource, UserCollection } = require("../response/UserResponse");

async function index(req, res)
{
    if(users = await FetchAllUser(req.query.page))
    {
        return success(res, UserCollection(users), 'All Users');
    }

    return success(res, {}, 'No user found');
}

async function store(req, res)
{
    if(await RegisterAction(req.UserData))
    {
        return success(res, {}, "User Created");
    }

    return error(res, 'Cannot Create user');
}

async function update(req, res)
{
    if(await UpdateUser(req.params.id, req.UserData))
    {
        return success(res, {}, 'User Update');
    }

    return error(res, 'User does not exist');
}

async function show(req, res)
{
    if(user = await FetchSingleUser(req.params.id))
    {
        return success(res, UserResource(user), 'User fetched');
    }

    return error(res, 'User not found');
}

async function destroy(req, res)
{
    if(await DeleteUser(req.params.id))
    {
        return success(res, {}, 'User Deleted');
    }

    return error(res, 'User does not exist');
}

module.exports = {
    index,
    store,
    update,
    show,
    destroy
}