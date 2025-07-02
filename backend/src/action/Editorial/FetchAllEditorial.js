const { paginate } = require('../../helper/paginate');
const models = require('../../models');

async function FetchAllEditorial(page = 1)
{
    pageSize = 10;
    const editorial = await paginate(models.Editorial, {
        page,
        pageSize,
        include: [
            { model: models.MediaType, as: 'mediaType_data' },
            { model: models.Company, as: 'company_data' },
            { model: models.Publication, as: 'publication_data' },
            { model: models.Placement, as: 'placement_data' },
            { model: models.Activity, as: 'activity_data' }
        ]
    });

    if(editorial)
    {
        return editorial;
    }

    return false;
}

module.exports = FetchAllEditorial;