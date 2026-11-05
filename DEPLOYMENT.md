# Full-stack deployment

## Frontend on Vercel

The Vercel project imports `bindhu4321/MFEF-project-major-` with the root
directory set to `frontend` and the Vite preset. Vercel provides a public
`*.vercel.app` URL after deployment. The Vite configuration uses the root asset
path on Vercel and the repository path for GitHub Pages.

## API on Vercel

Create a second Vercel project from the same GitHub repository and set its
root directory to `backend`. Vercel detects the exported Express app in
`server.js`. The backend still starts normally with `npm start` outside Vercel.

## Database

Vercel does not host this project's MySQL database. Provision a managed MySQL
database with a provider that allows secure connections from Vercel, then set
the `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `DB_PORT` environment
variables on the backend Vercel project. Set the other backend secrets from
`backend/.env.example` too, using unique production values rather than the
examples. Initialize the database with `database/schema.sql`.

After both Vercel projects and the database are deployed:

1. Set the frontend project’s `VITE_API_URL` to the backend project’s public
   HTTPS URL ending in `/api`.
2. Set backend `CORS_ORIGIN` to the frontend Vercel site’s origin.
3. Redeploy both projects after changing environment variables.
