const Joi = require('joi');
const { validationError } = require('../helper/ApiResponse');
const models = require('../models');
const FormatJoiErrors = require('../utils/formatJoiError');

const schema = Joi.object({
    name: Joi.string().required(),
    permission: Joi.array().items(Joi.number()).required()
});

async function CreateRoleRequest(req, res, next) {
    const data = req.body;

    const { error, value } = schema.validate(data, { abortEarly: false });

    if (error) {
        return validationError(res, FormatJoiErrors(error.details));
    }

    if (await models.Role.findOne({ where: { name: value.name } })) {
        return validationError(res, 'This role already exists');
    }

    const { permission, ...role } = value;

    if (permission) {
        const isValid = await Promise.all(permission.map(async (p) => {
            return await models.Permission.findByPk(p);
        }));

        if (isValid.some((s) => !s)) {
            return validationError(res, 'One of the selected permissions is invalid');
        }
    }

    req.Permission = permission;
    req.RoleData = role;
    next();
}

module.exports = CreateRoleRequest;
