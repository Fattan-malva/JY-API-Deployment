const ConsultationBookingModel = require('../Models/M.TrxConsultation');

async function show(req, res) {
    try {
        const { StudentID } = req.query;

        if (!StudentID) {
            return res.status(400).json({ message: "StudentID is required" });
        }

        const bookingData = await ConsultationBookingModel.findByStudentID(StudentID);

        if (bookingData.length === 0) {
            return res.status(404).json({ message: "No Consultation Booking found for this StudentID" });
        }

        res.json(bookingData);
    } catch (error) {
        console.error("Error fetching booking by StudentID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function historybooking(req, res) {
    try {
        const { StudentID } = req.query;

        if (!StudentID) {
            return res.status(400).json({ message: "StudentID is required" });
        }

        const bookingData = await ConsultationBookingModel.findByStudentID(StudentID);

        if (bookingData.length === 0) {
            return res.status(404).json({ message: "No Consultation Booking found for this StudentID" });
        }

        res.json(bookingData);
    } catch (error) {
        console.error("Error fetching booking by StudentID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function create(req, res) {
    try {
        // Langsung panggil fungsi create dari model
        await ConsultationBookingModel.create(req, res);
    } catch (error) {
        console.error("Error creating consultation:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function cancelBooking(req, res) {
    try {
        return await ConsultationBookingModel.drop(req, res);
    } catch (error) {
        console.error('Error in cancelBooking controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}
module.exports = { show, create, cancelBooking, historybooking };