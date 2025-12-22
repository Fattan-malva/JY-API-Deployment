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

module.exports = { findByStudentID };
