const models = require('../../models');

async function DeleteNature(id)
{
    const nature = await models.Nature.findByPk(id);

    if(nature)
    {
        return await nature.destroy();
    }

    return false;
}

module.exports = DeleteNature;