const asyncHandler = require('../../../shared/http/asyncHandler');

/**
 * Фабрика тонких контроллеров над use-cases.
 * Контроллеры только мапят req/res и не содержат бизнес-логику.
 */
function makeController(useCases) {
  return {
    list: asyncHandler(async (_req, res) => {
      const items = await useCases.list();
      res.json(items);
    }),
    getById: asyncHandler(async (req, res) => {
      const item = await useCases.getById(req.params.id);
      res.json(item);
    }),
    create: asyncHandler(async (req, res) => {
      const item = await useCases.create(req.body);
      res.status(201).json(item);
    }),
    update: asyncHandler(async (req, res) => {
      const item = await useCases.update(req.params.id, req.body);
      res.json(item);
    }),
    remove: asyncHandler(async (req, res) => {
      await useCases.remove(req.params.id);
      res.status(204).send();
    }),
  };
}

const {
  facultyUseCases,
  departmentUseCases,
  specialtyUseCases,
  academicYearUseCases,
  semesterUseCases,
  groupUseCases,
} = require('../../../application/use-cases/structure');

module.exports = {
  faculty: makeController(facultyUseCases),
  department: makeController(departmentUseCases),
  specialty: makeController(specialtyUseCases),
  academicYear: makeController(academicYearUseCases),
  semester: makeController(semesterUseCases),
  group: makeController(groupUseCases),
};
