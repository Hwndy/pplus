const models = require('../../models');

async function UpdateEditorial(id, data)
{
    const editorial = await models.Editorial.findByPk(id);

    if(editorial)
    {
        return editorial.update(data);
    }

    return false;
}

module.exports = UpdateEditorial;