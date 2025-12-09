const { getPool, sql } = require('../Config/db');

async function findScheduleByParams(date, roomType, studioID) {
  const pool = await getPool();
  const result = await pool.request()
    .input('date', sql.Date, date)
    .input('roomType', sql.Int, roomType)
    .input('studioID', sql.Int, studioID)
    .query(`
      SELECT
          s.studioID,
          j.RoomType ,
          c.ClassID,
          c.TotalMap,
          cast(s.studioid as varchar(5)) + '|' + cast(j.roomtype as varchar(5)) + '|' + cast(c.classid as varchar(5)) + '|' + convert(varchar(10),@date,23) + '|' + j.TimeCls as UniqCode,
          j.TimeCls,
          (select ETime  from MstTimeSchedule where studioID =j.StudioID and SDate =j.SDate and edate=j.EDate and stime=j.TimeCls  ) as TimeClsEnd,      --TimeCls Berakhir
          s.Name AS StudioName,
          r.RoomName,
          c.ClassName,
          e1.EmployeeID AS tchID,
          e1.EmployeeName AS Teacher1,
          e2.EmployeeName AS Teacher2
      FROM TrxClassSchedule j
      INNER JOIN MstStudio s ON j.StudioID = s.StudioID
      INNER JOIN MstRoomType r ON j.RoomType = r.RoomType
      OUTER APPLY (
          SELECT
              CASE
                  WHEN CAST(j.Date1 AS DATE) = @date THEN j.MonCls
                  WHEN CAST(j.Date2 AS DATE) = @date THEN j.TueCls
                  WHEN CAST(j.Date3 AS DATE) = @date THEN j.WedCls
                  WHEN CAST(j.Date4 AS DATE) = @date THEN j.ThuCls
                  WHEN CAST(j.Date5 AS DATE) = @date THEN j.FriCls
                  WHEN CAST(j.Date6 AS DATE) = @date THEN j.SatCls
                  WHEN CAST(j.Date7 AS DATE) = @date THEN j.SunCls
              END AS ClassID,
              CASE
                  WHEN CAST(j.Date1 AS DATE) = @date THEN j.MonTch1
                  WHEN CAST(j.Date2 AS DATE) = @date THEN j.TueTch1
                  WHEN CAST(j.Date3 AS DATE) = @date THEN j.WedTch1
                  WHEN CAST(j.Date4 AS DATE) = @date THEN j.ThuTch1
                  WHEN CAST(j.Date5 AS DATE) = @date THEN j.FriTch1
                  WHEN CAST(j.Date6 AS DATE) = @date THEN j.SatTch1
                  WHEN CAST(j.Date7 AS DATE) = @date THEN j.SunTch1
              END AS Teacher1ID,
              CASE
                  WHEN CAST(j.Date1 AS DATE) = @date THEN j.MonTch2
                  WHEN CAST(j.Date2 AS DATE) = @date THEN j.TueTch2
                  WHEN CAST(j.Date3 AS DATE) = @date THEN j.WedTch2
                  WHEN CAST(j.Date4 AS DATE) = @date THEN j.ThuTch2
                  WHEN CAST(j.Date5 AS DATE) = @date THEN j.FriTch2
                  WHEN CAST(j.Date6 AS DATE) = @date THEN j.SatTch2
                  WHEN CAST(j.Date7 AS DATE) = @date THEN j.SunTch2
              END AS Teacher2ID
      ) cs
      LEFT JOIN MstClass c ON cs.ClassID = c.ClassID
      LEFT JOIN MstEmployee e1 ON cs.Teacher1ID = e1.EmployeeID
      LEFT JOIN MstEmployee e2 ON cs.Teacher2ID = e2.EmployeeID
      WHERE j.RoomType = @roomType
        AND j.StudioID = @studioID
        AND (
              CAST(j.Date1 AS DATE) = @date OR
              CAST(j.Date2 AS DATE) = @date OR
              CAST(j.Date3 AS DATE) = @date OR
              CAST(j.Date4 AS DATE) = @date OR
              CAST(j.Date5 AS DATE) = @date OR
              CAST(j.Date6 AS DATE) = @date OR
              CAST(j.Date7 AS DATE) = @date
            )
      ORDER BY j.TimeCls;
    `);

  return result.recordset;
}

async function findScheduleByDate(date) {
  const pool = await getPool();
  const result = await pool.request()
    .input('date', sql.Date, date)
    .query(`
      SELECT
          s.studioID,
          j.RoomType ,
          c.ClassID,
          c.TotalMap,
          cast(s.studioid as varchar(5)) + '|' + cast(j.roomtype as varchar(5)) + '|' + cast(c.classid as varchar(5)) + '|' + convert(varchar(10),@date,23) + '|' + j.TimeCls as UniqCode,
          j.TimeCls,
          (select ETime  from MstTimeSchedule where studioID =j.StudioID and SDate =j.SDate and edate=j.EDate and stime=j.TimeCls  ) as TimeClsEnd,      --TimeCls Berakhir
          s.Name AS StudioName,
          r.RoomName,
          c.ClassName,
          e1.EmployeeID AS tchID,
          e1.EmployeeName AS Teacher1,
          e2.EmployeeName AS Teacher2
      FROM TrxClassSchedule j
      INNER JOIN MstStudio s ON j.StudioID = s.StudioID
      INNER JOIN MstRoomType r ON j.RoomType = r.RoomType
      OUTER APPLY (
          SELECT
              CASE
                  WHEN CAST(j.Date1 AS DATE) = @date THEN j.MonCls
                  WHEN CAST(j.Date2 AS DATE) = @date THEN j.TueCls
                  WHEN CAST(j.Date3 AS DATE) = @date THEN j.WedCls
                  WHEN CAST(j.Date4 AS DATE) = @date THEN j.ThuCls
                  WHEN CAST(j.Date5 AS DATE) = @date THEN j.FriCls
                  WHEN CAST(j.Date6 AS DATE) = @date THEN j.SatCls
                  WHEN CAST(j.Date7 AS DATE) = @date THEN j.SunCls
              END AS ClassID,
              CASE
                  WHEN CAST(j.Date1 AS DATE) = @date THEN j.MonTch1
                  WHEN CAST(j.Date2 AS DATE) = @date THEN j.TueTch1
                  WHEN CAST(j.Date3 AS DATE) = @date THEN j.WedTch1
                  WHEN CAST(j.Date4 AS DATE) = @date THEN j.ThuTch1
                  WHEN CAST(j.Date5 AS DATE) = @date THEN j.FriTch1
                  WHEN CAST(j.Date6 AS DATE) = @date THEN j.SatTch1
                  WHEN CAST(j.Date7 AS DATE) = @date THEN j.SunTch1
              END AS Teacher1ID,
              CASE
                  WHEN CAST(j.Date1 AS DATE) = @date THEN j.MonTch2
                  WHEN CAST(j.Date2 AS DATE) = @date THEN j.TueTch2
                  WHEN CAST(j.Date3 AS DATE) = @date THEN j.WedTch2
                  WHEN CAST(j.Date4 AS DATE) = @date THEN j.ThuTch2
                  WHEN CAST(j.Date5 AS DATE) = @date THEN j.FriTch2
                  WHEN CAST(j.Date6 AS DATE) = @date THEN j.SatTch2
                  WHEN CAST(j.Date7 AS DATE) = @date THEN j.SunTch2
              END AS Teacher2ID
      ) cs
      LEFT JOIN MstClass c ON cs.ClassID = c.ClassID
      LEFT JOIN MstEmployee e1 ON cs.Teacher1ID = e1.EmployeeID
      LEFT JOIN MstEmployee e2 ON cs.Teacher2ID = e2.EmployeeID
      WHERE (
              CAST(j.Date1 AS DATE) = @date OR
              CAST(j.Date2 AS DATE) = @date OR
              CAST(j.Date3 AS DATE) = @date OR
              CAST(j.Date4 AS DATE) = @date OR
              CAST(j.Date5 AS DATE) = @date OR
              CAST(j.Date6 AS DATE) = @date OR
              CAST(j.Date7 AS DATE) = @date
            )
      ORDER BY j.TimeCls;
    `);

  return result.recordset;
}

async function findScheduleByDateAndStudio(date, studioID) {
  const pool = await getPool();
  const result = await pool.request()
    .input('date', sql.Date, date)
    .input('studioID', sql.Int, studioID)
    .query(`
      SELECT
          s.studioID,
          j.RoomType ,
          c.ClassID,
          c.TotalMap,
          cast(s.studioid as varchar(5)) + '|' + cast(j.roomtype as varchar(5)) + '|' + cast(c.classid as varchar(5)) + '|' + convert(varchar(10),@date,23) + '|' + j.TimeCls as UniqCode,
          j.TimeCls,
          (select ETime  from MstTimeSchedule where studioID =j.StudioID and SDate =j.SDate and edate=j.EDate and stime=j.TimeCls  ) as TimeClsEnd,      --TimeCls Berakhir
          s.Name AS StudioName,
          r.RoomName,
          c.ClassName,
          e1.EmployeeID AS tchID,
          e1.EmployeeName AS Teacher1,
          e2.EmployeeName AS Teacher2
      FROM TrxClassSchedule j
      INNER JOIN MstStudio s ON j.StudioID = s.StudioID
      INNER JOIN MstRoomType r ON j.RoomType = r.RoomType
      OUTER APPLY (
          SELECT
              CASE
                  WHEN CAST(j.Date1 AS DATE) = @date THEN j.MonCls
                  WHEN CAST(j.Date2 AS DATE) = @date THEN j.TueCls
                  WHEN CAST(j.Date3 AS DATE) = @date THEN j.WedCls
                  WHEN CAST(j.Date4 AS DATE) = @date THEN j.ThuCls
                  WHEN CAST(j.Date5 AS DATE) = @date THEN j.FriCls
                  WHEN CAST(j.Date6 AS DATE) = @date THEN j.SatCls
                  WHEN CAST(j.Date7 AS DATE) = @date THEN j.SunCls
              END AS ClassID,
              CASE
                  WHEN CAST(j.Date1 AS DATE) = @date THEN j.MonTch1
                  WHEN CAST(j.Date2 AS DATE) = @date THEN j.TueTch1
                  WHEN CAST(j.Date3 AS DATE) = @date THEN j.WedTch1
                  WHEN CAST(j.Date4 AS DATE) = @date THEN j.ThuTch1
                  WHEN CAST(j.Date5 AS DATE) = @date THEN j.FriTch1
                  WHEN CAST(j.Date6 AS DATE) = @date THEN j.SatTch1
                  WHEN CAST(j.Date7 AS DATE) = @date THEN j.SunTch1
              END AS Teacher1ID,
              CASE
                  WHEN CAST(j.Date1 AS DATE) = @date THEN j.MonTch2
                  WHEN CAST(j.Date2 AS DATE) = @date THEN j.TueTch2
                  WHEN CAST(j.Date3 AS DATE) = @date THEN j.WedTch2
                  WHEN CAST(j.Date4 AS DATE) = @date THEN j.ThuTch2
                  WHEN CAST(j.Date5 AS DATE) = @date THEN j.FriTch2
                  WHEN CAST(j.Date6 AS DATE) = @date THEN j.SatTch2
                  WHEN CAST(j.Date7 AS DATE) = @date THEN j.SunTch2
              END AS Teacher2ID
      ) cs
      LEFT JOIN MstClass c ON cs.ClassID = c.ClassID
      LEFT JOIN MstEmployee e1 ON cs.Teacher1ID = e1.EmployeeID
      LEFT JOIN MstEmployee e2 ON cs.Teacher2ID = e2.EmployeeID
      WHERE j.StudioID = @studioID
        AND (
              CAST(j.Date1 AS DATE) = @date OR
              CAST(j.Date2 AS DATE) = @date OR
              CAST(j.Date3 AS DATE) = @date OR
              CAST(j.Date4 AS DATE) = @date OR
              CAST(j.Date5 AS DATE) = @date OR
              CAST(j.Date6 AS DATE) = @date OR
              CAST(j.Date7 AS DATE) = @date
            )
      ORDER BY j.TimeCls;
    `);

  return result.recordset;
}

async function findScheduleByDateAndRoomType(date, roomType) {
  const pool = await getPool();
  const result = await pool.request()
    .input('date', sql.Date, date)
    .input('roomType', sql.Int, roomType)
    .query(`
      SELECT
          s.studioID,
          j.RoomType ,
          c.ClassID,
          c.TotalMap,
          cast(s.studioid as varchar(5)) + '|' + cast(j.roomtype as varchar(5)) + '|' + cast(c.classid as varchar(5)) + '|' + convert(varchar(10),@date,23) + '|' + j.TimeCls as UniqCode,
          j.TimeCls,
          (select ETime  from MstTimeSchedule where studioID =j.StudioID and SDate =j.SDate and edate=j.EDate and stime=j.TimeCls  ) as TimeClsEnd,      --TimeCls Berakhir
          s.Name AS StudioName,
          r.RoomName,
          c.ClassName,
          e1.EmployeeID AS tchID,
          e1.EmployeeName AS Teacher1,
          e2.EmployeeName AS Teacher2
      FROM TrxClassSchedule j
      INNER JOIN MstStudio s ON j.StudioID = s.StudioID
      INNER JOIN MstRoomType r ON j.RoomType = r.RoomType
      OUTER APPLY (
          SELECT
              CASE
                  WHEN CAST(j.Date1 AS DATE) = @date THEN j.MonCls
                  WHEN CAST(j.Date2 AS DATE) = @date THEN j.TueCls
                  WHEN CAST(j.Date3 AS DATE) = @date THEN j.WedCls
                  WHEN CAST(j.Date4 AS DATE) = @date THEN j.ThuCls
                  WHEN CAST(j.Date5 AS DATE) = @date THEN j.FriCls
                  WHEN CAST(j.Date6 AS DATE) = @date THEN j.SatCls
                  WHEN CAST(j.Date7 AS DATE) = @date THEN j.SunCls
              END AS ClassID,
              CASE
                  WHEN CAST(j.Date1 AS DATE) = @date THEN j.MonTch1
                  WHEN CAST(j.Date2 AS DATE) = @date THEN j.TueTch1
                  WHEN CAST(j.Date3 AS DATE) = @date THEN j.WedTch1
                  WHEN CAST(j.Date4 AS DATE) = @date THEN j.ThuTch1
                  WHEN CAST(j.Date5 AS DATE) = @date THEN j.FriTch1
                  WHEN CAST(j.Date6 AS DATE) = @date THEN j.SatTch1
                  WHEN CAST(j.Date7 AS DATE) = @date THEN j.SunTch1
              END AS Teacher1ID,
              CASE
                  WHEN CAST(j.Date1 AS DATE) = @date THEN j.MonTch2
                  WHEN CAST(j.Date2 AS DATE) = @date THEN j.TueTch2
                  WHEN CAST(j.Date3 AS DATE) = @date THEN j.WedTch2
                  WHEN CAST(j.Date4 AS DATE) = @date THEN j.ThuTch2
                  WHEN CAST(j.Date5 AS DATE) = @date THEN j.FriTch2
                  WHEN CAST(j.Date6 AS DATE) = @date THEN j.SatTch2
                  WHEN CAST(j.Date7 AS DATE) = @date THEN j.SunTch2
              END AS Teacher2ID
      ) cs
      LEFT JOIN MstClass c ON cs.ClassID = c.ClassID
      LEFT JOIN MstEmployee e1 ON cs.Teacher1ID = e1.EmployeeID
      LEFT JOIN MstEmployee e2 ON cs.Teacher2ID = e2.EmployeeID
      WHERE j.RoomType = @roomType
        AND (
              CAST(j.Date1 AS DATE) = @date OR
              CAST(j.Date2 AS DATE) = @date OR
              CAST(j.Date3 AS DATE) = @date OR
              CAST(j.Date4 AS DATE) = @date OR
              CAST(j.Date5 AS DATE) = @date OR
              CAST(j.Date6 AS DATE) = @date OR
              CAST(j.Date7 AS DATE) = @date
            )
      ORDER BY j.TimeCls;
    `);

  return result.recordset;
}

module.exports = { findScheduleByParams, findScheduleByDate, findScheduleByDateAndStudio, findScheduleByDateAndRoomType };
