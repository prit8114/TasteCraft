const express = require('express');
const router = express.Router();
const { stmt } = require('../database/db');

// GET /api/favorites — list all saved recipes
router.get('/', (req, res) => {
  const favorites = stmt.getAllFavorites.all();
  res.status(200).json({ success: true, count: favorites.length, data: favorites });
});

// POST /api/favorites — save a recipe
router.post('/', (req, res) => {
  const { recipe_id, name, img, cuisine, country, diet } = req.body;

  if (!recipe_id || !name || !img) {
    return res.status(400).json({ success: false, message: 'recipe_id, name, and img are required.' });
  }

  const already = stmt.isFavorite.get(recipe_id);
  if (already) {
    return res.status(409).json({ success: false, message: 'Recipe already in favorites.' });
  }

  stmt.addFavorite.run({ recipe_id, name, img, cuisine, country, diet });
  res.status(201).json({ success: true, message: `${name} added to favorites.` });
});

// DELETE /api/favorites/:recipe_id — remove a recipe
router.delete('/:recipe_id', (req, res) => {
  const { recipe_id } = req.params;
  const exists = stmt.isFavorite.get(recipe_id);

  if (!exists) {
    return res.status(404).json({ success: false, message: 'Recipe not in favorites.' });
  }

  stmt.removeFavorite.run(recipe_id);
  res.status(200).json({ success: true, message: 'Removed from favorites.' });
});

module.exports = router;