require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const apiRoutes = require('./routes/api');
const cors = require('cors');
const corsOptions = require('./utils/corsOptions');
const { logger } = require('./utils/logEvents');
const { notFound, errorHandler } = require('./utils/errorHandler');


app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

// Route Handler
app.use(logger);
app.use('/api/', apiRoutes);
app.use(notFound);
app.use(errorHandler);


module.exports = app;