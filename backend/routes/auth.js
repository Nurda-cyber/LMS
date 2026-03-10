const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.me);

router.post('/request-password-change', auth, authController.requestPasswordChange);

router.get('/pending-password-changes', auth, requireAdmin, authController.getPendingPasswordChanges);
router.post('/pending-password-changes/:id/accept', auth, requireAdmin, authController.acceptPasswordChange);

router.post('/register-teacher', auth, requireAdmin, authController.registerTeacher);
router.get('/teachers', auth, requireAdmin, authController.getTeachers);
router.get('/students', auth, requireAdmin, authController.getStudents);

module.exports = router;
