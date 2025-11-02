const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../Auth/A.Auth');
const { authenticateToken } = require('../Auth/middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout',  logout);

module.exports = router;
