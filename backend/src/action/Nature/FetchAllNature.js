const { paginate } = require('../../helper/paginate');
const models = require('../../models');

async function FetchAllNature(page = 1)
{
    pageSize = 10;
    const nature = await paginate(models.Nature, {
        page,
        pageSize
    });

    if(nature)
    {
        return nature;
    }

    return false;
}

module.exports = FetchAllNature;