const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
    }
    const user = await User.create({ email, password, name, role: 'student' });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
    res.status(201).json({
      message: 'Регистрация успешна',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
    res.json({
      message: 'Вход выполнен',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при входе' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'name', 'role', 'createdAt']
    });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.registerTeacher = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
    }
    const user = await User.create({ email, password, name, role: 'teacher' });
    res.status(201).json({
      message: 'Учитель зарегистрирован',
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при регистрации учителя' });
  }
};

exports.getTeachers = async (req, res) => {
  try {
    const teachers = await User.findAll({
      where: { role: 'teacher' },
      attributes: ['id', 'email', 'name', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json(teachers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'email', 'name', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
