const { paginationLinks } = require("../helper/paginate")

function PublicationResource(publication)
{
    return {
        id: publication.id,
        name: publication.name
    }
}

function PublicationCollection(publications)
{
    return {
        publication: publications.data.map(publication => PublicationResource(publication)),
        meta: {
            total: publications.total,
            currentPage: publications.currentPage,
            totalPage: publications.totalPages,
            pageSize: publications.pageSize
        },
        links: paginationLinks('publications', publications.currentPage, publications.totalPages)
    }
}

module.exports = {
    PublicationResource,
    PublicationCollection
}