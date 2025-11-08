const express = require('express');
const router = express.Router();
const EmployeeController = require('../Controllers/C.MstEmployee');
const { authenticateToken } = require('../Auth/middleware');

// Public (tidak perlu login)
router.get('/', authenticateToken, EmployeeController.index);

module.exports = router;