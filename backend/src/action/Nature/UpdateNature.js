const models = require('../../models');

async function UpdateNature(id, data)
{
    const nature = await models.Nature.findByPk(id);

    if(nature)
    {
        return nature.update(data);
    }

    return false;
}

module.exports = UpdateNature;