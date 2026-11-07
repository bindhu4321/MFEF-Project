# Small Business Financial Management System

A full-stack financial management application for small businesses, built with React + Vite on the frontend and Express + MySQL on the backend.

## Stack

- Frontend: React, Vite, Bootstrap, Axios
- Backend: Node.js, Express, JWT, bcrypt, Helmet, CORS
- Database: MySQL via mysql2

## Project layout

- `backend/` – REST API, auth, middleware, controllers, routes
- `frontend/` – React dashboard and UI
- `database/` – schema and seed scripts

## Quick start

1. Copy backend environment variables:
   - `cp backend/.env.example backend/.env`
2. Update your MySQL credentials and JWT/API key values.
3. Create the database and import the schema:
   - `mysql -u root -p < database/schema.sql`
4. Start the backend:
   - `cd backend && npm install && npm start`
5. Start the frontend:
   - `cd frontend && npm install && npm run dev`

## Key routes

- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/profile`
- Dashboard: `/api/dashboard/summary`, `/api/dashboard/charts`
- Revenue: `/api/revenue`
- Expenses: `/api/expenses`
- Investments: `/api/investments`
- Reports: `/api/reports/financial-summary`, `/api/reports/cash-flow`, `/api/reports/profit-loss`

## Notes

- The API requires JWT authentication for protected routes.
- An optional `x-api-key` header can be enforced with `REQUIRE_API_KEY=true` in the backend environment.
- For deployment, pair the backend with a hosted MySQL database and configure the same environment variables in production.
