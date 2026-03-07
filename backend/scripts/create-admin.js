/**
 * Создаёт первого администратора.
 * Запуск: node scripts/create-admin.js
 * Или: set ADMIN_EMAIL=admin@lms.local && set ADMIN_PASSWORD=secret && node scripts/create-admin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const readline = require('readline');
const { User } = require('../models');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

async function main() {
  await require('../config/database').authenticate();
  const email = process.env.ADMIN_EMAIL || (await ask('Email администратора: '));
  const password = process.env.ADMIN_PASSWORD || (await ask('Пароль: '));
  if (!email || !password) {
    console.error('Укажите email и пароль.');
    process.exit(1);
  }
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    const updated = await existing.update({ role: 'admin' });
    console.log('Роль пользователя обновлена на admin:', updated.email);
  } else {
    const admin = await User.create({ email, password, name: 'Администратор', role: 'admin' });
    console.log('Администратор создан:', admin.email);
  }
  rl.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  rl.close();
  process.exit(1);
});
