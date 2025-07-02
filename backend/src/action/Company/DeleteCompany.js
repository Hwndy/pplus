const models = require('../../models');

async function DeleteCompany(id)
{
    const company = await models.Company.findByPk(id);

    if(company)
    {
        const subsidiary = await models.Subsidiary.findAll({where: {company_id: company.id}});

        if(subsidiary.length > 0)
        {
            await Promise.all(subsidiary.map(async (s) => {
                await s.destroy();
            }));
        }

        return company.destroy();
    }

    return false;
}

module.exports = DeleteCompany;