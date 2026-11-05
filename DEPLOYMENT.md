# Full-stack Vercel deployment

The root `vercel.json` deploys the frontend and API as two Vercel services in
one project. Import the repository in Vercel with the repository root (`./`) as
the project root. Vercel routes `/api/*` to the Express backend and other paths
to the Vite frontend.

Vercel does not host this project's MySQL database. Configure the backend
service's environment variables in the Vercel project using the connection
values from your hosted MySQL provider and unique production secrets from
`backend/.env.example`. Do not use the example credentials. Initialize the
database with `database/schema.sql`.

The frontend defaults to the same-origin `/api` path, so no `VITE_API_URL`
setting is needed for this multi-service deployment. Redeploy after setting
backend environment variables. The public `*.vercel.app` URL is available once
the deployment succeeds.
