const { url } = require("../utils/helpers");

async function paginate(model, { page = 1, pageSize = 10, include = [], where = {} }) {
  try {
    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    const { rows: data, count: total } = await model.findAndCountAll({
      where,
      include,
      limit,
      offset,
    });

    if (total > 0) {
      return {
        data: data,
        total: total,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / pageSize),
        pageSize: pageSize,
      };
    }
    
    return false;
  } catch (error) {
    console.log(error.message);
  }
}


function paginationLinks(name, currentPage, totalPages)
{
    const route = url(name);
    return {
        first: `${route}?page=${1}`,
        last: `${route}?page=${totalPages}`,
        prev: `${route}?page=${currentPage > 1 ? currentPage - 1 : 1}`,
        next: `${route}?pages=${currentPage < totalPages ? parseInt(currentPage) + 1 : totalPages}`
    }
}

module.exports = {paginationLinks, paginate};