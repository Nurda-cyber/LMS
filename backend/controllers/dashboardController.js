const dashboardService = require('../services/dashboardService');

/**
 * GET /dashboard/admin — system stats (admin only).
 */
async function admin(req, res) {
  try {
    const data = await dashboardService.getAdminStats();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при загрузке данных дашборда' });
  }
}

/**
 * GET /dashboard/teacher — teacher courses, assignments, pending submissions (teacher only).
 */
async function teacher(req, res) {
  try {
    const data = await dashboardService.getTeacherDashboard(req.user.id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при загрузке данных дашборда' });
  }
}

/**
 * GET /dashboard/student — student courses, assignments, grades (student only).
 */
async function student(req, res) {
  try {
    const data = await dashboardService.getStudentDashboard(req.user.id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при загрузке данных дашборда' });
  }
}

module.exports = {
  admin,
  teacher,
  student
};
