const { paginationLinks } = require("../helper/paginate")

function CampaignTypeResource(campaignType)
{
    return {
        id: campaignType.id,
        name: campaignType.name
    }
}

function CampaignTypeCollection(campaignTypes)
{
    return {
        campaignType: campaignTypes.data.map(campaignType => CampaignTypeResource(campaignType)),
        meta: {
            total: campaignTypes.total,
            currentPage: campaignTypes.currentPage,
            totalPage: campaignTypes.totalPages,
            pageSize: campaignTypes.pageSize
        },
        links: paginationLinks('campaign-types', campaignTypes.currentPage, campaignTypes.totalPages)
    }
}

module.exports = {
    CampaignTypeResource,
    CampaignTypeCollection
}