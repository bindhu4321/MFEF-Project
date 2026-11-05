# Live frontend deployment

Deploy the frontend with Vercel:

1. Sign in to [Vercel](https://vercel.com/) and choose **Add New → Project**.
2. Import the `bindhu4321/MFEF-project-major-` repository.
3. Set **Root Directory** to `frontend`.
4. Use the Vite defaults: build command `npm run build`, output directory
   `dist`, and install command `npm install`.
5. Deploy. Vercel will provide a public `*.vercel.app` URL.

`frontend/vercel.json` sends app routes to the React entry point so direct links
and refreshes work.

## Backend requirements

Vercel hosts the frontend only. Sign-in and financial data require the Express
backend and MySQL database to be hosted separately. Set `VITE_API_URL` in the
Vercel project to the public HTTPS backend URL ending in `/api`, and configure
the backend CORS allowlist to include the Vercel site URL.

Until a backend is configured, the site can load but API-dependent features
will not work.
