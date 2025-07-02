const models = require('../../models');

async function CreateNature(data)
{
    const nature = await models.Nature.create(data);

    if(nature)
    {
        return true;
    }

    return false;
}

module.exports = CreateNature;