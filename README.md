# TasteCraft

TasteCraft is a small full-stack recipe browser built with Express on the backend and a static frontend in `frontend/`.

## Features

- Browse curated recipe cards by cuisine.
- Search recipes by name.
- Open detailed recipe pages with ingredients, steps, and video links.
- Cache repeated MealDB requests on the server for faster repeat loads.

## Project Structure

- `backend/` - Express API and route handlers.
- `frontend/` - Static UI, styles, and browser logic.
- `package.json` - App scripts and dependencies.

## Run Locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the server:

   ```bash
   npm start
   ```

3. Open the app at `http://localhost:3000`.

## API Endpoints

- `GET /api/health` - Health check.
- `GET /api/recipes` - Default recipe feed.
- `GET /api/recipes/areas` - List available cuisines.
- `GET /api/recipes/area/:area` - Browse recipes by cuisine.
- `GET /api/recipes/search?q=term` - Search recipes.
- `GET /api/recipes/:id` - Fetch recipe details.
- `POST /api/contact` - Validate contact form submission.

## Notes

- No API keys or other secrets are checked into this repository.
- `.gitignore` excludes local environment files, editor settings, and `node_modules/`.