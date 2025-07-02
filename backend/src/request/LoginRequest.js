const Joi = require('joi');
const { validationError } = require('../helper/ApiResponse');
const FormatJoiErrors = require('../utils/formatJoiError');

const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
});

async function LoginRequest(req, res, next) {
    const data = req.body;

    const { error, value } = schema.validate(data, { abortEarly: false });

    if (error) {
        return validationError(res, FormatJoiErrors(error.details));
    }

    req.UserData = value;
    next();
}

module.exports = LoginRequest;
