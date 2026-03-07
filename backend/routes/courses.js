const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/my', auth, courseController.myCourses);

router.use(auth, requireAdmin);
router.post('/', courseController.create);
router.get('/', courseController.list);
router.get('/:id', courseController.getById);
router.put('/:id', courseController.update);
router.post('/:id/members', courseController.addMember);
router.delete('/:id/members/:userId', courseController.removeMember);

module.exports = router;
