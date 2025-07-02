const models = require('../../models');

async function UpdateCompany(id, companyData, SubsidiaryData)
{
    const company = await models.Company.findByPk(id);

    if(company)
    {
      if (SubsidiaryData) {
        await Promise.all(
          SubsidiaryData.map(async (s) => {
            s.company_id = company.id;
            await models.Subsidiary.create(s);
          })
        );
      }

      await company.update(companyData);
      return true;
    }

    return false;
}

module.exports = UpdateCompany;