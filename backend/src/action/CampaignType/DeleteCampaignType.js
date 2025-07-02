const models = require('../../models');

async function DeleteCampaignType(id)
{
    const campaignType = await models.CampaignType.findByPk(id);

    if(campaignType)
    {
        return await campaignType.destroy();
    }

    return false;
}

module.exports = DeleteCampaignType;