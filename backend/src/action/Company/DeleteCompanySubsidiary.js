const models = require('../../models');

async function DeleteCompanySubsidiary(id, subsidiaryId)
{
    const subsidiary = await models.Subsidiary.findOne({
        where: {
            company_id: id,
            id: subsidiaryId
        }
    });

    if(subsidiary)
    {
        return subsidiary.destroy();
    }

    return false;
}

module.exports = DeleteCompanySubsidiary;