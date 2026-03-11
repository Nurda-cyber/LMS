require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const notificationRoutes = require('./routes/notifications');
const assignmentRoutes = require('./routes/assignments');
const submissionRoutes = require('./routes/submissions');
const dashboardRoutes = require('./routes/dashboard');
const { User, Course, CourseUser, PasswordChangeRequest, Notification, Assignment, AssignmentGrade, Submission } = require('./models');
const { startDeadlineScheduler } = require('./services/deadlineScheduler');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    await User.sync({ alter: true });
    await Course.sync({ alter: true });
    await CourseUser.sync({ alter: true });
    await PasswordChangeRequest.sync({ alter: true });
    await Notification.sync({ alter: true });
    await Assignment.sync({ alter: true });
    await AssignmentGrade.sync({ alter: true });
    await Submission.sync({ alter: true });
    console.log('База данных подключена');
    app.listen(PORT, () => {
      console.log(`Сервер: http://localhost:${PORT}`);
    });
    startDeadlineScheduler();
  } catch (err) {
    console.error('Ошибка запуска:', err.message);
    process.exit(1);
  }
}

start();
