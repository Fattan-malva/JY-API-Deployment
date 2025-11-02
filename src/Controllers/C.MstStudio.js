const StudioModel = require('../Models/M.MstStudio');

async function index(req, res) {
    const studios = await StudioModel.findAll();
    res.json(studios);
}

module.exports = { index };
