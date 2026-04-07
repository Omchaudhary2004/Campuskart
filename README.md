# CampusKart

Modular monorepo: **`backend/`** (Node.js + Express + PostgreSQL) and **`frontend/`** (React + Vite + Tailwind).

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Backend setup

```bash
cd backend
cp .env.example .env
# Edit DATABASE_URL and JWT_SECRET
npm install
npm run db:init
npm run db:seed
npm run dev
```

API default: `http://localhost:4000`.

## Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App default: `http://localhost:5173` (proxies `/api` and `/uploads` to the backend in dev).

## Demo accounts (after seed)

| Role   | Email                    | Password  |
|--------|--------------------------|-----------|
| Admin  | admin@university.ac.in   | demo1234  |
| Student| student@university.ac.in | demo1234  |
| Client | client@gmail.com         | demo1234  |

## External integrations

See `docs/API_REQUIREMENTS.md` for Paytm, CometChat, Web3Forms, and Discord variables.

Support inbox: **campuskartindia@gmail.com**
