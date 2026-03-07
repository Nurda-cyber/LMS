require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const { User, Course, CourseUser } = require('./models');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

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
    console.log('База данных подключена');
    app.listen(PORT, () => {
      console.log(`Сервер: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Ошибка запуска:', err.message);
    process.exit(1);
  }
}

start();
