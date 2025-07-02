const models = require('../../models');

async function CreateMediaType(data)
{
    const type = await models.MediaType.create(data);

    if(type)
    {
        return true;
    }

    return false;
}

module.exports = CreateMediaType;