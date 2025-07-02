const Joi = require('joi');
const { validationError } = require('../helper/ApiResponse');
const models = require('../models');
const FormatJoiErrors = require('../utils/formatJoiError');

const schema = Joi.object({
    name: Joi.string().required()
});

async function CreatePermissionRequest(req, res, next) {
    const data = req.body;

    const { error, value } = schema.validate(data, { abortEarly: false });

    if (error) {
        return validationError(res, FormatJoiErrors(error.details));
    }

    if (await models.Permission.findOne({ where: { name: value.name } })) {
        return validationError(res, 'Permission name already exists in the database');
    }

    req.PermissionData = value;
    next();
}

module.exports = CreatePermissionRequest;
