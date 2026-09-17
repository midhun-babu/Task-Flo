# Task-Flo

> Immersive, role-based task management system — vanilla HTML/CSS/JS frontend + Node.js/Express/MongoDB backend, served from a single port.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Vanilla HTML5, CSS3 (glassmorphism, animations), ES Modules |
| **Backend** | Node.js, Express.js (v5), ES Modules |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT (Access + Refresh tokens), bcrypt |
| **Validation** | Joi schemas |
| **Security** | Helmet, CORS, rate limiting, NoSQL injection protection |
| **API Docs** | Swagger / OpenAPI at `/api-docs` |

---

## Project Structure

```
Task-Flo/
├── .env                        # Environment variables (single source of truth)
├── .env.example                # Template for .env
├── package.json                # Root scripts (npm run dev, seed, reminder)
│
├── backend/
│   ├── package.json
│   ├── seed.js                 # DB seeder (dummy users + tasks)
│   ├── scripts/
│   │   └── reminder.js         # Email reminder script (run manually / cron)
│   └── src/
│       ├── server.js           # Entry point — loads .env, starts Express
│       ├── app.js              # Express app — routes, middleware, static serving
│       ├── config/db.js        # MongoDB connection
│       ├── controllers/        # authController, taskController
│       ├── services/           # Business logic (authService, taskService)
│       ├── dbqueries/          # DB query helpers (userQueries, taskQueries)
│       ├── models/             # Mongoose models (User, Task)
│       ├── routes/             # authRoutes, taskRoutes
│       ├── middlewares/        # auth, role, validation, error, notFound, rateLimit
│       ├── validators/         # Joi schemas (authValidator, taskValidator)
│       ├── utils/              # jwt.js, password.js, response.js
│       └── docs/swagger.js     # Swagger config
│
└── frontend/
    ├── index.html              # App shell (loads CSS + JS)
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    └── src/
        ├── main.js             # Entry point — routing between auth/dashboard
        ├── auth.js             # Login / Register UI
        ├── dashboard.js        # Kanban board UI + task modal
        ├── api.js              # Fetch-based API client
        └── style.css           # All styles (glassmorphism, animations, Kanban)
```

---

## Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB running locally on port 27017

### 1. Clone & install
```bash
git clone <repo-url>
cd Task-Flo
npm install --prefix backend
```

### 2. Configure environment
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Key variables:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/task-flo
JWT_ACCESS_SECRET=<random-strong-secret>
JWT_REFRESH_SECRET=<different-random-secret>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5000
BCRYPT_SALT_ROUNDS=12
```

### 3. Seed the database (optional)
```bash
npm run seed
```
Creates 3 users (all use password `password123`):

| Role | Email |
|---|---|
| Admin | admin@taskflo.com |
| Manager | manager@taskflo.com |
| Employee | employee@taskflo.com |

### 4. Start (one command)
```bash
npm run dev
```
- Everything served at **http://localhost:5000**
- Nodemon watches for backend changes and auto-restarts

---

## How It Works

The Express backend serves the frontend as **static files** from the `frontend/` folder. There is no separate frontend server — everything runs on port 5000:

```
http://localhost:5000/           -> frontend/index.html (UI)
http://localhost:5000/api/v1/    -> REST API
http://localhost:5000/api-docs   -> Swagger UI
http://localhost:5000/health     -> Health check
```

The frontend uses native **ES Modules** (`type="module"`) — no build step, no bundler needed. API calls use relative URLs (`/api/v1/...`) since frontend and backend share the same origin.

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | No | Register a new user |
| `POST` | `/api/v1/auth/login` | No | Login, receive JWT |
| `POST` | `/api/v1/auth/logout` | No | Clear refresh token cookie |
| `GET` | `/api/v1/auth/me` | Yes | Get current user profile |

### Tasks
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/api/v1/tasks` | Yes | Any | List tasks (filtered by role) |
| `POST` | `/api/v1/tasks` | Yes | admin, manager | Create task |
| `GET` | `/api/v1/tasks/:id` | Yes | Any | Get single task |
| `PATCH` | `/api/v1/tasks/:id` | Yes | admin, manager | Update task |
| `DELETE` | `/api/v1/tasks/:id` | Yes | admin, manager | Cancel task |
| `PATCH` | `/api/v1/tasks/:id/status` | Yes | Any | Update task status |

### Query Parameters for `GET /tasks`
| Param | Values | Default |
|---|---|---|
| `status` | `pending`, `in_progress`, `completed`, `cancelled` | — |
| `priority` | `low`, `medium`, `high`, `critical` | — |
| `search` | string | — |
| `page` | number | `1` |
| `limit` | number (max 100) | `20` |
| `sortBy` | `createdAt`, `dueDate`, `priority`, `title` | `createdAt` |
| `order` | `asc`, `desc` | `desc` |

---

## Role Permissions

| Action | admin | manager | employee |
|---|---|---|---|
| Create tasks | Yes | Yes | No |
| Edit / cancel tasks | Yes | Own created only | No |
| View tasks | All | Own created | Assigned to them |
| Update task status | Yes | Yes | Yes (assigned tasks) |

---

## Utility Scripts

```bash
# Seed the database with dummy users and tasks
npm run seed

# Send email reminders for incomplete high-priority tasks
# (set EMAIL_USER and EMAIL_PASS in .env first)
npm run reminder
```

---

## Security Overview

- **JWT**: Short-lived access tokens (15m) + long-lived refresh tokens (7d) in `httpOnly` cookies
- **Passwords**: bcrypt hashed, never returned in responses (`select: false` on schema)
- **Rate limiting**: Strict limits on `/api/v1/auth/*` to prevent brute-force
- **Helmet**: Secure HTTP headers on all responses
- **Joi validation**: All request bodies and query strings validated before reaching controllers
- **Object-level auth**: Employees can only see/act on tasks assigned to them; managers only on tasks they created

---

## API Documentation

Swagger UI is available while the server is running:

```
http://localhost:5000/api-docs
```
