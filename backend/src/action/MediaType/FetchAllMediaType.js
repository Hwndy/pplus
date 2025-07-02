const { paginate } = require('../../helper/paginate');
const models = require('../../models');

async function FetchAllMediaType(page = 1)
{
    pageSize = 10;
    const type = await paginate(models.MediaType, {
        page,
        pageSize
    });

    if(type)
    {
        return type;
    }

    return false;
}

module.exports = FetchAllMediaType;