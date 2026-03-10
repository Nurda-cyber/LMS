const express = require('express');
const auth = require('../middleware/auth');
const submissionController = require('../controllers/submissionController');

const router = express.Router();

// GET /assignments/:id/submissions — список работ по заданию (для учителя/админа)
router.get('/assignments/:id/submissions', auth, submissionController.listByAssignment);

// PUT /submissions/:id/grade — выставление оценки и отзыва (учитель/админ)
router.put('/:id/grade', auth, submissionController.grade);

module.exports = router;

