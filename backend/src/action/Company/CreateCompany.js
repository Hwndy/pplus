const models = require('../../models');

async function CreateCompany(CompanyData, SubsidiaryData)
{
    console.log(SubsidiaryData);
    const company = await models.Company.create(CompanyData)

    if(company)
    {
        if(SubsidiaryData)
        {
            await Promise.all(SubsidiaryData.map(async (s) => {
                s.company_id = company.id;
                await models.Subsidiary.create(s);
            }));
        }

        return true;
    }

    return false;
}

module.exports = CreateCompany;