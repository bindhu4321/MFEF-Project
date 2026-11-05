# Full-stack deployment

## Frontend on Vercel

The Vercel project imports `bindhu4321/MFEF-project-major-` with the root
directory set to `frontend` and the Vite preset. Vercel provides a public
`*.vercel.app` URL after deployment. The Vite configuration uses the root asset
path on Vercel and the repository path for GitHub Pages.

## Backend and database

Vercel hosts the frontend; it does not run this Express API or MySQL database.
Deploy the `backend` directory as a Node.js service and provision a hosted
MySQL database. Set the backend environment variables from
`backend/.env.example` in the hosting provider; use generated production
secrets, not the example values.

After the backend is deployed:

1. Set the Vercel project’s `VITE_API_URL` to the backend’s public HTTPS URL
   ending in `/api`.
2. Set backend `CORS_ORIGIN` to the Vercel site’s origin.
3. Redeploy the Vercel frontend so it includes `VITE_API_URL`.
4. Initialize the hosted MySQL database with `database/schema.sql`.
