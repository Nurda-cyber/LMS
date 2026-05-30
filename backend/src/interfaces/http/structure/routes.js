const express = require('express');

const auth = require('../../../../middleware/auth');
const authorize = require('../../../shared/security/authorize');
const { PERMISSIONS } = require('../../../shared/security/permissions');
const validate = require('../../../shared/middleware/validate');

const controllers = require('./controllers');
const schemas = require('./validators');

const router = express.Router();

const canManage = authorize(PERMISSIONS.STRUCTURE_MANAGE);
const canView = authorize([PERMISSIONS.STRUCTURE_VIEW, PERMISSIONS.STRUCTURE_MANAGE]);

function mountCRUD(path, controller, validators) {
  router.get(path, auth, canView, controller.list);
  router.get(`${path}/:id`, auth, canView, validate({ params: validators.idParam || validators.params }), controller.getById);
  router.post(path, auth, canManage, validate({ body: validators.create.body }), controller.create);
  router.put(`${path}/:id`, auth, canManage, validate(validators.update), controller.update);
  router.delete(`${path}/:id`, auth, canManage, validate({ params: validators.idParam || validators.params }), controller.remove);
}

mountCRUD('/faculties', controllers.faculty, {
  idParam: schemas.idParam,
  create: schemas.faculty,
  update: schemas.facultyPartial,
});

mountCRUD('/departments', controllers.department, {
  idParam: schemas.idParam,
  create: schemas.department,
  update: schemas.departmentPartial,
});

mountCRUD('/specialties', controllers.specialty, {
  idParam: schemas.idParam,
  create: schemas.specialty,
  update: schemas.specialtyPartial,
});

mountCRUD('/academic-years', controllers.academicYear, {
  idParam: schemas.idParam,
  create: schemas.academicYear,
  update: schemas.academicYearPartial,
});

mountCRUD('/semesters', controllers.semester, {
  idParam: schemas.idParam,
  create: schemas.semester,
  update: schemas.semesterPartial,
});

mountCRUD('/groups', controllers.group, {
  idParam: schemas.idParam,
  create: schemas.group,
  update: schemas.groupPartial,
});

module.exports = router;
