const express = require('express');
const router = express.Router();
const EmployeeController = require('../Controllers/C.MstEmployee');

// Public (tidak perlu login)
router.get('/', EmployeeController.index);

module.exports = router;