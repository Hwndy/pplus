const models = require('../../models');

async function UpdateCampaignType(id, data)
{
    const campaignType = await models.CampaignType.findByPk(id);

    if(campaignType)
    {
        return campaignType.update(data);
    }

    return false;
}

module.exports = UpdateCampaignType;