const express = require('express');
const router = express.Router();
const RoomTypeController = require('../Controllers/C.MstRoomType');

router.get('/', RoomTypeController.index);

module.exports = router;
