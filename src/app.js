require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./Routes/R.auth');
const classRoutes = require('./Routes/R.class');
const scheduleRoutes = require('./Routes/R.TrxSchedule');
const studioRoutes = require('./Routes/R.MstStudio');
const roomTypeRoutes = require('./Routes/R.MstRoomType');
const bookingRoutes = require('./Routes/R.TrxClassBooking');
const JustMeRoutes = require('./Routes/R.TrxTchJM_Available');
const ActivationRoutes = require('./Routes/R.Activation');
const CustomerLoginRoutes = require('./Routes/R.CustomerLogin');
const ProductRoutes = require('./Routes/R.MstProduct')

const app = express();

// Middleware keamanan
app.use(helmet()); // proteksi header HTTP
app.use(cors({ origin: process.env.CLIENT_URL || '*' })); // atur origin FE Flutter
app.use(express.json());

// Rate Limiter (batas request agar anti-DDOS/bruteforce)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 1000, // max 100 request per IP
  message: { message: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/studios', studioRoutes);
app.use('/api/room-types', roomTypeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/justme', JustMeRoutes);
app.use('/api/activation', ActivationRoutes);
app.use('/api/customers', CustomerLoginRoutes);
app.use('/api/product', ProductRoutes);
// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
