const EmployeeModel = require('../Models/M.MstEmployee');

async function index(req, res) {
  const employees = await EmployeeModel.findAll();
  res.json(employees);
}

module.exports = { index };