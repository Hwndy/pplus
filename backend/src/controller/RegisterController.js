const RegisterAction = require("../action/Auth/RegisterAction");
const { success, error } = require("../helper/ApiResponse");

async function RegisterController(req, res)
{
    if(await RegisterAction(req.UserData))
    {
        return success(res, {}, 'User registered');
    }

    return error(res, 'Cannot register user');
}

module.exports = RegisterController;