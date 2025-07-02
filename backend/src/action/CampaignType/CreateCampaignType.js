const models = require('../../models');

async function CreateCampaignType(data)
{
    const campaignType = await models.CampaignType.create(data);

    if(campaignType)
    {
        return true;
    }

    return false;
}

module.exports = CreateCampaignType;