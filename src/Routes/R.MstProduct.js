const express = require('express');
const router = express.Router();
const ProductController = require('../Controllers/C.MstProduct');
const { authenticateToken } = require('../Auth/middleware');


router.get('/active-plan', authenticateToken, ProductController.findActivePlanByLastContractID);
router.get('/plan-history', authenticateToken,ProductController.findPlanProductByCustomerID);
router.get('/just-me-history',authenticateToken, ProductController.findJustMeHistoryByCustomerID);

module.exports = router;
