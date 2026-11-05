# Deploying to Railway

This project uses separate frontend, backend, and MySQL services. Deploy the
latest code from GitHub, then follow these steps in Railway.

## 1. Create the services

1. Create a Railway project and add a MySQL service.
2. Add two services from the same GitHub repository:
   - **Backend**: leave **Root Directory** at the repository root. Set the
     service's build command to `cd backend && npm install` and start command to
     `cd backend && npm start`.
   - **Frontend**: set **Root Directory** to `/frontend`. Railway will run
     `npm run build` and `npm start`.
3. Generate a public domain for both the backend and frontend from each
   service's **Settings → Networking → Public Networking**.

The backend runs from the repository root so its database seed script and
schema remain available. The frontend preview server binds to Railway's `PORT`.

## 2. Configure backend variables

In the backend service's **Variables**, add:

```text
NODE_ENV=production
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
JWT_SECRET=<generate a long random value>
CORS_ORIGIN=https://<your-frontend-domain>
```

Replace `MySQL` with the exact name of the Railway database service. Replace
`<your-frontend-domain>` with its generated domain, without a trailing slash.
Keep `REQUIRE_API_KEY` unset or set it to `false`; the frontend API key is
publicly visible in the browser and must not be treated as a secret.

## 3. Initialize the database

Connect to the Railway MySQL service using Railway's `railway connect` command
or a MySQL client, and run [`database/schema.sql`](./database/schema.sql).
To show the sample business data and demo accounts, run the seed script once
from the repository root after setting the backend service's database
environment variables locally (or through Railway CLI):

```text
cd backend
npm run seed
```

The seed script clears existing users, revenue, expenses, and investments before
inserting demo data. Only run it on a fresh database.

## 4. Configure the frontend

In the frontend service's **Variables**, set:

```text
VITE_API_URL=https://<your-backend-domain>/api
VITE_API_KEY=sbfms-secure-api-key-2026-v1
```

Replace `<your-backend-domain>` with the backend's generated domain. Because
Vite embeds `VITE_` variables at build time, redeploy the frontend after changing
these values.

## 5. Verify and share

Open `https://<your-backend-domain>/api/health` and confirm it returns
`"status": "healthy"`. Then open the frontend's Railway domain, sign in, and
share that **frontend URL** as the live project link.

Demo sign-ins:

- Business: `sarah@apex.com` / `userPassword123!`
- Admin: `admin@business.com` / `adminPassword123!`
