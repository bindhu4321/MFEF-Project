# GitHub Pages preview

The GitHub Actions workflow builds the frontend and publishes it to GitHub
Pages whenever changes are pushed to `main`.

## Enable GitHub Pages

In the repository on GitHub, open **Settings → Pages** and set **Build and
deployment → Source** to **GitHub Actions**. The workflow will then publish the
site. Open:

<https://bindhu4321.github.io/MFEF-project-major-/>

It can take a few minutes after the first push for GitHub Pages to become
available.

## Preview limitations

GitHub Pages hosts static files only. It does not run this project's Express
backend or MySQL database, so sign-in and live financial data will not work on
the Pages site. To make those features work, the backend and database must be
hosted separately.

The backend and database source code remain in this repository.
