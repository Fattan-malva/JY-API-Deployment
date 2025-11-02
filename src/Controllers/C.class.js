const ClassModel = require('../Models/M.class');

async function index(req, res) {
  const classes = await ClassModel.findAll();
  res.json(classes);
}

async function show(req, res) {
  const id = Number(req.params.id);
  const classData = await ClassModel.findById(id);
  if (!classData) return res.status(404).json({ message: 'Not found' });
  res.json(classData);
}

async function store(req, res) {
  const { className, totalMap, isActive } = req.body;

  if (!className || totalMap === undefined || isActive === undefined) {
    return res.status(400).json({ message: 'ClassName, TotalMap, and isActive are required' });
  }

  const newClass = await ClassModel.create(req.body);
  res.status(201).json(newClass);
}

async function update(req, res) {
  const id = Number(req.params.id);
  const { className, totalMap, isActive } = req.body;

  if (!className || totalMap === undefined || isActive === undefined) {
    return res.status(400).json({ message: 'ClassName, TotalMap, and isActive are required' });
  }

  const updatedClass = await ClassModel.update(id, req.body);
  if (!updatedClass) return res.status(404).json({ message: 'Not found' });
  res.json(updatedClass);
}

async function destroy(req, res) {
  const id = Number(req.params.id);
  await ClassModel.remove(id);
  res.status(204).send();
}

module.exports = { index, show, store, update, destroy };
