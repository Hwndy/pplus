const Joi = require('joi');
const { validationError } = require('../helper/ApiResponse');
const models = require('../models');
const FormatJoiErrors = require('../utils/formatJoiError');

const schema = Joi.object({
    name: Joi.string().required()
});

async function CreatePlacementRequest(req, res, next) {
    const data = req.body;

    const { error, value } = schema.validate(data, { abortEarly: false });

    if (error) {
        return validationError(res, FormatJoiErrors(error.details));
    }

    const existing = await models.Placement.findOne({ where: { name: value.name } });

    if (existing) {
        return validationError(res, 'Placement with this name already exists');
    }

    req.PlacementData = value;
    next();
}

module.exports = CreatePlacementRequest;
