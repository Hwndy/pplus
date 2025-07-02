const { paginationLinks } = require("../helper/paginate");
const SubsidiaryArray = require("./SubsidiaryResponse");

function CompanyResource(company)
{
    return {
        id: company.id,
        name: company.name,
        industry: company.industry,
        sub_industry: company.sub_industry,
        address: company.address,
        subsidiary: company.subsidiary ? SubsidiaryArray(company.subsidiary) : [],
        state: company.state,
        country: company.country,
        contact: company.contact,
        ceo: company.ceo,
        phone_no: company.phone_no,
        website: company.website,
        facebook_link: company.facebook_link,
        instagram_link: company.instagram_link,
        twitter_link: company.twitter_link,
        linkedin_link: company.linkedin_link,
        youtube_link: company.youtube_link
    };
}

function CompanyCollection(companies)
{
    return {
        data: companies.data.map(company => CompanyResource(company)),
        meta: {
            total: companies.total,
            currentPage: companies.currentPage,
            totalPage: companies.totalPages,
            pageSize: companies.pageSize
        },
        links: paginationLinks('companies', companies.currentPage, companies.totalPages)
    }
}

module.exports = {
    CompanyResource,
    CompanyCollection
}