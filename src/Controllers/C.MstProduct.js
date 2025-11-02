const ProductModel = require('../Models/M.MstProduct');

async function findActivePlanByLastContractID(req, res) {
  try {
    const { lastContractID } = req.query;

    // ✅ Validasi input
    if (!lastContractID) {
      return res.status(400).json({ message: "lastContractID is required" });
    }

    // ✅ Ambil data dari model
    const data = await ProductModel.findActivePlanByLastContractID(lastContractID);

    if (data.length === 0) {
      return res.status(404).json({ message: "No active plan found for this customer" });
    }

    // ✅ Berhasil
    res.json(data);
  } catch (error) {
    console.error("Error fetching active plan:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function findPlanProductByCustomerID(req, res) {
  try {
    const { customerID } = req.query;

    // ✅ Validasi input
    if (!customerID) {
      return res.status(400).json({ message: "customerID is required" });
    }

    // ✅ Ambil data dari model
    const data = await ProductModel.findPlanProductByCustomerID(customerID);

    if (data.length === 0) {
      return res.status(404).json({ message: "No plan history found for this customer" });
    }

    // ✅ Berhasil
    res.json(data);
  } catch (error) {
    console.error("Error fetching plan history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function findJustMeHistoryByCustomerID(req, res) {
  try {
    const { customerID } = req.query;

    // ✅ Validasi input
    if (!customerID) {
      return res.status(400).json({ message: "customerID is required" });
    }

    // ✅ Ambil data dari model
    const data = await ProductModel.findJustMeHistoryByCustomerID(customerID);

    if (data.length === 0) {
      return res.status(404).json({ message: "No just me history found for this customer" });
    }

    // ✅ Berhasil
    res.json(data);
  } catch (error) {
    console.error("Error fetching just me history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { findPlanProductByCustomerID ,findJustMeHistoryByCustomerID , findActivePlanByLastContractID };
