const express = require('express');

const auth = require('../../../../middleware/auth');
const requireAdminOrCourseTeacher = require('../../../../middleware/requireAdminOrCourseTeacher');
const validate = require('../../../shared/middleware/validate');
const authorize = require('../../../shared/security/authorize');
const { PERMISSIONS } = require('../../../shared/security/permissions');
const { ForbiddenError } = require('../../../shared/errors/AppError');

const controllers = require('./controllers');
const schemas = require('./validators');

const router = express.Router();

// Категории оценок: преподаватель курса / админ
router.get(
  '/courses/:courseId/grade-categories',
  auth,
  // используем существующий middleware (id берётся из :id) — оборачиваем
  (req, _res, next) => { req.params.id = req.params.courseId; return next(); },
  requireAdminOrCourseTeacher,
  validate({ params: schemas.courseIdParam }),
  controllers.listCategories,
);

router.post(
  '/courses/:courseId/grade-categories',
  auth,
  (req, _res, next) => { req.params.id = req.params.courseId; return next(); },
  requireAdminOrCourseTeacher,
  validate({ params: schemas.courseIdParam, body: schemas.categoryCreate }),
  controllers.createCategory,
);

router.put(
  '/grade-categories/:id',
  auth,
  authorize([PERMISSIONS.GRADE_ASSIGN, PERMISSIONS.COURSE_VIEW_ALL]),
  validate({ params: schemas.categoryIdParam, body: schemas.categoryUpdate }),
  controllers.updateCategory,
);

router.delete(
  '/grade-categories/:id',
  auth,
  authorize([PERMISSIONS.GRADE_ASSIGN, PERMISSIONS.COURSE_VIEW_ALL]),
  validate({ params: schemas.categoryIdParam }),
  controllers.deleteCategory,
);

// Ведомость и пересчёт
router.get(
  '/courses/:courseId/gradebook',
  auth,
  (req, _res, next) => { req.params.id = req.params.courseId; return next(); },
  requireAdminOrCourseTeacher,
  validate({ params: schemas.courseIdParam }),
  controllers.getGradebook,
);

router.post(
  '/courses/:courseId/final-grades/recalculate',
  auth,
  (req, _res, next) => { req.params.id = req.params.courseId; return next(); },
  requireAdminOrCourseTeacher,
  validate({ params: schemas.courseIdParam, body: schemas.recalculateBody }),
  controllers.recalculate,
);

// Транскрипт студента
router.get(
  '/students/:studentId/transcript',
  auth,
  (req, _res, next) => {
    if (req.params.studentId === 'me') return next();
    if (req.user?.role === 'admin' || req.user?.role === 'dean' || req.user?.role === 'teacher') {
      return next();
    }
    return next(new ForbiddenError('Можно посмотреть только собственный транскрипт'));
  },
  controllers.getTranscript,
);

module.exports = router;
