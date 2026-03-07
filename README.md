# LMS — React + Node.js + PostgreSQL

Структура проекта:

```
LMS/
├── backend/     # Node.js, Express, Sequelize, PostgreSQL
├── frontend/    # React (Vite), React Router
└── README.md
```

## Установка

### 1. База данных

PostgreSQL должен быть запущен. Создайте БД:

```sql
CREATE DATABASE authapp;
```

### 2. Backend

```bash
cd backend
npm install
```

Настройте переменные в `backend/.env` (PORT, DB_*, JWT_SECRET, FRONTEND_URL).

### 3. Frontend

```bash
cd frontend
npm install
```

## Запуск

**Терминал 1 — backend:**

```bash
cd backend
npm start
```

Сервер: `http://localhost:5000`

**Терминал 2 — frontend:**

```bash
cd frontend
npm run dev
```

Сайт: `http://localhost:5173`

Запросы с фронта на `/api` проксируются на backend (порт 5000).

## Роли

- **Студент** — регистрируется сам на странице «Регистрация студента», затем входит и пользуется системой (курсы).
- **Учитель** — не может регистрироваться сам; учётную запись создаёт администратор. Учитель только входит по логину/паролю.
- **Администратор** — входит в систему; создаёт курсы и назначает на каждый курс учителей и студентов (учителей предварительно регистрирует, студенты регистрируются сами).

### Создание первого администратора

После первого запуска backend создайте админа скриптом (из папки `backend`):

```bash
cd backend
node scripts/create-admin.js
```

Введите email и пароль. Можно задать через переменные:

```bash
set ADMIN_EMAIL=admin@lms.local
set ADMIN_PASSWORD=your_password
node scripts/create-admin.js
```

Если пользователь с таким email уже есть, ему будет назначена роль `admin`.

## Страницы

| URL | Описание |
|-----|----------|
| `/` | Главная |
| `/login` | Вход (все роли) |
| `/register` | Регистрация только для студентов |
| `/dashboard` | Личный кабинет (админ / учитель / студент в зависимости от роли) |

## API

- `POST /api/auth/register` — регистрация студента (всегда роль student)
- `POST /api/auth/login` — вход (админ, учитель, студент)
- `GET /api/auth/me` — текущий пользователь (заголовок `Authorization: Bearer <token>`)
- `POST /api/auth/register-teacher` — регистрация учителя (только для admin)
- `GET /api/auth/teachers` — список учителей (только для admin)
- `GET /api/auth/students` — список студентов (только для admin)
- `POST /api/courses` — создать курс (только для admin)
- `GET /api/courses` — список курсов (только для admin)
- `GET /api/courses/:id` — курс с участниками (только для admin)
- `POST /api/courses/:id/members` — добавить учителя или студента на курс (body: `{ userId, role: 'teacher' | 'student' }`, только для admin)
- `DELETE /api/courses/:id/members/:userId` — убрать с курса (только для admin)
