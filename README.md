# TasteCraft

TasteCraft is a full-stack recipe discovery and community recipe app built with Express on the backend and a static frontend in `frontend/`.

It lets users browse curated recipes, search by name, open detailed recipe pages, save favorites, submit their own recipes, and manage community recipes through create, read, update, and delete flows.

## Features

- Browse curated recipe cards by cuisine and see community recipes mixed into the feed.
- Search recipes by name across MealDB and user-submitted recipes.
- Open detailed recipe pages with ingredients, steps, and video links.
- Save and remove favorites from the UI.
- Submit, edit, and delete community recipes.
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
- `GET /api/user-recipes` - List community recipes.
- `GET /api/user-recipes/:id` - Fetch a community recipe.
- `POST /api/user-recipes` - Create a community recipe.
- `PUT /api/user-recipes/:id` - Update a community recipe.
- `DELETE /api/user-recipes/:id` - Delete a community recipe.
- `POST /api/contact` - Validate contact form submission.
- `GET /api/contact` - Retrieve contact messages.
- `GET /api/favorites` - List favorites.
- `POST /api/favorites` - Save a favorite recipe.
- `DELETE /api/favorites/:recipe_id` - Remove a favorite recipe.

## Notes

- No API keys or other secrets are checked into this repository.
- `.gitignore` excludes local environment files, editor settings, and `node_modules/`.