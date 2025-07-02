const models = require('../../models');

async function DeleteMediaType(id)
{
    const type = await models.MediaType.findByPk(id);

    if(type)
    {
        return await type.destroy();
    }

    return false;
}

module.exports = DeleteMediaType;