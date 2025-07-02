const { paginate } = require('../../helper/paginate');
const models = require('../../models');

async function FetchAllCampaignType(page = 1)
{
    pageSize = 10;
    const campaignType = await paginate(models.CampaignType, {
        page,
        pageSize
    });

    if(campaignType)
    {
        return campaignType;
    }

    return false;
}

module.exports = FetchAllCampaignType;