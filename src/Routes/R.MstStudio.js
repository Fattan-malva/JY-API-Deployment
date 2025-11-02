const express = require('express');
const router = express.Router();
const StudioController = require('../Controllers/C.MstStudio');

router.get('/', StudioController.index);

module.exports = router;
