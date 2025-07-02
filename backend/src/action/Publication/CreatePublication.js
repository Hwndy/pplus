const models = require('../../models');

async function CreatePublication(data)
{
    const publication = await models.Publication.create(data);

    if(publication)
    {
        return true;
    }

    return false;
}

module.exports = CreatePublication;