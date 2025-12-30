const express = require('express');
const router = express.Router();
const TrxConsultationController = require('../Controllers/C.TrxConsultation');
const { authenticateToken } = require('../Auth/middleware');


router.get('/find-by-customer-id', authenticateToken, TrxConsultationController.show);

router.get('/find-history-by-customer-id',  TrxConsultationController.historybooking);

router.post('/', authenticateToken, TrxConsultationController.create);

router.post('/bookings/cancel', authenticateToken, TrxConsultationController.cancelBooking);

module.exports = router;