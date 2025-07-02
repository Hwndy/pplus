const Joi = require('joi');
const { validationError } = require('../helper/ApiResponse');
const models = require('../models');

const schema = Joi.object({
    name: Joi.string().required(),
    industry: Joi.string().required(),
    sub_industry: Joi.string().required(),
    address: Joi.string().required(),
    subsidiaries: Joi.array().items(
        Joi.object({
            prefix: Joi.string().optional(),
            subsidiary_id: Joi.number().optional(),
        })
    ).optional(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    email: Joi.string().email().required(),
    contact: Joi.string().required(),
    ceo: Joi.string().required(),
    phone_no: Joi.string().required(),
    website: Joi.string().required(),
    facebook_link: Joi.string().optional(),
    instagram_link: Joi.string().optional(),
    twitter_link: Joi.string().optional(),
    linkedin_link: Joi.string().optional(),
    youtube_link: Joi.string().optional(),
});

async function UpdateCompanyRequest(req, res, next) {
    const data = req.body;

    const { error, value } = schema.validate(data, { abortEarly: false });

    if (error) {
        return validationError(res, error.details.map(e => e.message));
    }

    if (value.subsidiaries) {
        const ids = value.subsidiaries.map(s => s.subsidiary_id);
        const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);

        if (duplicates.length > 0) {
            return validationError(res, 'Duplicate subsidiaries selected');
        }

        const DBduplicates = await Promise.all(ids.map(async id => {
            return await models.Subsidiary.findOne({ where: { subsidiary_id: id, company_id: req.params.id } });
        }));

        if (DBduplicates.some(s => s)) {
            return validationError(res, 'Selected subsidiaries already exist in the database');
        }

        const subsidiary = await Promise.all(value.subsidiaries.map(async s => {
            return await models.Company.findOne({ where: { id: s.subsidiary_id } });
        }));

        if (subsidiary.some(s => !s)) {
            return validationError(res, 'One of the selected subsidiaries does not exist');
        }

        req.SubsidiaryData = value.subsidiaries;
    }

    const { subsidiaries, ...companyData } = value;

    req.CompanyData = companyData;
    next();
}

module.exports = UpdateCompanyRequest;
