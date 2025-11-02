const BookingModel = require('../Models/M.TrxClassBooking');

async function index(req, res) {
    const bookings = await BookingModel.findAll();
    res.json(bookings);
}

async function findByUniqCode(req, res) {
    try {
        const { UniqCode } = req.query;

        if (!UniqCode) {
            return res.status(400).json({ message: "UniqCode is required" });
        }

        const data = await BookingModel.findByUniqCode(UniqCode);

        if (data.length === 0) {
            return res.status(404).json({ message: "No booking found for this UniqCode" });
        }

        res.json(data);
    } catch (error) {
        console.error("Error fetching booking by UniqCode:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
async function findByCustomerID(req, res) {
    try {
        const { customerID } = req.query;

        if (!customerID) {
            return res.status(400).json({ message: "customerID is required" });
        }

        const data = await BookingModel.findByCustomerID(customerID);

        if (data.length === 0) {
            return res.status(404).json({ message: "No booking found for this customerID" });
        }

        res.json(data);
    } catch (error) {
        console.error("Error fetching booking by customerID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function create(req, res) {
    try {
        const bookingData = req.body;

        // ✅ 1. Validasi field wajib
        const requiredFields = [
            'studioID', 'RoomType', 'ClassID', 'ClassBookingDate', 'ClassBookingTime',
            'customerID', 'ContractID', 'AccessCardNumber', 'isActive', 'isRelease',
            'isConfirm', 'ClassMapNumber', 'createby', 'createdate'
        ];

        for (const field of requiredFields) {
            if (bookingData[field] === undefined || bookingData[field] === null) {
                return res.status(400).json({ message: `${field} is required` });
            }
        }

        // ✅ 2. Panggil model untuk membuat booking
        const result = await BookingModel.create(bookingData);

        // ✅ 3. Jika gagal karena booking aktif belum dirilis
        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }

        // ✅ 4. Jika berhasil
        res.status(201).json({ message: result.message || 'Booking created successfully' });

    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


module.exports = { index, findByUniqCode, findByCustomerID, create };
