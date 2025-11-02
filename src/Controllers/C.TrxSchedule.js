const Schedule = require('../Models/M.TrxSchedule');

async function getSchedule(req, res) {
  try {
    const { date, roomType, studioID } = req.query;

    if (!date || !roomType || !studioID) {
      return res.status(400).json({ message: "date, roomType, and studioID are required" });
    }

    const data = await Schedule.findScheduleByParams(date, parseInt(roomType), parseInt(studioID));

    if (data.length === 0) {
      return res.status(404).json({ message: "No schedule found" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getScheduleByDate(req, res) {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "date is required" });
    }

    const data = await Schedule.findScheduleByDate(date);

    if (data.length === 0) {
      return res.status(404).json({ message: "No schedule found for this date" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching schedule by date:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getScheduleByDateAndStudio(req, res) {
  try {
    const { date, studioID } = req.query;

    if (!date || !studioID) {
      return res.status(400).json({ message: "date and studioID are required" });
    }

    const data = await Schedule.findScheduleByDateAndStudio(date, parseInt(studioID));

    if (data.length === 0) {
      return res.status(404).json({ message: "No schedule found for this date and studio" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching schedule by date and studio:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getScheduleByDateAndRoomType(req, res) {
  try {
    const { date, roomType } = req.query;

    if (!date || !roomType) {
      return res.status(400).json({ message: "date and roomType are required" });
    }

    const data = await Schedule.findScheduleByDateAndRoomType(date, parseInt(roomType));

    if (data.length === 0) {
      return res.status(404).json({ message: "No schedule found for this date and room type" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching schedule by date and room type:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { getSchedule, getScheduleByDate, getScheduleByDateAndStudio, getScheduleByDateAndRoomType };
