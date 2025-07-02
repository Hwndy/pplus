const router = require('express').Router();
const asyncHandler = require('express-async-handler');
const { index, show, store, update, destroy } = require('..//controller/RoleController');
const CreateRoleRequest = require('..//request/CreateRoleRequest');
const UpdateRoleRequest = require('..//request/UpdateRoleRequest');

router.get('', asyncHandler(index));
router.get('/:id', asyncHandler(show));
router.post('', asyncHandler(CreateRoleRequest), asyncHandler(store));
router.put('/:id', asyncHandler(UpdateRoleRequest), asyncHandler(update));
router.delete('/:id', asyncHandler(destroy));

module.exports = router;