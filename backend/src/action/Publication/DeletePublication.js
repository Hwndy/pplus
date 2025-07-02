const models = require('../../models');

async function DeletePublication(id)
{
    const publication = await models.Publication.findByPk(id);

    if(publication)
    {
        return await publication.destroy();
    }

    return false;
}

module.exports = DeletePublication;