const models = require('../../models');

async function FetchSingleNature(id)
{
    const nature = await models.Nature.findByPk(id);

    if(nature)
    {
        return nature;
    }

    return false;
}

module.exports = FetchSingleNature;