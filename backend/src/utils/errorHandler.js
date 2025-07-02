const { logEvents } = require("./logEvents");
const asyncHandler = require('express-async-handler');

function notFound(req, res, next){
    const error = new Error(`route ${req.protocol}://${req.get('host')}${req.originalUrl} does not exist`);
    res.statusCode = 404;
    next(error);
}

function errorHandler(error, req, res, next){
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    asyncHandler(logEvents(`${error?.name}: ${error?.message}`, 'errorLog.txt'));
    res.status(statusCode);
    res.json({
        message: error?.message || 'An unexpected error occurred',
    stack: process.env.NODE_ENV === 'production' ? ' Enable development mode for stack trace' : error?.stack
    });
}

module.exports = {
    notFound, errorHandler
}