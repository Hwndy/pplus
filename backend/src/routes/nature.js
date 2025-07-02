const router = require('express').Router();
const { index, show, store, update, destroy } = require('..//controller/NatureController');
const CreateNatureRequest = require('..//request/CreateNatureRequest');
const UpdateNatureRequest = require('..//request/UpdateNatureRequest');
const asyncHandler = require('express-async-handler');


router.get('', asyncHandler(index));
router.get('/:id', asyncHandler(show));
router.post('', asyncHandler(CreateNatureRequest), asyncHandler(store));
router.put('/:id', asyncHandler(UpdateNatureRequest), asyncHandler(update));
router.delete('/:id', asyncHandler(destroy));

module.exports = router;