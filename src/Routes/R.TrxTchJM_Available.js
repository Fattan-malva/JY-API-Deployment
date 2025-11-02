const express = require('express');
const router = express.Router();
const JustMeController = require('../Controllers/C.TrxTchJM_Available');
const { authenticateToken } = require('../Auth/middleware');

// GET all justme
router.get('/', JustMeController.getAll);
// GET justme by date
router.get('/by-date', JustMeController.getByDate);
// GET justme by date and studio
router.get('/by-date-studio', JustMeController.getByDateAndStudio);
// POST create booking
router.post('/', authenticateToken, JustMeController.create);

module.exports = router;
