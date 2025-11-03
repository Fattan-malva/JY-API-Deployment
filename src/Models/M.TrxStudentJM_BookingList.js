const { getPool, sql } = require('../Config/db');

async function findByCustomerId(CustomerId) {
    const pool = await getPool();
    const result = await pool.request()
        .input('CustomerId', sql.VarChar(50), CustomerId)
        .query(`
      SELECT 
        me.employeeName,
        fs.name AS FromStudioName,
        ts.name AS ToStudioName,
        tsj.*
      FROM TrxStudentJM_BookingList tsj
      INNER JOIN MstEmployee me 
        ON me.employeeID = tsj.TchID
      INNER JOIN MstStudio fs 
        ON fs.studioID = tsj.FromStudioID
      INNER JOIN MstStudio ts 
        ON ts.studioID = tsj.ToStudioID
      WHERE tsj.CustomerID = @CustomerId
      ORDER BY TrxDate
    `);

    return result.recordset;
}

module.exports = { findByCustomerId };
