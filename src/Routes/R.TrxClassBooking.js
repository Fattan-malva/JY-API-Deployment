const express = require('express');
const router = express.Router();
const BookingController = require('../Controllers/C.TrxClassBooking');
const { authenticateToken } = require('../Auth/middleware');


router.get('/', authenticateToken, BookingController.index);
router.get('/find-by-uniq-code',authenticateToken, BookingController.findByUniqCode);
router.get('/find-by-customer-id', authenticateToken, BookingController.findByCustomerID);
router.post('/', authenticateToken, BookingController.create);

module.exports = router;
