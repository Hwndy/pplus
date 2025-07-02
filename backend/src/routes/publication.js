const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const { index, show, store, update, destroy } = require('..//controller/PublicationController');
const CreatePublicationRequest = require('..//request/CreatePublicationRequest');
const UpdatePublicationRequest = require('..//request/UpdatePublicationRequest');

router.get('', asyncHandler(index));
router.get('/:id', asyncHandler(show));
router.post('', asyncHandler(CreatePublicationRequest), asyncHandler(store));
router.put('/:id', asyncHandler(UpdatePublicationRequest), asyncHandler(update));
router.delete('/:id', asyncHandler(destroy));

module.exports = router;