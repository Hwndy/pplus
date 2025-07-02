const Joi = require('joi');
const { validationError } = require('../helper/ApiResponse');
const models = require('../models');
const { Op } = require('sequelize');
const FormatJoiErrors = require('../utils/formatJoiError');

const schema = Joi.object({
    name: Joi.string().required(),
});

async function UpdatePlacementRequest(req, res, next) {
    const data = req.body;

    const { error, value } = schema.validate(data, { abortEarly: false });

    if (error) {
        return validationError(res, FormatJoiErrors(error.details));
    }

    const existing = await models.Placement.findOne({
        where: { name: value.name, id: { [Op.ne]: req.params.id } },
    });

    if (existing) {
        return validationError(res, 'Placement with this name already exists');
    }

    req.PlacementData = value;
    next();
}

module.exports = UpdatePlacementRequest;
