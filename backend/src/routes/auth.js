const express = require('express');
const RegisterController = require('..//controller/RegisterController');
const RegisterRequest = require('..//request/RegisterRequest');
const asyncHandler = require('express-async-handler');
const LoginRequest = require('..//request/LoginRequest');
const LoginController = require('..//controller/LoginController');
const router = express.Router();


router.post('/register', asyncHandler(RegisterRequest), asyncHandler(RegisterController));
router.post('/login', asyncHandler(LoginRequest), asyncHandler(LoginController));

module.exports = router;