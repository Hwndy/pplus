const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const { index, show, store, update, destroy } = require('..//controller/PermissionController');
const CreatePermissionRequest = require('..//request/CreatePermissionRequest');
const UpdatePermissionRequest = require('..//request/UpdatePermissionRequest');

router.get('', asyncHandler(index));
router.get('/:id', asyncHandler(show));
router.post('', asyncHandler(CreatePermissionRequest), asyncHandler(store));
router.put('/:id', asyncHandler(UpdatePermissionRequest), asyncHandler(update));
router.delete('/:id', asyncHandler(destroy));

module.exports = router;