const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const { index, show, store, update, destroy } = require('..//controller/ChannelController');
const CreateChannelRequest = require('..//request/CreateChannelRequest');
const UpdateChannelRequest = require('..//request/UpdateChannelRequest');

router.get('', asyncHandler(index));
router.get('/:id', asyncHandler(show));
router.post('', asyncHandler(CreateChannelRequest), asyncHandler(store));
router.put('/:id', asyncHandler(UpdateChannelRequest), asyncHandler(update));
router.delete('/:id', asyncHandler(destroy));

module.exports = router;
