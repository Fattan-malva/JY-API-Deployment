const { getPool, sql } = require('../Config/db');

async function findAll() {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM MstRoomType');
    return result.recordset;
}
module.exports = { findAll };
