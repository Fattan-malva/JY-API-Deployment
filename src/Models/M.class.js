const { getPool, sql } = require('../Config/db');

async function findAll() {
  const pool = await getPool();
  const result = await pool.request().query('SELECT * FROM MstClass');
  return result.recordset;
}

async function findById(id) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.SmallInt, id)
    .query('SELECT * FROM MstClass WHERE ClassID=@id');
  return result.recordset[0];
}

async function create(data) {
  const pool = await getPool();
  const result = await pool.request()
    .input('ClassName', sql.VarChar(50), data.className)
    .input('TotalMap', sql.TinyInt, data.totalMap)
    .input('isActive', sql.Bit, data.isActive)
    .query(`INSERT INTO MstClass (ClassName, TotalMap, isActive)
            OUTPUT INSERTED.*
            VALUES (@ClassName, @TotalMap, @isActive)`);
  return result.recordset[0];
}

async function update(id, data) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.SmallInt, id)
    .input('ClassName', sql.VarChar(50), data.className)
    .input('TotalMap', sql.TinyInt, data.totalMap)
    .input('isActive', sql.Bit, data.isActive)
    .query(`UPDATE MstClass
            SET ClassName=@ClassName, TotalMap=@TotalMap, isActive=@isActive
            OUTPUT INSERTED.*
            WHERE ClassID=@id`);
  return result.recordset[0];
}

async function remove(id) {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.SmallInt, id)
    .query('DELETE FROM MstClass WHERE ClassID=@id');
  return;
}

module.exports = { findAll, findById, create, update, remove };
