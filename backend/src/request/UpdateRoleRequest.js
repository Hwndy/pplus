const Joi = require('joi');
const { Op } = require('sequelize');
const { validationError } = require('../helper/ApiResponse');
const models = require('../models');

const schema = Joi.object({
  name: Joi.string().min(1).required(),
  permission: Joi.array().items(Joi.number()).optional(),
});

async function UpdateRoleRequest(req, res, next) {
  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return validationError(res, error.details.map((err) => err.message));
  }

  if (await models.Role.findOne({ where: { name: value.name, id: { [Op.ne]: req.params.id } } })) {
    return validationError(res, 'This role already exists');
  }

  const { permission, ...role } = value;

  if (permission) {
    const isValid = await Promise.all(permission.map(async (p) => models.Permission.findByPk(p)));

    if (isValid.some((s) => !s)) {
      return validationError(res, 'One of the selected permissions is invalid');
    }

    const DBduplicates = await Promise.all(
      permission.map(async (p) =>
        models.RolesPermissions.findOne({ where: { role_id: req.params.id, permission_id: p } })
      )
    );

    if (DBduplicates.some((s) => s)) {
      return validationError(res, 'The selected permission is already assigned to this role.');
    }
  }

  req.Permission = permission;
  req.RoleData = role;
  next();
}

module.exports = UpdateRoleRequest;
