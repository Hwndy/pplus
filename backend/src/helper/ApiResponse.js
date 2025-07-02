function success(res, data = {}, message = '')
{
    return res.status(200).json({
        data: data,
        message: message
    });
}

function error(res, message)
{
    return res.status(400).json({
        message: message
    });
}

function validationError(res, message)
{
    return res.status(422).json({
        message: message
    });
}

module.exports = {
    success, error, validationError
}