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

## Страницы

| URL | Описание |
|-----|----------|
| `/` | Главная |
| `/login` | Вход |
| `/register` | Регистрация |
| `/dashboard` | Личный кабинет (только для авторизованных) |

## API

- `POST /api/auth/register` — регистрация
- `POST /api/auth/login` — вход
- `GET /api/auth/me` — текущий пользователь (заголовок `Authorization: Bearer <token>`)
