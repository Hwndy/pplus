const express = require('express');
const { index, store, update, show, destroy } = require('..//controller/UserController');
const asyncHandler = require('express-async-handler');
const RegisterRequest = require('..//request/RegisterRequest');
const UpdateUserRequest = require('..//request/UpdateUserRequest');
const router = express.Router();

router.get('', asyncHandler(index));
router.get('/:id', asyncHandler(show));
router.post('', asyncHandler(RegisterRequest), asyncHandler(store));
router.put('/:id', asyncHandler(UpdateUserRequest), asyncHandler(update));
router.delete('/:id', asyncHandler(destroy));

module.exports = router;