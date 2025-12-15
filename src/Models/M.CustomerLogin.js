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
        ms.name AS StudioName,
        mcl.lastContractID,
        mp.isAllClub,
        tc.status,
        tc.endDate AS EndDateMembership,
        tjm.endDate AS EndDateJMMembership,
        mcl.noIdentity,
        mcl.birthDate,
        mcl.phone,
        mci.pic
      FROM MstCustomerLogin mcl
        INNER JOIN MstStudio ms 
          ON ms.studioID = mcl.toStudioID
        LEFT JOIN TrxContract tc 
          ON tc.contractID = mcl.lastContractID
        LEFT JOIN MstProduct mp 
          ON mp.productID = tc.productID
        LEFT JOIN (
          SELECT customerID, endDate
          FROM TrxJustMe tjm1
          WHERE tjm1.endDate = (
            SELECT MAX(endDate)
            FROM TrxJustMe tjm2
            WHERE tjm2.customerID = tjm1.customerID
          )
        ) tjm 
          ON tjm.customerID = mcl.customerID
        LEFT JOIN MstCustomerImage mci 
          ON mci.customerID = mcl.customerID
      WHERE mcl.customerID = @customerID
    `);

  return result.recordset[0];
}


module.exports = { findById };
