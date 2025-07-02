const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const CreateCampaignTypeRequest = require('..//request/CreateCampaignTypeRequest');
const UpdateCampaignTypeRequest = require('..//request/UpdateCampaignTypeRequest');
const { index, show, store, update, destroy } = require('..//controller/CampaignTypeController');


router.get('', asyncHandler(index));
router.get('/:id', asyncHandler(show));
router.post('', asyncHandler(CreateCampaignTypeRequest), asyncHandler(store));
router.put('/:id', asyncHandler(UpdateCampaignTypeRequest), asyncHandler(update));
router.delete('/:id', asyncHandler(destroy));

module.exports = router;