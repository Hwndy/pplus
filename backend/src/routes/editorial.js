const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const { index, show, store, update, destroy } = require('../controller/EditorialController');
const createEditorialRequest = require('../request/createEditorialRequest');
const updateEditorialRequest = require('../request/updateEditorialRequest');

router.get('', asyncHandler(index));
router.get('/:id', asyncHandler(show));
router.post('', asyncHandler(createEditorialRequest), asyncHandler(store));
router.put('/:id', asyncHandler(updateEditorialRequest), asyncHandler(update));
router.delete('/:id', asyncHandler(destroy));

module.exports = router;