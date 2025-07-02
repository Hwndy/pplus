const models = require('../../models');

async function FetchSingleCompany(id)
{
    const company = await models.Company.findByPk(id, {
      include: [
        {
          model: models.Subsidiary,
          as: "subsidiary",
          include: [
            {
              model: models.Company,
              as: "company",
            },
          ],
        },
      ],
    });

    if(company)
    {
        return company;
    }

    return false;
}

module.exports = FetchSingleCompany;