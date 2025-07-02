const { error } = require("../helper/ApiResponse");
const models = require("../models");
const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next) {
  let token;

  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_KEY);

      if (!decoded.userId) {
        return error(res, "invalid token. Authentication failed.");
      }

      const user = await models.User.findByPk(decoded?.userId, {include : [{model: models.Role, as: 'role'}]});
        req.UserData = user;
        

        next();
        return;
    } catch (err) {
      return error(res, err.message);
    }
  }

  return error(res, "invalid token. Authentication failed.");
}

module.exports = authMiddleware;
