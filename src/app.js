require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const chalk = require('chalk');

const authRoutes = require('./Routes/R.auth');
const classRoutes = require('./Routes/R.class');
const scheduleRoutes = require('./Routes/R.TrxSchedule');
const studioRoutes = require('./Routes/R.MstStudio');
const roomTypeRoutes = require('./Routes/R.MstRoomType');
const bookingRoutes = require('./Routes/R.TrxClassBooking');
const JustMeRoutes = require('./Routes/R.TrxTchJM_Available');
const ActivationRoutes = require('./Routes/R.Activation');
const CustomerLoginRoutes = require('./Routes/R.CustomerLogin');
const ProductRoutes = require('./Routes/R.MstProduct');

const app = express();

// Middleware keamanan
app.use(helmet()); // proteksi header HTTP
app.use(cors({ origin: process.env.CLIENT_URL || '*' })); // atur origin FE Flutter
app.use(express.json());

// Rate Limiter (batas request agar anti-DDOS/bruteforce)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 1000, // max 1000 request per IP
  message: { message: 'Too many requests, please try again later.' },
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



const listRoutes = (app) => {
  console.log(chalk.cyan.bold('\n📋 Registered Routes:\n'));

  const cleanPath = (regex) => {
    return regex
      .toString()
      .replace(/^\/\^/, '') // hapus /^
      .replace(/\\\//g, '/') // ubah \/ jadi /
      .replace(/\(\?\=\\\/\|\$\)/, '') // hapus (?=\/|$)
      .replace(/\?\(\=\.\*\)\$/, '')
      .replace(/\?\(\=\.\*\)/, '')
      .replace(/\$$/, '')
      .replace(/\/i$/, '')
      .replace(/\?.*/, '') // hapus sisa ?(.*)
      .replace(/\/$/, '') // hapus slash akhir
      .trim();
  };

  // Warna berdasarkan method HTTP
  const colorMethod = (method) => {
    switch (method) {
      case 'GET': return chalk.greenBright(method);
      case 'POST': return chalk.yellowBright(method);
      case 'PUT': return chalk.blueBright(method);
      case 'DELETE': return chalk.redBright(method);
      default: return chalk.white(method);
    }
  };

  let count = 0;

  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Route langsung
      const methods = Object.keys(middleware.route.methods)
        .map((m) => m.toUpperCase());
      methods.forEach((method) => {
        console.log(`${colorMethod(method).padEnd(10)} ${middleware.route.path}`);
        count++;
      });
    } else if (middleware.name === 'router') {
      // Router modular
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods)
            .map((m) => m.toUpperCase());
          const base = cleanPath(middleware.regexp);
          methods.forEach((method) => {
            console.log(`${colorMethod(method).padEnd(10)} ${base}${handler.route.path}`);
            count++;
          });
        }
      });
    }
  });

  console.log(chalk.cyan.bold(`\n✅ Done listing routes. Total routes: ${chalk.yellow(count)}\n`));
};

// Tampilkan daftar routes hanya jika bukan production
if (process.env.NODE_ENV !== 'production') {
  listRoutes(app);
}


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
