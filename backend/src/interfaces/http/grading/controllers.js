const asyncHandler = require('../../../shared/http/asyncHandler');
const useCases = require('../../../application/use-cases/grading');

const listCategories = asyncHandler(async (req, res) => {
  const items = await useCases.listCategories(req.params.courseId);
  res.json(items);
});

const createCategory = asyncHandler(async (req, res) => {
  const created = await useCases.createCategory({
    courseId: Number(req.params.courseId),
    ...req.body,
  });
  res.status(201).json(created);
});

const updateCategory = asyncHandler(async (req, res) => {
  const updated = await useCases.updateCategory(req.params.id, req.body);
  res.json(updated);
});

const deleteCategory = asyncHandler(async (req, res) => {
  await useCases.deleteCategory(req.params.id);
  res.status(204).send();
});

const getGradebook = asyncHandler(async (req, res) => {
  const data = await useCases.getGradebook(req.params.courseId);
  res.json(data);
});

const recalculate = asyncHandler(async (req, res) => {
  const result = await useCases.recalculateFinalGrades({
    courseId: Number(req.params.courseId),
    semesterId: req.body?.semesterId ?? null,
    finalize: !!req.body?.finalize,
  });
  res.json({ count: result.length, items: result });
});

const getTranscript = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId === 'me' ? req.user.id : Number(req.params.studentId);
  const data = await useCases.getStudentTranscript(studentId);
  res.json(data);
});

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getGradebook,
  recalculate,
  getTranscript,
};
