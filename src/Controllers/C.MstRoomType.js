const RoomModel = require('../Models/M.MstRoomType');

async function index(req, res) {
    const rooms = await RoomModel.findAll();
    res.json(rooms);
}

module.exports = { index };
