const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const { index, show, store, update, destroy } = require('..//controller/ActivityController');
const CreateActivityRequest = require('..//request/CreateActivityRequest');
const UpdateActivityRequest = require('..//request/UpdateActivityRequest');


router.get('', asyncHandler(index));
router.get('/:id', asyncHandler(show));
router.post('', asyncHandler(CreateActivityRequest), asyncHandler(store));
router.put('/:id', asyncHandler(UpdateActivityRequest), asyncHandler(update));
router.delete('/:id', asyncHandler(destroy));

module.exports = router;