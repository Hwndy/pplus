const { paginate } = require('../../helper/paginate');
const models = require('../../models');

async function FetchAllUser(page = 1)
{

    const pageSize = 10;
    const users = await paginate(models.User, {
      page,
      pageSize,
      include: [
        {
          model: models.Role,
          as: 'role'
        }
      ]
    });

    if(users)
    {
        return users;
    }

    return false;
}

module.exports = FetchAllUser;