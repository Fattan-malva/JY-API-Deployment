const { getPool, sql } = require('../Config/db');

async function findAll() {
    const pool = await getPool();
    const result = await pool.request().query("SELECT * FROM MstStudio WHERE trainingSite = '1'");
    return result.recordset;
}
module.exports = { findAll };
