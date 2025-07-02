const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const { index, show, store, update, destroy } = require('../controller/PlacementController');
const CreatePlacementRequest = require('../request/CreatePlacementRequest');
const UpdatePlacementRequest = require('../request/UpdatePlacementRequest');

router.get('', asyncHandler(index));
router.get('/:id', asyncHandler(show));
router.post('', asyncHandler(CreatePlacementRequest), asyncHandler(store));
router.put('/:id', asyncHandler(UpdatePlacementRequest), asyncHandler(update));
router.delete('/:id', asyncHandler(destroy));

module.exports = router;