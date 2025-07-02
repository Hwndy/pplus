const models = require('../../models');

async function FetchSingleMediaType(id)
{
    console.log(true);
    const type = await models.MediaType.findByPk(id);

    if(type)
    {
        return type;
    }

    return false;
}

module.exports = FetchSingleMediaType;