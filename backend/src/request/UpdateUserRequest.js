const Joi = require('joi');
const models = require('../models');
const { validationError } = require('../helper/ApiResponse');

const schema = Joi.object({
  username: Joi.string().min(1).required(),
  gender: Joi.string().min(1).required(),
  active: Joi.boolean().required(),
  role_id: Joi.number().min(1).required(),
  password: Joi.string().min(1).required(),
});

async function UpdateUserRequest(req, res, next) {
  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return validationError(res, error.details.map((err) => err.message));
  }

  const role = await models.Role.findByPk(parseInt(value.role_id));

  if (!role) {
    return validationError(res, 'Selected Role is not valid');
  }

  req.UserData = value;
  next();
}

module.exports = UpdateUserRequest;
