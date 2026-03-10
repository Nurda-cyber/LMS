const notificationService = require('../services/notificationService');

exports.list = async (req, res) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user.id, 100);
    res.json(notifications);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.markRead = async (req, res) => {
  try {
    const updated = await notificationService.markNotificationRead(req.params.id, req.user.id);
    if (!updated) {
      return res.status(404).json({ error: 'Уведомление не найдено' });
    }
    res.json(updated);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await notificationService.deleteNotification(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Уведомление не найдено' });
    }
    res.json({ message: 'Удалено' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

