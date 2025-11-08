const { getPool, sql } = require('../Config/db');

async function findAll() {
    const pool = await getPool();

    const result = await pool.request()
        .query(`
            SELECT 
                me.employeeID, 
                me.absenID, 
                me.employeeName, 
                me.gender, 
                me.dateOfBirth, 
                me.address, 
                me.phone, 
                me.email, 
                ms.name AS StudioName, 
                md.name AS Departement,
                mps.name AS Position
            FROM MstEmployee me
            INNER JOIN MstStudio ms ON ms.studioID = me.studioID
            INNER JOIN MstDepartment md ON md.deptID = me.deptID
            INNER JOIN MstPosition mps ON mps.positionID = me.positionID
            WHERE me.positionID = 2 AND me.active = 1
            ORDER BY me.employeeName
            `)
        ;
    return result.recordset;
}

module.exports = {
    findAll,
};