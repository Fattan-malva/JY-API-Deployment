const { getPool, sql } = require('../Config/db');

async function findByStudentID(StudentID) {
  const pool = await getPool();
  const result = await pool.request()
    .input('StudentID', sql.VarChar(50), StudentID)
    .query(`
      SELECT me.EmployeeName AS TeacherName, tcl.* FROM TrxConsultation tcl
        INNER JOIN MstEmployee me 
          ON me.employeeID = tcl.TchID
        WHERE StudentID = @StudentID
        ORDER BY TrxDate
    `);

  return result.recordset;
}

async function findHistoryByStudentID(StudentID) {
  const pool = await getPool();
  const result = await pool.request()
    .input('StudentID', sql.VarChar(50), StudentID)
    .query(`
      SELECT me.EmployeeName AS TeacherName, tcl.* FROM TrxConsultation tcl
        INNER JOIN MstEmployee me 
          ON me.employeeID = tcl.TchID
        WHERE StudentID = @StudentID
        ORDER BY TrxDate
    `);

  return result.recordset;
}

async function create(req, res) {
  const {
    TrxDate,
    CustomerID,
    FromStudioID,
    ToStudioID,
    TchID,
    TchSeq,
    TchSeq2,
    BookBy,
    CreatedBy,
    ConsulID,
    ConsulDate,
    ConsulTime,
    studioID,
    MemberType,
    remark,
    StudentID,
    StudentName
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
    !CreatedBy ||
    !ConsulID ||
    !ConsulDate ||
    !ConsulTime ||
    !studioID ||
    !MemberType ||
    !StudentID ||
    !StudentName
  ) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // 🔍 1️⃣ Validasi apakah sudah ada booking di hari yang sama (baik single atau double session)
    const checkAnyBooking = await transaction
      .request()
      .input('TrxDate', sql.SmallDateTime, TrxDate)
      .input('CustomerID', sql.VarChar(50), CustomerID)
      .query(`
        SELECT COUNT(*) AS ExistingBookingCount
        FROM TrxStudentJM_BookingList
        WHERE TrxDate = @TrxDate
          AND CustomerID = @CustomerID
      `);

    const { ExistingBookingCount } = checkAnyBooking.recordset[0];

    if (ExistingBookingCount > 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'You have already booked a session on this date. You cannot book additional sessions.'
      });
    }

    // 🔍 2️⃣ Validasi jumlah booking per hari
    const checkBooking = await transaction
      .request()
      .input('TrxDate', sql.SmallDateTime, TrxDate)
      .input('CustomerID', sql.VarChar(50), CustomerID)
      .query(`
    SELECT TchID, COUNT(*) AS CountBooking
    FROM TrxStudentJM_BookingList
    WHERE TrxDate = @TrxDate
      AND CustomerID = @CustomerID
    GROUP BY TchID
  `);

    let sameTeacherCount = 0;
    let hasDifferentTeacher = false;

    for (const row of checkBooking.recordset) {
      if (row.TchID === TchID) {
        sameTeacherCount = row.CountBooking;
      } else {
        hasDifferentTeacher = true;
      }
    }

    // ❌ Sudah booking dengan guru lain di tanggal sama
    if (hasDifferentTeacher && sameTeacherCount === 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'You already have a booking with another teacher on this date.'
      });
    }

    // ❌ Sudah booking lebih dari 2 kali dengan guru yang sama
    if (sameTeacherCount >= 2) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'You can only book up to 2 sessions with the same teacher per day.'
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

    // 🔁 Jika ada TchSeq2, update juga slot kedua
    if (TchSeq2 !== null && TchSeq2 !== undefined) {
      await transaction
        .request()
        .input('TrxDate', sql.DateTime, TrxDate)
        .input('ToStudioID', sql.VarChar(50), ToStudioID)
        .input('TchID', sql.VarChar(50), TchID)
        .input('TchSeq2', sql.TinyInt, TchSeq2)
        .query(`
      UPDATE TrxTchJM_Available
      SET isBook = 1
      WHERE TrxDate = @TrxDate
        AND ToStudioID = @ToStudioID
        AND TchID = @TchID
        AND Sequence = @TchSeq2
    `);
    }


    // 📝 Insert ke TrxConsultation (FIXED)
    await transaction
      .request()
      .input('ConsulID', sql.VarChar(20), ConsulID)
      .input('trxDate', sql.DateTime, TrxDate)
      .input('ConsulDate', sql.DateTime, ConsulDate)
      .input('ConsulTime', sql.VarChar(5), ConsulTime)
      .input('studioID', sql.Int, studioID)
      .input('MemberType', sql.Int, MemberType)
      .input('remark', sql.VarChar(255), remark || '')
      .input('StudentID', sql.Int, StudentID)
      .input('StudentName', sql.VarChar(100), StudentName)
      .input('TchID', sql.Int, TchID)
      .input('CiCo', sql.Int, 0)
      .input('TchID1', sql.Int, null)
      .input('TchID2', sql.Int, null)
      .input('CiTime', sql.DateTime, null)
      .input('CoTime', sql.DateTime, null)
      .input('createDate', sql.DateTime, new Date())
      .input('createBy', sql.Int, CreatedBy)
      .input('SEID', sql.Int, 0)
      .query(`
    INSERT INTO TrxConsultation (
      ConsulID,
      trxDate,
      ConsulDate,
      ConsulTime,
      studioID,
      MemberType,
      remark,
      StudentID,
      StudentName,
      TchID,
      CiCo,
      TchID1,
      TchID2,
      CiTime,
      CoTime,
      createDate,
      createBy,
      SEID
    )
    VALUES (
      @ConsulID,
      @trxDate,
      @ConsulDate,
      @ConsulTime,
      @studioID,
      @MemberType,
      @remark,
      @StudentID,
      @StudentName,
      @TchID,
      @CiCo,
      @TchID1,
      @TchID2,
      @CiTime,
      @CoTime,
      @createDate,
      @createBy,
      @SEID
    )
  `);

    await transaction.commit();

    return res.status(201).json({
      message: 'Consultation booking created successfully'
    })

  } catch (error) {
    await transaction.rollback();
    console.error('Error creating consultation booking:', error);

    // Handle specific database errors
    if (error.code === 'EREQUEST' && error.number === 2627) {
      return res.status(409).json({
        message: 'You already have a consultation booking for this date.'
      });
    }

    return res.status(500).json({
      message: 'Failed to create consultation booking'
    });
  }
}


async function drop(req, res) {
  const {
    TrxDate,
    CustomerID,
    ToStudioID,
    TchID,
    TchSeq,
    TchSeq2,
    ConsulID
  } = req.body;

  // 🧩 Validasi input
  if (!TrxDate || !CustomerID || !ToStudioID || !TchID || !TchSeq || !ConsulID) {
    return res.status(400).json({ message: 'TrxDate, CustomerID, ToStudioID, TchID, TchSeq, and ConsulID are required.' });
  }

  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // 🔍 1️⃣ Cek apakah booking ada
    const checkBooking = await transaction
      .request()
      .input('TrxDate', sql.DateTime, TrxDate)
      .input('CustomerID', sql.Int, CustomerID)
      .input('TchID', sql.Int, TchID)
      .input('ConsulID', sql.VarChar(20), ConsulID)
      .query(`
        SELECT COUNT(*) AS BookingCount
        FROM TrxConsultation
        WHERE trxDate = @TrxDate
          AND StudentID = @CustomerID
          AND TchID = @TchID
          AND ConsulID = @ConsulID
      `);

    const { BookingCount } = checkBooking.recordset[0];

    if (BookingCount === 0) {
      await transaction.rollback();
      return res.status(404).json({
        message: 'Consultation booking not found.'
      });
    }

    // 🗑️ 2️⃣ Hapus dari TrxConsultation
    await transaction
      .request()
      .input('TrxDate', sql.DateTime, TrxDate)
      .input('CustomerID', sql.Int, CustomerID)
      .input('TchID', sql.Int, TchID)
      .input('ConsulID', sql.VarChar(20), ConsulID)
      .query(`
        DELETE FROM TrxConsultation
        WHERE trxDate = @TrxDate
          AND StudentID = @CustomerID
          AND TchID = @TchID
          AND ConsulID = @ConsulID
      `);

    // 🟢 3️⃣ Update isBook jadi false di TrxTchJM_Available
    await transaction
      .request()
      .input('TrxDate', sql.DateTime, TrxDate)
      .input('ToStudioID', sql.VarChar(50), ToStudioID)
      .input('TchID', sql.Int, TchID)
      .input('TchSeq', sql.TinyInt, TchSeq)
      .query(`
    UPDATE TrxTchJM_Available
    SET isBook = 0
    WHERE TrxDate = @TrxDate
      AND ToStudioID = @ToStudioID
      AND TchID = @TchID
      AND Sequence = @TchSeq
  `);

    // 🔁 Jika ada TchSeq2, update juga slot kedua
    if (TchSeq2 !== null && TchSeq2 !== undefined) {
      await transaction
        .request()
        .input('TrxDate', sql.DateTime, TrxDate)
        .input('ToStudioID', sql.VarChar(50), ToStudioID)
        .input('TchID', sql.Int, TchID)
        .input('TchSeq2', sql.TinyInt, TchSeq2)
        .query(`
      UPDATE TrxTchJM_Available
      SET isBook = 0
      WHERE TrxDate = @TrxDate
        AND ToStudioID = @ToStudioID
        AND TchID = @TchID
        AND Sequence = @TchSeq2
    `);
    }

    await transaction.commit();

    return res.status(200).json({
      message: 'Consultation booking cancelled successfully'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error cancelling consultation booking:', error);

    return res.status(500).json({
      message: 'Failed to cancel consultation booking'
    });
  }
}

module.exports = { findByStudentID, findHistoryByStudentID, create, drop };
