const bcrypt = require('bcryptjs');
const { getPool } = require('../Config/db');

// ✅ Cek data customer
async function ActivationCheck(req, res) {
  const { email, phone, noIdentity, birthDate } = req.query;

  if (!email || !phone || !noIdentity || !birthDate) {
    return res.status(400).json({ message: 'Email, phone, noIdentity, and birthDate are required' });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('email', email)
      .input('phone', phone)
      .input('noIdentity', noIdentity)
      .input('birthDate', birthDate)
      .query(`
        SELECT customerID, name, birthDate, phone, noIdentity, email, lastContractID, toStudioID
        FROM MstCustomer
        WHERE email = @email
          AND phone = @phone
          AND noIdentity = @noIdentity
          AND birthDate = @birthDate
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('ActivationCheck error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// ✅ Buat akun login baru (aktivasi)
async function ActivationCreate(req, res) {
  const { customerID, email, password } = req.body;

  if (!customerID || !email || !password) {
    return res.status(400).json({ message: 'CustomerID, email, and password are required' });
  }

  try {
    const pool = await getPool();

    // Cek apakah sudah pernah aktif
    const existingUser = await pool.request()
      .input('customerID', customerID)
      .query('SELECT * FROM MstCustomerLogin WHERE customerID = @customerID');

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ message: 'Account already activated' });
    }

    // Ambil data tambahan dari MstCustomer
    const customerResult = await pool.request()
      .input('customerID', customerID)
      .query('SELECT name, toStudioID, lastContractID, noIdentity, birthDate, phone FROM MstCustomer WHERE customerID = @customerID');

    if (customerResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const { name, toStudioID, lastContractID, noIdentity, birthDate, phone } = customerResult.recordset[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.request()
      .input('customerID', customerID)
      .input('name', name)
      .input('toStudioID', toStudioID)
      .input('lastContractID', lastContractID)
      .input('noIdentity', noIdentity)
      .input('birthDate', birthDate)
      .input('phone', phone)
      .input('email', email)
      .input('password', hashedPassword)
      .query(`
        INSERT INTO MstCustomerLogin (customerID, name, toStudioID, lastContractID, noIdentity, birthDate, phone, email, password)
        VALUES (@customerID, @name, @toStudioID, @lastContractID, @noIdentity, @birthDate, @phone, @email, @password)
      `);

    res.status(201).json({ message: 'Account activated successfully' });
  } catch (error) {
    console.error('ActivationCreate error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// ✅ Pastikan kamu export dengan benar
module.exports = { ActivationCheck, ActivationCreate };
