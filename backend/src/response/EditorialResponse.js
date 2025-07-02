const { paginationLinks } = require("../helper/paginate")
const { CompanyResource } = require("./CompanyResponse")
const { MediaTypeResource } = require("./MediaTypeResponse")
const { PlacementResource } = require("./PlacementResponse")
const { PublicationResource } = require("./PublicationResponse")

function EditorialResource(editorial)
{
    return {
        id: editorial.id,
        date: editorial.date,
        media_type: editorial.mediaType_data,
        company: editorial.company_data,
        brand: editorial.brand,
        industry: editorial.industry,
        sub_sector: editorial.sub_sector,
        publication: editorial.publication_data,
        placement: editorial.placement_data,
        title: editorial.title,
        page_number: editorial.page_number,
        link: editorial.link,
        reporter: editorial.reporter,
        country: editorial.country,
        spokesperson: editorial.spokesperson,
        activity: editorial.activity_data,
        sentiment: editorial.sentiment,
        media_sentiment_index: editorial.media_sentiment_index,
        advert_spend: editorial.advert_spend,
        circulation: editorial.circulation,
        page_size: editorial.page_size    
    }
}

function EditorialCollection(editorials)
{
    return {
        editorial: editorials.data.map(editorial => EditorialResource(editorial)),
        meta: {
            total: editorials.total,
            currentPage: editorials.currentPage,
            totalPage: editorials.totalPages,
            pageSize: editorials.pageSize
        },
        links: paginationLinks('editorials', editorials.currentPage, editorials.totalPages)
    }
}

module.exports = {
    EditorialResource,
    EditorialCollection
}