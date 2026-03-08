const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const requireAdminOrCourseTeacher = require('../middleware/requireAdminOrCourseTeacher');

router.get('/my', auth, courseController.myCourses);

router.post('/', auth, requireAdmin, courseController.create);
router.get('/', auth, requireAdmin, courseController.list);
router.put('/:id', auth, requireAdmin, courseController.update);
router.post('/:id/members', auth, requireAdmin, courseController.addMember);
router.delete('/:id/members/:userId', auth, requireAdmin, courseController.removeMember);

router.get('/:id', auth, requireAdminOrCourseTeacher, courseController.getById);
router.get('/:id/assignments', auth, requireAdminOrCourseTeacher, courseController.listAssignments);
router.post('/:id/assignments', auth, requireAdminOrCourseTeacher, courseController.createAssignment);
router.put('/:id/assignments/:assignmentId', auth, requireAdminOrCourseTeacher, courseController.updateAssignment);
router.delete('/:id/assignments/:assignmentId', auth, requireAdminOrCourseTeacher, courseController.deleteAssignment);
router.post('/:id/assignments/:assignmentId/grades', auth, requireAdminOrCourseTeacher, courseController.setGrade);

module.exports = router;
