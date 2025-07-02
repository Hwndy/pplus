const LoginAction = require("../action/Auth/LoginAction");
const { success, error } = require("../helper/ApiResponse");

async function LoginController(req, res)
{
    if(user = await LoginAction(req.UserData))
    {
        return success(res, user);
    }

    return error(res, 'Invalid email or password');
}

module.exports = LoginController;