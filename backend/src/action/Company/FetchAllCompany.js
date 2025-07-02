const { paginate } = require('../../helper/paginate');
const models = require('../../models');

async function FetchAllCompany(page = 1)
{
    pageSize = 10;

    const company = await paginate(models.Company, {
      page,
      pageSize,
      include: [
        {
          model: models.Subsidiary,
          as: "subsidiary",
          include: [
            {
                model: models.Company,
                as: 'company'
            }
          ]
        },
        
      ],
    });

    if(company)
    {
        // console.log(company);
        return company;
    }

    return false;


}

module.exports = FetchAllCompany;