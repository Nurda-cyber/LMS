const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// Получить уведомления текущего пользователя
router.get('/', auth, notificationController.list);

// Отметить уведомление как прочитанное
router.put('/:id/read', auth, notificationController.markRead);
router.post('/:id/read', auth, notificationController.markRead); // совместимость с различными клиентами

// Удалить уведомление
router.delete('/:id', auth, notificationController.remove);

module.exports = router;

