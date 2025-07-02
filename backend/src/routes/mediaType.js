const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const { index, show, store, update, destroy } = require('../controller/MediaTypeController');
const CreateMediaTypeRequest = require('../request/CreateMediaTypeRequest');
const UpdateMediaTypeRequest = require('../request/UpdateMediaTypeRequest');

router.get('', asyncHandler(index));
router.get('/:id', asyncHandler(show));
router.post('', asyncHandler(CreateMediaTypeRequest), asyncHandler(store));
router.put('/:id', asyncHandler(UpdateMediaTypeRequest), asyncHandler(update));
router.delete('/:id', asyncHandler(destroy));

module.exports = router;