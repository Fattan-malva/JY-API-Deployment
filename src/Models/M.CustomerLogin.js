const { getPool, sql } = require('../Config/db');

async function findById(customerID) {
  const pool = await getPool();
  const result = await pool.request()
    .input('customerID', sql.VarChar(255), customerID)
    .query(`
      SELECT 
        mcl.customerID,
        mcl.name,
        mcl.email,
        mcl.password,
        mcl.toStudioID,
		    ms.name as StudioName,
        mcl.lastContractID,
        mcl.noIdentity,
        mcl.birthDate,
        mcl.phone,
        mci.pic
      FROM MstCustomerLogin mcl
	    INNER JOIN MstStudio ms ON ms.studioID = mcl.toStudioID
      LEFT JOIN MstCustomerImage mci ON mci.customerID = mcl.customerID
      WHERE mcl.customerID =  @customerID`);
  return result.recordset[0];
}

module.exports = { findById };
