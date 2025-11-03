const express = require('express');
const router = express.Router();
const TrxStudentJM_BookingListController = require('../Controllers/C.TrxStudentJM_BookingList');


router.get('/find-by-customer-id', TrxStudentJM_BookingListController.show);

module.exports = router;