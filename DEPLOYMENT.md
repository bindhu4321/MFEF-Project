# GitHub Pages preview

The GitHub Actions workflow builds the frontend and publishes it to GitHub
Pages whenever changes are pushed to `main`.

## Enable GitHub Pages

The workflow can enable Pages automatically if the repository has a
`PAGES_DEPLOY_TOKEN` Actions secret. Create a fine-grained personal access token
with Pages write permission (or a classic token with the `repo` scope), then
add it under **Settings → Secrets and variables → Actions** as
`PAGES_DEPLOY_TOKEN`. The workflow uses it only to enable Pages.

Alternatively, open **Settings → Pages** and set **Build and deployment →
Source** to **GitHub Actions** yourself. This is required if the secret is not
configured. After Pages is enabled, the workflow publishes the site. Open:

<https://bindhu4321.github.io/MFEF-project-major-/>

It can take a few minutes after the first push for GitHub Pages to become
available.

## Preview limitations

GitHub Pages hosts static files only. It does not run this project's Express
backend or MySQL database, so sign-in and live financial data will not work on
the Pages site. To make those features work, the backend and database must be
hosted separately.

The backend and database source code remain in this repository.
