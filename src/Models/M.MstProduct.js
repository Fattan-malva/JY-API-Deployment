const { getPool, sql } = require('../Config/db');

async function findActivePlanByLastContractID(lastContractID) {
  const pool = await getPool();

  const result = await pool.request()
    .input('lastContractID', sql.VarChar(255), lastContractID)
    .query(`
      SELECT
        mcl.name, 
        mp.productName,
        tc.status,
        tc.productID, 
        tc.contractID, 
        tc.startDate, 
        tc.endDate
      FROM TrxContract tc
      INNER JOIN MstProduct mp on tc.productID = mp.productID
      INNER JOIN MstCustomerLogin mcl on tc.contractID = mcl.lastContractID
      where mcl.lastContractID = @lastContractID 
    `);

  return result.recordset;
}

async function findPlanProductByCustomerID(customerID) {
  const pool = await getPool();

  const result = await pool.request()
    .input('customerID', sql.VarChar(255), customerID)
    .query(`
      SELECT
        mp.productName,
        tc.startDate,
        tc.endDate,
        tc.trxDate
      FROM TrxContract tc
      INNER JOIN MstProduct mp ON tc.productID = mp.productID
      WHERE tc.customerID = @customerID
      ORDER BY tc.trxDate ASC
    `);

  return result.recordset;
}

async function findJustMeHistoryByCustomerID(customerID) {
  const pool = await getPool();

  const result = await pool.request()
    .input('customerID', sql.VarChar(255), customerID)
    .query(`
      SELECT
        mp.productName,
        tj.startDate,
        tj.endDate,
        tj.remainSession
      FROM TrxJustMe tj
      INNER JOIN MstProduct mp ON tj.productID = mp.productID
      WHERE tj.customerID = @customerID
      ORDER BY tj.startDate ASC
    `);

  return result.recordset;
}

module.exports = { findPlanProductByCustomerID, findJustMeHistoryByCustomerID, findActivePlanByLastContractID };
