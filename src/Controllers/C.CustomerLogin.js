const CustomerLoginModel = require('../Models/M.CustomerLogin');

async function show(req, res) {
  const customerID = req.query.customerID;
  if (!customerID) return res.status(400).json({ message: 'customerID query parameter is required' });
  const customerData = await CustomerLoginModel.findById(customerID);
  if (!customerData) return res.status(404).json({ message: 'Customer not found' });
  res.json(customerData);
}

module.exports = { show };
