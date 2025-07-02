const models = require('../../models');

async function UpdateMediaType(id, data)
{
    const type = await models.MediaType.findByPk(id);

    if(type)
    {
        return type.update(data);
    }

    return false;
}

module.exports = UpdateMediaType;