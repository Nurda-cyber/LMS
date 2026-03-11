const express = require('express');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const requireTeacher = require('../middleware/requireTeacher');
const requireStudent = require('../middleware/requireStudent');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.get('/admin', auth, requireAdmin, dashboardController.admin);
router.get('/teacher', auth, requireTeacher, dashboardController.teacher);
router.get('/student', auth, requireStudent, dashboardController.student);

module.exports = router;
