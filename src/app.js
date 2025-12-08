require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const chalk = require('chalk');

const authRoutes = require('./Routes/R.auth');
const ActivationRoutes = require('./Routes/R.Activation');
const CustomerLoginRoutes = require('./Routes/R.CustomerLogin');
const classRoutes = require('./Routes/R.class');
const employeeRoutes = require('./Routes/R.MstEmployee');
const studioRoutes = require('./Routes/R.MstStudio');
const scheduleRoutes = require('./Routes/R.TrxSchedule');
const roomTypeRoutes = require('./Routes/R.MstRoomType');
const ProductRoutes = require('./Routes/R.MstProduct');
const bookingRoutes = require('./Routes/R.TrxClassBooking');
const JustMeRoutes = require('./Routes/R.TrxTchJM_Available');
const TrxStudentJM_BookingListRoutes = require('./Routes/R.TrxStudentJM_BookingList');

const app = express();

// Middleware keamanan
app.use(helmet()); // proteksi header HTTP
app.use(cors({ origin: process.env.CLIENT_URL || '*' })); // atur origin FE Flutter
app.use(express.json());

app.set('trust proxy', 1);


// Rate Limiter (batas request agar anti-DDOS/bruteforce)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 1000, // max 1000 request per IP
  message: { message: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/activation', ActivationRoutes);
app.use('/api/customers', CustomerLoginRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/product', ProductRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/studios', studioRoutes);
app.use('/api/room-types', roomTypeRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/justme', JustMeRoutes);
app.use('/api/jm-bookings', TrxStudentJM_BookingListRoutes);

// Health check
app.get('/health', (req, res) => {
  const now = new Date().toLocaleString('id-ID');
  if (process.env.NODE_ENV === 'production') {
    console.log(`💚 Health check OK at ${now}`);
  } else {
    console.log(`🧪 Dev health check at ${now}`);
  }

  res.json({ ok: true, time: now });
});


const listRoutes = require('./utils/listRoutes');

// Tampilkan daftar routes hanya jika bukan production
if (process.env.NODE_ENV !== 'production') {
  listRoutes(app);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
