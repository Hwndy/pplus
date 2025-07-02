const Joi = require('joi');
const { validationError } = require('../helper/ApiResponse');
const models = require('../models');
const FormatJoiErrors = require('../utils/formatJoiError');

const schema = Joi.object({
    name: Joi.string().required()
});

async function CreateNatureRequest(req, res, next) {
    const data = req.body;

    const { error, value } = schema.validate(data, { abortEarly: false });

    if (error) {
        return validationError(res, FormatJoiErrors(error.details));
    }

    const existing = await models.Nature.findOne({ where: { name: value.name } });

    if (existing) {
        return validationError(res, 'Nature with this name already exists');
    }

    req.NatureData = value;
    next();
}

module.exports = CreateNatureRequest;
