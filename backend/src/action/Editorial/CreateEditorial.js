const models = require('../../models');

async function CreateEditorial(data)
{
    const editorial = await models.Editorial.create(data);

    if(editorial)
    {
        return true;
    }

    return false;
}

module.exports = CreateEditorial;