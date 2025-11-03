const { getPool, sql } = require('../Config/db');

async function findAll() {
  const pool = await getPool();

  const result = await pool.request()
    .query(`
      SELECT *
      FROM TrxClassBooking
      WHERE ClassBookingDate BETWEEN 
            DATEADD(MONTH, -1, GETDATE())  -- 2 bulan ke belakang
        AND DATEADD(MONTH, 2, GETDATE())   -- 1 bulan ke depan
      ORDER BY ClassBookingDate DESC
    `);

  return result.recordset;
}

async function findByUniqCode(uniqCode) {
  const parts = uniqCode.split('|');
  if (parts.length !== 5) {
    throw new Error('Invalid UniqCode format. Expected: studioID|RoomType|ClassID|YYYY-MM-DD|HH:mm');
  }

  const [studioIDStr, roomTypeStr, classIDStr, dateStr, timeStr] = parts;

  const studioID = parseInt(studioIDStr, 10);
  const roomType = parseInt(roomTypeStr, 10);
  const classID = parseInt(classIDStr, 10);

  const pool = await getPool();
  const result = await pool.request()
    .input('studioID', sql.Int, studioID)
    .input('roomType', sql.Int, roomType)
    .input('classID', sql.Int, classID)
    .input('date', sql.VarChar, dateStr)
    .input('time', sql.VarChar, timeStr)
    .query(`
      SELECT *
      FROM TrxClassBooking
      WHERE studioID = @studioID
        AND RoomType = @roomType
        AND ClassID = @classID
        AND CONVERT(varchar(10), ClassBookingDate, 23) = @date
        AND ClassBookingTime = @time
    `);

  return result.recordset;
}

async function findByCustomerID(customerID) {
  if (!customerID) {
    throw new Error('customerID is required.');
  }

  const pool = await getPool();

  const result = await pool.request()
    .input('customerID', sql.VarChar(255), customerID)
    .query(`
      SELECT
          tcb.ClassBookingDate,
          mct.name,
          tcb.ContractID,
          tcb.AccessCardNumber,
          ms.name AS StudioName,
          mr.RoomName,
          mc.ClassName,
          tcb.ClassBookingTime,
          mts.ETime AS TimeClsEnd,
          tcb.ClassMapNumber,
          tcb.isActive,
          tcb.isConfirm,
          tcb.isRelease,

          -- Trainer names dari OUTER APPLY
          cs.Teacher1Name,
          cs.Teacher2Name

      FROM TrxClassBooking AS tcb
      LEFT JOIN MstTimeSchedule AS mts
          ON mts.studioID = tcb.StudioID
          AND tcb.ClassBookingDate BETWEEN mts.SDate AND mts.EDate
          AND mts.stime = tcb.ClassBookingTime

      INNER JOIN MstStudio AS ms
          ON ms.studioID = tcb.StudioID

      INNER JOIN MstRoomType AS mr
          ON mr.RoomType = tcb.RoomType

      INNER JOIN MstClass AS mc
          ON mc.ClassID = tcb.ClassID

      INNER JOIN MstCustomer AS mct
          ON mct.customerID = tcb.customerID

      -- Ambil nama trainer sesuai hari dari jadwal kelas
      OUTER APPLY (
          SELECT
              CASE
                  WHEN CAST(tcs.Date1 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_mon1.EmployeeName
                  WHEN CAST(tcs.Date2 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_tue1.EmployeeName
                  WHEN CAST(tcs.Date3 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_wed1.EmployeeName
                  WHEN CAST(tcs.Date4 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_thu1.EmployeeName
                  WHEN CAST(tcs.Date5 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_fri1.EmployeeName
                  WHEN CAST(tcs.Date6 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_sat1.EmployeeName
                  WHEN CAST(tcs.Date7 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_sun1.EmployeeName
              END AS Teacher1Name,

              CASE
                  WHEN CAST(tcs.Date1 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_mon2.EmployeeName
                  WHEN CAST(tcs.Date2 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_tue2.EmployeeName
                  WHEN CAST(tcs.Date3 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_wed2.EmployeeName
                  WHEN CAST(tcs.Date4 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_thu2.EmployeeName
                  WHEN CAST(tcs.Date5 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_fri2.EmployeeName
                  WHEN CAST(tcs.Date6 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_sat2.EmployeeName
                  WHEN CAST(tcs.Date7 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_sun2.EmployeeName
              END AS Teacher2Name

          FROM TrxClassSchedule AS tcs
          LEFT JOIN MstEmployee e_mon1 ON e_mon1.EmployeeID = tcs.MonTch1
          LEFT JOIN MstEmployee e_mon2 ON e_mon2.EmployeeID = tcs.MonTch2
          LEFT JOIN MstEmployee e_tue1 ON e_tue1.EmployeeID = tcs.TueTch1
          LEFT JOIN MstEmployee e_tue2 ON e_tue2.EmployeeID = tcs.TueTch2
          LEFT JOIN MstEmployee e_wed1 ON e_wed1.EmployeeID = tcs.WedTch1
          LEFT JOIN MstEmployee e_wed2 ON e_wed2.EmployeeID = tcs.WedTch2
          LEFT JOIN MstEmployee e_thu1 ON e_thu1.EmployeeID = tcs.ThuTch1
          LEFT JOIN MstEmployee e_thu2 ON e_thu2.EmployeeID = tcs.ThuTch2
          LEFT JOIN MstEmployee e_fri1 ON e_fri1.EmployeeID = tcs.FriTch1
          LEFT JOIN MstEmployee e_fri2 ON e_fri2.EmployeeID = tcs.FriTch2
          LEFT JOIN MstEmployee e_sat1 ON e_sat1.EmployeeID = tcs.SatTch1
          LEFT JOIN MstEmployee e_sat2 ON e_sat2.EmployeeID = tcs.SatTch2
          LEFT JOIN MstEmployee e_sun1 ON e_sun1.EmployeeID = tcs.SunTch1
          LEFT JOIN MstEmployee e_sun2 ON e_sun2.EmployeeID = tcs.SunTch2

          WHERE
              tcs.StudioID = tcb.StudioID
              AND tcs.RoomType = tcb.RoomType
              AND tcb.ClassBookingDate BETWEEN tcs.SDate AND tcs.EDate
              AND tcs.TimeCls = tcb.ClassBookingTime
              AND (
                  CAST(tcs.Date1 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) OR
                  CAST(tcs.Date2 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) OR
                  CAST(tcs.Date3 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) OR
                  CAST(tcs.Date4 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) OR
                  CAST(tcs.Date5 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) OR
                  CAST(tcs.Date6 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) OR
                  CAST(tcs.Date7 AS DATE) = CAST(tcb.ClassBookingDate AS DATE)
              )
      ) cs

      WHERE 
          tcb.customerID = @customerID
          AND
		      tcb.isRelease = 0
      ORDER BY
          tcb.ClassBookingDate ASC,
          tcb.ClassBookingTime ASC;
    `);

  return result.recordset;
}

async function findHistoryByCustomerID(customerID) {
  if (!customerID) {
    throw new Error('customerID is required.');
  }

  const pool = await getPool();

  const result = await pool.request()
    .input('customerID', sql.VarChar(255), customerID)
    .query(`
      SELECT
          tcb.ClassBookingDate,
          mct.name,
          tcb.ContractID,
          tcb.AccessCardNumber,
          ms.name AS StudioName,
          mr.RoomName,
          mc.ClassName,
          tcb.ClassBookingTime,
          mts.ETime AS TimeClsEnd,
          tcb.ClassMapNumber,
          tcb.isActive,
          tcb.isConfirm,
          tcb.isRelease,

          -- Trainer names dari OUTER APPLY
          cs.Teacher1Name,
          cs.Teacher2Name

      FROM TrxClassBooking AS tcb
      LEFT JOIN MstTimeSchedule AS mts
          ON mts.studioID = tcb.StudioID
          AND tcb.ClassBookingDate BETWEEN mts.SDate AND mts.EDate
          AND mts.stime = tcb.ClassBookingTime

      INNER JOIN MstStudio AS ms
          ON ms.studioID = tcb.StudioID

      INNER JOIN MstRoomType AS mr
          ON mr.RoomType = tcb.RoomType

      INNER JOIN MstClass AS mc
          ON mc.ClassID = tcb.ClassID

      INNER JOIN MstCustomer AS mct
          ON mct.customerID = tcb.customerID

      -- Ambil nama trainer sesuai hari dari jadwal kelas
      OUTER APPLY (
          SELECT
              CASE
                  WHEN CAST(tcs.Date1 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_mon1.EmployeeName
                  WHEN CAST(tcs.Date2 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_tue1.EmployeeName
                  WHEN CAST(tcs.Date3 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_wed1.EmployeeName
                  WHEN CAST(tcs.Date4 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_thu1.EmployeeName
                  WHEN CAST(tcs.Date5 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_fri1.EmployeeName
                  WHEN CAST(tcs.Date6 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_sat1.EmployeeName
                  WHEN CAST(tcs.Date7 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_sun1.EmployeeName
              END AS Teacher1Name,

              CASE
                  WHEN CAST(tcs.Date1 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_mon2.EmployeeName
                  WHEN CAST(tcs.Date2 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_tue2.EmployeeName
                  WHEN CAST(tcs.Date3 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_wed2.EmployeeName
                  WHEN CAST(tcs.Date4 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_thu2.EmployeeName
                  WHEN CAST(tcs.Date5 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_fri2.EmployeeName
                  WHEN CAST(tcs.Date6 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_sat2.EmployeeName
                  WHEN CAST(tcs.Date7 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) THEN e_sun2.EmployeeName
              END AS Teacher2Name

          FROM TrxClassSchedule AS tcs
          LEFT JOIN MstEmployee e_mon1 ON e_mon1.EmployeeID = tcs.MonTch1
          LEFT JOIN MstEmployee e_mon2 ON e_mon2.EmployeeID = tcs.MonTch2
          LEFT JOIN MstEmployee e_tue1 ON e_tue1.EmployeeID = tcs.TueTch1
          LEFT JOIN MstEmployee e_tue2 ON e_tue2.EmployeeID = tcs.TueTch2
          LEFT JOIN MstEmployee e_wed1 ON e_wed1.EmployeeID = tcs.WedTch1
          LEFT JOIN MstEmployee e_wed2 ON e_wed2.EmployeeID = tcs.WedTch2
          LEFT JOIN MstEmployee e_thu1 ON e_thu1.EmployeeID = tcs.ThuTch1
          LEFT JOIN MstEmployee e_thu2 ON e_thu2.EmployeeID = tcs.ThuTch2
          LEFT JOIN MstEmployee e_fri1 ON e_fri1.EmployeeID = tcs.FriTch1
          LEFT JOIN MstEmployee e_fri2 ON e_fri2.EmployeeID = tcs.FriTch2
          LEFT JOIN MstEmployee e_sat1 ON e_sat1.EmployeeID = tcs.SatTch1
          LEFT JOIN MstEmployee e_sat2 ON e_sat2.EmployeeID = tcs.SatTch2
          LEFT JOIN MstEmployee e_sun1 ON e_sun1.EmployeeID = tcs.SunTch1
          LEFT JOIN MstEmployee e_sun2 ON e_sun2.EmployeeID = tcs.SunTch2

          WHERE
              tcs.StudioID = tcb.StudioID
              AND tcs.RoomType = tcb.RoomType
              AND tcb.ClassBookingDate BETWEEN tcs.SDate AND tcs.EDate
              AND tcs.TimeCls = tcb.ClassBookingTime
              AND (
                  CAST(tcs.Date1 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) OR
                  CAST(tcs.Date2 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) OR
                  CAST(tcs.Date3 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) OR
                  CAST(tcs.Date4 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) OR
                  CAST(tcs.Date5 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) OR
                  CAST(tcs.Date6 AS DATE) = CAST(tcb.ClassBookingDate AS DATE) OR
                  CAST(tcs.Date7 AS DATE) = CAST(tcb.ClassBookingDate AS DATE)
              )
      ) cs

      WHERE 
          tcb.customerID = @customerID
          AND
          tcb.isRelease = 1
      ORDER BY
          tcb.ClassBookingDate DESC,
          tcb.ClassBookingTime DESC;
    `);

  return result.recordset;
}




async function create(bookingData) {
  const pool = await getPool();

  // Ensure customerID is a string
  bookingData.customerID = String(bookingData.customerID);

  // 🔍 1. Cek apakah user punya booking yang belum dirilis
  const checkExisting = await pool.request()
    .input('customerID', sql.VarChar(255), bookingData.customerID)
    .query(`
      SELECT TOP 1 *
      FROM TrxClassBooking
      WHERE customerID = @customerID AND isRelease = 0
    `);

  // Jika sudah ada booking yang belum diselesaikan
  if (checkExisting.recordset.length > 0) {
    return {
      success: false,
      message: 'Please complete your previous booking before creating a new one.',
    };
  }

  // ✅ 2. Jika tidak ada booking aktif, buat booking baru
  const result = await pool.request()
    .input('studioID', sql.VarChar, bookingData.studioID)
    .input('RoomType', sql.Int, bookingData.RoomType)
    .input('ClassID', sql.Int, bookingData.ClassID)
    .input('ClassBookingDate', sql.DateTime, new Date(bookingData.ClassBookingDate))
    .input('ClassBookingTime', sql.VarChar, bookingData.ClassBookingTime)
    .input('customerID', sql.VarChar(255), bookingData.customerID)
    .input('ContractID', sql.VarChar, bookingData.ContractID)
    .input('AccessCardNumber', sql.Int, bookingData.AccessCardNumber)
    .input('isActive', sql.Bit, bookingData.isActive)
    .input('isRelease', sql.Bit, bookingData.isRelease)
    .input('isConfirm', sql.Bit, bookingData.isConfirm)
    .input('ClassMapNumber', sql.Int, bookingData.ClassMapNumber)
    .input('createby', sql.VarChar, bookingData.createby)
    .input('createdate', sql.DateTime, new Date(bookingData.createdate))
    .query(`
      INSERT INTO TrxClassBooking (
        studioID, RoomType, ClassID, ClassBookingDate, ClassBookingTime,
        customerID, ContractID, AccessCardNumber, isActive, isRelease,
        isConfirm, ClassMapNumber, createby, createdate
      ) VALUES (
        @studioID, @RoomType, @ClassID, @ClassBookingDate, @ClassBookingTime,
        @customerID, @ContractID, @AccessCardNumber, @isActive, @isRelease,
        @isConfirm, @ClassMapNumber, @createby, @createdate
      )
    `);

  return { success: true, message: 'Booking created successfully.' };
}

//NO VALIDATED

// async function create(bookingData) {
//   const pool = await getPool();
//   const result = await pool.request()
//     .input('studioID', sql.VarChar, bookingData.studioID)
//     .input('RoomType', sql.Int, bookingData.RoomType)
//     .input('ClassID', sql.Int, bookingData.ClassID)
//     .input('ClassBookingDate', sql.DateTime, new Date(bookingData.ClassBookingDate))
//     .input('ClassBookingTime', sql.VarChar, bookingData.ClassBookingTime)
//     .input('customerID', sql.VarChar, bookingData.customerID)
//     .input('ContractID', sql.VarChar, bookingData.ContractID)
//     .input('AccessCardNumber', sql.Int, bookingData.AccessCardNumber)
//     .input('isActive', sql.Bit, bookingData.isActive)
//     .input('isRelease', sql.Bit, bookingData.isRelease)
//     .input('isConfirm', sql.Bit, bookingData.isConfirm)
//     .input('ClassMapNumber', sql.Int, bookingData.ClassMapNumber)
//     .input('createby', sql.VarChar, bookingData.createby)
//     .input('createdate', sql.DateTime, new Date(bookingData.createdate))
//     .query(`
//       INSERT INTO TrxClassBooking (
//         studioID, RoomType, ClassID, ClassBookingDate, ClassBookingTime,
//         customerID, ContractID, AccessCardNumber, isActive, isRelease,
//         isConfirm, ClassMapNumber, createby, createdate
//       ) VALUES (
//         @studioID, @RoomType, @ClassID, @ClassBookingDate, @ClassBookingTime,
//         @customerID, @ContractID, @AccessCardNumber, @isActive, @isRelease,
//         @isConfirm, @ClassMapNumber, @createby, @createdate
//       )
//     `);

//   return { success: true };
// }

module.exports = { findAll, findByUniqCode, findByCustomerID, findHistoryByCustomerID, create };
