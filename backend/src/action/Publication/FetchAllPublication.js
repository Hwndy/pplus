const { paginate } = require('../../helper/paginate');
const models = require('../../models');

async function FetchAllPublication(page = 1)
{
    pageSize = 10;
    const publication = await paginate(models.Publication, {
        page,
        pageSize
    });

    if(publication)
    {
        return publication;
    }

    return false;
}

module.exports = FetchAllPublication;