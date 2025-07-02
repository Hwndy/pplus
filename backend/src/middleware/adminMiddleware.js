const { error } = require("../helper/ApiResponse");

function adminMiddleware(req, res, next)
{
    if(req.UserData.role.name !== 'Company')
    {
        return error(res, 'User not authorized');
    }

    next();
}

module.exports = adminMiddleware;