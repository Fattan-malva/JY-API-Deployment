const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const { getPool } = require('../Config/db');

// ================= REGISTER =================
async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    const pool = await getPool();

    // Cek apakah email sudah terdaftar
    const existingUser = await pool.request()
      .input('email', sql.VarChar(100), email)
      .query('SELECT * FROM MstCustomerLogin WHERE email = @email');

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate customerID manual
    const customerID = Date.now().toString();

    // Simpan user baru
    await pool.request()
      .input('customerID', sql.VarChar(50), customerID)
      .input('name', sql.VarChar(100), name)
      .input('email', sql.VarChar(100), email)
      .input('password', sql.VarChar(255), hashedPassword)
      .query(`
        INSERT INTO MstCustomerLogin (customerID, name, email, password)
        VALUES (@customerID, @name, @email, @password)
      `);

    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('email', sql.VarChar(100), email)
      .query(`
        SELECT *
        FROM MstCustomerLogin
        WHERE email = @email COLLATE SQL_Latin1_General_CP1_CS_AS
      `);

    const user = result.recordset[0];
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.customerID, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        customerID: user.customerID,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// ================= LOGOUT =================
// Logout cukup dihapus dari sisi client (Flutter)
async function logout(req, res) {
  res.json({ message: 'Logout successful — just delete token on client side' });
}

module.exports = { register, login, logout };
