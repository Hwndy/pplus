const Joi = require('joi');
const { validationError } = require('../helper/ApiResponse');
const models = require('../models');
const { Op } = require('sequelize');

const schema = Joi.object({
    name: Joi.string().min(1).required(),
});

async function UpdateNatureRequest(req, res, next) {
    const data = req.body;

    const { error, value } = schema.validate(data, { abortEarly: false });

    if (error) {
        return validationError(res, error.details.map(e => e.message));
    }

    const existing = await models.Nature.findOne({
        where: { name: value.name, id: { [Op.ne]: req.params.id } },
    });

    if (existing) {
        return validationError(res, 'Nature with this name already exists');
    }

    req.NatureData = value;
    next();
}

module.exports = UpdateNatureRequest;
