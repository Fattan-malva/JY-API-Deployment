const express = require('express');
const router = express.Router();
const ClassController = require('../Controllers/C.class');
const { authenticateToken } = require('../Auth/middleware');

// Public (tidak perlu login)
router.get('/', ClassController.index);
router.get('/:id', ClassController.show);

// Private (harus login pakai JWT)
router.post('/', authenticateToken, ClassController.store);
router.put('/:id', authenticateToken, ClassController.update);
router.delete('/:id', authenticateToken, ClassController.destroy);

module.exports = router;
