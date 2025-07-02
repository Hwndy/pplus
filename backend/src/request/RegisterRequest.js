const Joi = require('joi');
const { validationError } = require('../helper/ApiResponse');
const models = require('../models');
const FormatJoiErrors = require('../utils/formatJoiError');

const schema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    gender: Joi.string().required(),
    active: Joi.boolean().required(),
    role_id: Joi.number().required(),
    password: Joi.string().min(8).required(),
});

async function RegisterRequest(req, res, next) {
    const data = req.body;

    const { error, value } = schema.validate(data, { abortEarly: false });

    if (error) {
        return validationError(res, FormatJoiErrors(error.details));
    }

    const email = await models.User.findOne({ where: { email: value.email } });

    if (email) {
        return validationError(res, 'Email already exists');
    }

    const role = await models.Role.findByPk(parseInt(value.role_id));

    if (!role) {
        return validationError(res, 'Selected role is not valid');
    }

    req.UserData = value;
    next();
}

module.exports = RegisterRequest;
