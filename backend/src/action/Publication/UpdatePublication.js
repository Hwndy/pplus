const models = require('../../models');

async function UpdatePublication(id, data)
{
    const publication = await models.Publication.findByPk(id);

    if(publication)
    {
        return publication.update(data);
    }

    return false;
}

module.exports = UpdatePublication;