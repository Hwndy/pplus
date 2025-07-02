const models = require('../../models');

async function FetchSingleEditorial(id)
{
    const editorial = await models.Editorial.findByPk(id, {include: [
        { model: models.MediaType, as: 'mediaType_data' },
        { model: models.Company, as: 'company_data' },
        { model: models.Publication, as: 'publication_data' },
        { model: models.Placement, as: 'placement_data' },
        { model: models.Activity, as: 'activity_data' }
      ],
    });

    if(editorial)
    {
        return editorial;
    }

    return false;
}

module.exports = FetchSingleEditorial;