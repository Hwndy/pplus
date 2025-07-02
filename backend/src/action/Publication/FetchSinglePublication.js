const models = require('../../models');

async function FetchSinglePublication(id)
{
    const publication = await models.Publication.findByPk(id);

    if(publication)
    {
        return publication;
    }

    return false;
}

module.exports = FetchSinglePublication;