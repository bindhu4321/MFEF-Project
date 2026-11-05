# GitHub Pages deployment

The workflow builds the frontend and publishes it to GitHub Pages when changes
are pushed to `main`.

## Enable GitHub Pages

In the repository, open **Settings → Pages** and set **Build and deployment →
Source** to **GitHub Actions**. Then rerun the latest deployment in the
**Actions** tab if needed.

The workflow can also try to enable Pages when an Actions secret named
`PAGES_DEPLOY_TOKEN` is configured with Pages write permission. Without that
secret, Pages must be enabled in repository settings.

After a successful deployment, open:

<https://bindhu4321.github.io/MFEF-project-major-/>

GitHub Pages hosts static files only. Sign-in and live financial data require
the Express backend and MySQL database to be hosted separately. Set
`VITE_API_URL` to the public HTTPS backend URL ending in `/api`, and configure
backend CORS to allow the Pages site URL.
