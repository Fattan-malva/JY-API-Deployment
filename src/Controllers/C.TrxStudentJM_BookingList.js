const JmBookingModel = require('../Models/M.TrxStudentJM_BookingList');

async function show(req, res) {
    try {
        const { CustomerId } = req.query;

        if (!CustomerId) {
            return res.status(400).json({ message: "CustomerId is required" });
        }

        const bookingData = await JmBookingModel.findByCustomerId(CustomerId);

        if (bookingData.length === 0) {
            return res.status(404).json({ message: "No Just Me Booking found for this CustomerId" });
        }

        res.json(bookingData);
    } catch (error) {
        console.error("Error fetching booking by CustomerId:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = { show };