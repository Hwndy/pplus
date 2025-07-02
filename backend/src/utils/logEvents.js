const { format } = require('date-fns');
const {v4: uuid} = require('uuid');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const asyncHandler = require('express-async-handler');

async function logEvents(message, logName){
    const dateTime = `${format(new Date(), 'yyyy-MM-dd\tHH:mm:ss')}`;
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

    if(!fs.existsSync(path.join(__dirname, '../..', 'logs')))
    {
        await fsPromises.mkdir(path.join(__dirname, '../..', 'logs'));

    }

    await fsPromises.appendFile(path.join(__dirname, '../..', 'logs', logName), logItem);
}

function logger(req, res, next)
{
    asyncHandler(logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, 'reqLog.txt'));
    console.log(`${req.method}\t${req.path}`);
    next();
}

module.exports = {
    logEvents, logger
}