const JustMeModel = require('../Models/M.TrxTchJM_Available');

async function getAll(req, res) {
  try {
    const justme = await JustMeModel.findAll();
    res.json(justme);
  } catch (error) {
    console.error("Error fetching all justme:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getByDate(req, res) {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "date is required" });
    }

    const justme = await JustMeModel.findByDate(date);

    if (justme.length === 0) {
      return res.status(404).json({ message: "No data found for this date" });
    }

    res.json(justme);
  } catch (error) {
    console.error("Error fetching justme by date:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getByDateAndStudio(req, res) {
  try {
    const { date, studioID } = req.query;

    if (!date || !studioID) {
      return res.status(400).json({ message: "date and studioID are required" });
    }

    const justme = await JustMeModel.findByDateAndStudio(date, parseInt(studioID));

    if (justme.length === 0) {
      return res.status(404).json({ message: "No data found for this date and studio" });
    }

    res.json(justme);
  } catch (error) {
    console.error("Error fetching justme by date and studio:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function create(req, res) {
  try {
    const { TrxDate, ToStudioID, TchID, TchSeq } = req.body;

    if (!TrxDate || !ToStudioID || !TchID || !TchSeq) {
      return res.status(400).json({ message: "TrxDate, ToStudioID, TchID, and TchSeq are required for availability check" });
    }

    const availability = await JustMeModel.checkAvailability(TrxDate, ToStudioID, TchID, TchSeq);

    if (!availability.available) {
      return res.status(409).json({ message: availability.reason });
    }

    // Proceed with creation
    await JustMeModel.create(req, res);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { getAll, getByDate, getByDateAndStudio, create };
