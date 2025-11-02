const express = require('express');
const router = express.Router();
const ScheduleController = require('../Controllers/C.TrxSchedule');
const { authenticateToken } = require('../Auth/middleware');

// GET schedule berdasarkan parameter (date, roomType, studioID)
router.get('/', authenticateToken, ScheduleController.getSchedule);
// GET schedule berdasarkan date saja
router.get('/by-date', authenticateToken, ScheduleController.getScheduleByDate);
// GET schedule berdasarkan date dan studio saja
router.get('/by-date-studio', authenticateToken, ScheduleController.getScheduleByDateAndStudio);
// GET schedule berdasarkan date dan room type saja
router.get('/by-date-roomtype', authenticateToken, ScheduleController.getScheduleByDateAndRoomType);

module.exports = router;
