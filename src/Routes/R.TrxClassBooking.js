const express = require('express');
const router = express.Router();
const BookingController = require('../Controllers/C.TrxClassBooking');
const { authenticateToken } = require('../Auth/middleware');


router.get('/', BookingController.index);
router.get('/find-by-uniq-code', BookingController.findByUniqCode);
router.get('/find-by-customer-id', BookingController.findByCustomerID);
router.post('/', authenticateToken, BookingController.create);

module.exports = router;
