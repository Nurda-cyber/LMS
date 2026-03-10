const { createDeadlineNotificationsWindow } = require('./notificationService');

function startDeadlineScheduler() {
  // Запускаем проверку каждые 60 минут
  const HOUR_MS = 60 * 60 * 1000;

  async function tick() {
    try {
      const now = new Date();
      // Окно вокруг точки "ровно за 24 часа до дедлайна"
      const windowStart = new Date(now.getTime() + 24 * 60 * 60 * 1000 - HOUR_MS / 2);
      const windowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000 + HOUR_MS / 2);
      await createDeadlineNotificationsWindow(windowStart, windowEnd);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Ошибка планировщика дедлайнов:', err);
    }
  }

  // Первый запуск через пару минут после старта сервера, чтобы база успела инициализироваться
  setTimeout(() => {
    tick();
    setInterval(tick, HOUR_MS);
  }, 2 * 60 * 1000);
}

module.exports = { startDeadlineScheduler };

