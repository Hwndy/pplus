const models = require('../../models');

async function FetchSingleCampaignType(id)
{
    const campaignType = await models.CampaignType.findByPk(id);

    if(campaignType)
    {
        return campaignType;
    }

    return false;
}

module.exports = FetchSingleCampaignType;