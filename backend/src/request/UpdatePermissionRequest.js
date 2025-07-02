const Joi = require('joi');
const { validationError } = require('../helper/ApiResponse');
const { Op } = require('sequelize');
const models = require('../models');

const schema = Joi.object({
  name: Joi.string().min(1).required(),
});

async function UpdatePermissionRequest(req, res, next) {
  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return validationError(res, error.details.map((err) => err.message));
  }

  const exists = await models.Permission.findOne({
    where: { name: value.name, id: { [Op.ne]: req.params.id } },
  });

  if (exists) {
    return validationError(res, 'Permission name already exists in the database');
  }

  req.PermissionData = value;
  next();
}

module.exports = UpdatePermissionRequest;
