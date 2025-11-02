const express = require('express');
const router = express.Router();
const CustomerLoginController = require('../Controllers/C.CustomerLogin');
const { authenticateToken } = require('../Auth/middleware');

// Public route to get customer by ID
router.get('/', authenticateToken, CustomerLoginController.show);
router.get('', authenticateToken, CustomerLoginController.show);

module.exports = router;
