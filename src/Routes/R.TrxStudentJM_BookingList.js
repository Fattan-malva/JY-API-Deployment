const express = require('express');
const router = express.Router();
const TrxStudentJM_BookingListController = require('../Controllers/C.TrxStudentJM_BookingList');
const { authenticateToken } = require('../Auth/middleware');


router.get('/find-by-customer-id', authenticateToken, TrxStudentJM_BookingListController.show);

module.exports = router;