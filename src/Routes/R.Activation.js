const express = require('express');
const router = express.Router();
const { ActivationCheck, ActivationCreate } = require('../Auth/A.Activation');

router.get('/check', ActivationCheck);
router.post('/create', ActivationCreate);

module.exports = router;
