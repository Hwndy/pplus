const { notFound } = require("./errorHandler");

function checkCategory(category)
{
    const validCategories = [
        "print_editorial",
        "online_editorial",
        "print_advert",
        "daily_mentions",
      ];
      return validCategories.includes(category);
}

function confirmCategory(req, res, next)
{
    console.log(req.params);
    if (!checkCategory(req.params.category)) {
        console.log(true);
        notFound(req, res, next);
    }

    next();
}

module.exports = confirmCategory;