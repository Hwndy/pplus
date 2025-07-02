const Joi = require('joi');
const { validationError } = require('../helper/ApiResponse');
const models = require('../models');
const FormatJoiErrors = require('../utils/formatJoiError');

const schema = Joi.object({
    date: Joi.date().required(),
    media_type: Joi.number().required(),
    company: Joi.number().required(),
    brand: Joi.string().optional(),
    industry: Joi.string().optional(),
    sub_sector: Joi.string().optional(),
    publication: Joi.number().required(),
    placement: Joi.number().required(),
    title: Joi.string().required(),
    page_number: Joi.number().optional(),
    link: Joi.string().optional(),
    reporter: Joi.string().optional(),
    country: Joi.string().optional(),
    spokesperson: Joi.string().optional(),
    activity: Joi.number().required(),
    sentiment: Joi.string().required(),
    media_sentiment_index: Joi.number().optional(),
    advert_spend: Joi.number().optional(),
    circulation: Joi.number().optional(),
    page_size: Joi.string().optional()
});

async function updateEditorialRequest(req, res, next) {
    const data = req.body;

    const { error, value } = schema.validate(data, { abortEarly: false });

    if (error) {
        return validationError(res, FormatJoiErrors(error.details));
    }

    const { media_type, company, publication, placement, activity } = value;

    const [mediaType, companyData, publicationData, placementData, activityData] = await Promise.all([
        models.MediaType.findByPk(media_type),
        models.Company.findByPk(company),
        models.Publication.findByPk(publication),
        models.Placement.findByPk(placement),
        models.Activity.findByPk(activity)
    ]);

    if (!mediaType) {
            return validationError(res, 'Media type does not exist.');
        }

        if (!companyData) {
            return validationError(res, 'Company does not exist.');
        }

        if (!publicationData) {
            return validationError(res, 'Publication does not exist.');
        }

        if (!placementData) {
            return validationError(res, 'Placement does not exist.');
        }

        if (!activityData) {
            return validationError(res, 'Activity does not exist.');
        }

    req.EditorialData = value;
    next();
}

module.exports = updateEditorialRequest;
