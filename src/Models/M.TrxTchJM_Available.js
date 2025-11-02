const { getPool, sql } = require('../Config/db');

async function findAll() {
  const pool = await getPool();

  const query = `
    SELECT
        a.TrxDate,
        a.toStudioID,
        a.TchID,
        e.EmployeeName,
        s.Name AS StudioName,
        a.Sequence,
        a.TimeFrom,
        a.TimeTo,
        a.isBook,
        a.CreatedDate,
        a.CreatedBy
    FROM TrxTchJM_Available AS a
    INNER JOIN MstEmployee AS e
        ON a.TchID = e.EmployeeID
    INNER JOIN MstStudio AS s
        ON a.toStudioID = s.StudioID
     
    ORDER BY a.Sequence ASC;
  `;

  const result = await pool.request().query(query);
  return result.recordset;
}

async function findByDate(date) {
  const pool = await getPool();

  const query = `
    SELECT
        a.TrxDate,
        a.toStudioID,
        a.TchID,
        e.EmployeeName,
        s.Name AS StudioName,
        a.Sequence,
        a.TimeFrom,
        a.TimeTo,
        a.isBook,
        a.CreatedDate,
        a.CreatedBy
    FROM TrxTchJM_Available AS a
    INNER JOIN MstEmployee AS e
        ON a.TchID = e.EmployeeID
    INNER JOIN MstStudio AS s
        ON a.toStudioID = s.StudioID
    WHERE a.TrxDate = @date  
    ORDER BY a.Sequence ASC;
  `;

  const result = await pool.request().input('date', sql.Date, date).query(query);
  return result.recordset;
}

async function findByDateAndStudio(date, studioID) {
  const pool = await getPool();

  const query = `
    SELECT
        a.TrxDate,
        a.toStudioID,
        a.TchID,
        e.EmployeeName,
        s.Name AS StudioName,
        a.Sequence,
        a.TimeFrom,
        a.TimeTo,
        a.isBook,
        a.CreatedDate,
        a.CreatedBy
    FROM TrxTchJM_Available AS a
    INNER JOIN MstEmployee AS e
        ON a.TchID = e.EmployeeID
    INNER JOIN MstStudio AS s
        ON a.toStudioID = s.StudioID
    WHERE a.TrxDate = @date AND a.toStudioID = @studioID  
    ORDER BY a.Sequence ASC;
  `;

  const result = await pool.request().input('date', sql.Date, date).input('studioID', sql.Int, studioID).query(query);
  return result.recordset;
}

async function checkAvailability(TrxDate, ToStudioID, TchID, TchSeq) {
  const pool = await getPool();

  const query = `
    SELECT isBook
    FROM TrxTchJM_Available
    WHERE TrxDate = @TrxDate
      AND toStudioID = @ToStudioID
      AND TchID = @TchID
      AND Sequence = @TchSeq
  `;

  const result = await pool.request()
    .input('TrxDate', sql.DateTime, TrxDate)
    .input('ToStudioID', sql.VarChar(50), ToStudioID)
    .input('TchID', sql.VarChar(50), TchID)
    .input('TchSeq', sql.TinyInt, TchSeq)
    .query(query);

  if (result.recordset.length === 0) {
    return { available: false, reason: 'Slot not found' };
  }

  const isBook = result.recordset[0].isBook;
  return { available: isBook === false || isBook === 'false', reason: isBook ? 'Already booked. Please pick another schedule.' : null };
}

async function create(req, res) {
  const {
    TrxDate,
    CustomerID,
    FromStudioID,
    ToStudioID,
    TchID,
    TchSeq,
    BookBy,
    CreatedBy
  } = req.body;

  // 🧩 Validasi input
  if (
    !TrxDate ||
    !CustomerID ||
    !FromStudioID ||
    !ToStudioID ||
    !TchID ||
    !TchSeq ||
    !BookBy ||
    !CreatedBy
  ) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // 🔍 1️⃣ Cek apakah customer sudah punya booking di tanggal yang sama
    const checkBooking = await transaction
      .request()
      .input('TrxDate', sql.SmallDateTime, TrxDate)
      .input('CustomerID', sql.VarChar(50), CustomerID)
      .query(`
        SELECT COUNT(*) AS ExistingCount
        FROM TrxStudentJM_BookingList
        WHERE TrxDate = @TrxDate
          AND CustomerID = @CustomerID
      `);

    const { ExistingCount } = checkBooking.recordset[0];

    if (ExistingCount > 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'You already have a booking on this date. You cannot book twice in the same day.'
      });
    }

    // 🟢 2️⃣ Update isBook jadi true di TrxTchJM_Available
    await transaction
      .request()
      .input('TrxDate', sql.DateTime, TrxDate)
      .input('ToStudioID', sql.VarChar(50), ToStudioID)
      .input('TchID', sql.VarChar(50), TchID)
      .input('TchSeq', sql.TinyInt, TchSeq)
      .query(`
        UPDATE TrxTchJM_Available
        SET isBook = 1
        WHERE TrxDate = @TrxDate
          AND ToStudioID = @ToStudioID
          AND TchID = @TchID
          AND Sequence = @TchSeq
      `);

    // 📝 3️⃣ Insert ke TrxStudentJM_BookingList
    await transaction
      .request()
      .input('TrxDate', sql.SmallDateTime, TrxDate)
      .input('CustomerID', sql.VarChar(50), CustomerID)
      .input('FromStudioID', sql.VarChar(50), FromStudioID)
      .input('ToStudioID', sql.VarChar(50), ToStudioID)
      .input('TchID', sql.VarChar(50), TchID)
      .input('TchSeq', sql.TinyInt, TchSeq)
      .input('isRunning', sql.Bit, false)
      .input('BookBy', sql.VarChar(50), BookBy)
      .input('CreatedDate', sql.DateTime, new Date())
      .input('CreatedBy', sql.VarChar(50), CreatedBy)
      .query(`
        INSERT INTO TrxStudentJM_BookingList (
          TrxDate,
          CustomerID,
          FromStudioID,
          ToStudioID,
          TchID,
          TchSeq,
          isRunning,
          BookBy,
          CreatedDate,
          CreatedBy
        )
        VALUES (
          @TrxDate,
          @CustomerID,
          @FromStudioID,
          @ToStudioID,
          @TchID,
          @TchSeq,
          @isRunning,
          @BookBy,
          @CreatedDate,
          @CreatedBy
        )
      `);

    await transaction.commit();

    return res
      .status(201)
      .json({ message: 'Booking created and updated successfully.' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating booking:', error);
    return res
      .status(500)
      .json({ message: 'Failed to create booking.', error: error.message });
  }
}

module.exports = { findAll, findByDate, findByDateAndStudio, checkAvailability, create };
