const Joi = require('joi');
const { validationError } = require('../helper/ApiResponse');
const models = require('../models');
const { Op } = require('sequelize');

const schema = Joi.object({
  name: Joi.string().min(1).required(),
});

async function UpdatePublicationRequest(req, res, next) {
  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return validationError(res, error.details.map((err) => err.message));
  }

  const existing = await models.Publication.findOne({
    where: { name: value.name, id: { [Op.ne]: req.params.id } },
  });

  if (existing) {
    return validationError(res, 'Publication with this name already exists');
  }

  req.PublicationData = value;
  next();
}

module.exports = UpdatePublicationRequest;
