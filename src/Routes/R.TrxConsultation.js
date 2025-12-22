const express = require('express');
const router = express.Router();
const TrxConsultationController = require('../Controllers/C.TrxConsultation');
const { authenticateToken } = require('../Auth/middleware');


router.get('/find-by-customer-id',  TrxConsultationController.show);

module.exports = router;