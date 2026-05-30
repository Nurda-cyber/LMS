require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const pinoHttp = require('pino-http');

const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const notificationRoutes = require('./routes/notifications');
const assignmentRoutes = require('./routes/assignments');
const submissionRoutes = require('./routes/submissions');
const dashboardRoutes = require('./routes/dashboard');
const {
  User, Course, CourseUser, PasswordChangeRequest,
  Notification, Assignment, AssignmentGrade, Submission,
} = require('./models');
const { startDeadlineScheduler } = require('./services/deadlineScheduler');

const {
  logger,
  errorHandler,
  notFoundHandler,
  globalLimiter,
  authLimiter,
} = require('./src/shared');

const { syncStructureModels } = require('./src/infrastructure/db/models');
const structureRoutes = require('./src/interfaces/http/structure/routes');
const gradingRoutes = require('./src/interfaces/http/grading/routes');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(compression());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(pinoHttp({ logger, customLogLevel: (_req, res, err) => {
  if (err || res.statusCode >= 500) return 'error';
  if (res.statusCode >= 400) return 'warn';
  return 'info';
} }));

app.use('/api/', globalLimiter);
app.use('/api/auth', authLimiter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/structure', structureRoutes);
app.use('/api/grading', gradingRoutes);

app.get('/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.use('/api', notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    await User.sync({ alter: true });
    await Course.sync({ alter: true });
    await CourseUser.sync({ alter: true });
    await PasswordChangeRequest.sync({ alter: true });
    await Notification.sync({ alter: true });
    // Сначала структура и категории оценок — на них есть FK из Assignment.categoryId
    await syncStructureModels();
    await Assignment.sync({ alter: true });
    await AssignmentGrade.sync({ alter: true });
    await Submission.sync({ alter: true });
    logger.info('База данных подключена');
    app.listen(PORT, () => {
      logger.info(`Сервер запущен на http://localhost:${PORT}`);
    });
    startDeadlineScheduler();
  } catch (err) {
    logger.fatal({ err }, 'Ошибка запуска приложения');
    process.exit(1);
  }
}

start();
