const models = require('../../models');

async function DeleteEditorial(id)
{
    const editorial = await models.Editorial.findByPk(id);

    if(editorial)
    {
        return await editorial.destroy();
    }

    return false;
}

module.exports = DeleteEditorial;