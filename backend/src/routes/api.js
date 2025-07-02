const express = require('express');
const router = express.Router();
const authRoute = require('./auth');
const userRoute = require('./user');
const companyRoute = require('./company');
const roleRoute = require('./role');
const permissionRoute = require('./permission');
const publicationRoute = require('./publication');
const natureRoute = require('./nature');
const channelRoute = require('./channel');
const campaignTypeRoute = require('./campaignType');
const activityRoute = require('./activity');
const mediaTypeRoute = require('./mediaType');
const placementRoute = require('./placement');
const editorialRoute = require('./editorial');
const authMiddleware = require('..//middleware/authMiddleware');
const adminMiddleware = require('..//middleware/adminMiddleware');
const asyncHandler = require('express-async-handler');

router.get('/test', (req, res) => {
    res.send('API working');
    res.status(200).json('Testing testing')
});

router.use('/auth', authRoute);

// router.use(asyncHandler(authMiddleware));

// router.use(adminMiddleware);
router.use('/users', userRoute);
router.use('/companies', companyRoute);
router.use('/roles', roleRoute);
router.use('/permissions', permissionRoute);
router.use('/publications', publicationRoute);
router.use('/natures', natureRoute);
router.use('/channels', channelRoute);
router.use('/campaign-types', campaignTypeRoute);
router.use('/activities', activityRoute);
router.use('/media-types', mediaTypeRoute);
router.use('/placements', placementRoute);
router.use('/editorials', editorialRoute);


module.exports = router;