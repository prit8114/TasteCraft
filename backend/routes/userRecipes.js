const express = require('express');
const router = express.Router();
const { stmt } = require('../database/db');

function parseUserRecipe(row) {
  return {
    ...row,
    id: `user_${row.id}`,
    ingredients: JSON.parse(row.ingredients),
    steps: JSON.parse(row.steps),
    isUserSubmitted: true
  };
}

function validateRecipe(body) {
  const { name, cuisine, country, description, ingredients, steps, diet } = body;
  const errors = [];

  if (!name || name.trim().length < 2)
    errors.push('Name must be at least 2 characters.');
  if (!cuisine || cuisine.trim().length < 2)
    errors.push('Cuisine is required.');
  if (!country || country.trim().length < 2)
    errors.push('Country is required.');
  if (!description || description.trim().length < 10)
    errors.push('Description must be at least 10 characters.');
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length < 2)
    errors.push('At least 2 ingredients are required.');
  if (!steps || !Array.isArray(steps) || steps.length < 1)
    errors.push('At least 1 step is required.');
  if (!['veg', 'egg', 'nonveg'].includes(diet))
    errors.push('Diet must be veg, egg, or nonveg.');

  return errors;
}

// GET /api/user-recipes
router.get('/', (req, res) => {
  const rows = stmt.getAllUserRecipes.all();
  res.status(200).json({
    success: true,
    count: rows.length,
    data: rows.map(parseUserRecipe)
  });
});

// GET /api/user-recipes/:id
router.get('/:id', (req, res) => {
  const row = stmt.getUserRecipeById.get(req.params.id);
  if (!row) return res.status(404).json({ success: false, message: 'Recipe not found.' });
  res.status(200).json({ success: true, data: parseUserRecipe(row) });
});

// POST /api/user-recipes
router.post('/', (req, res) => {
  const errors = validateRecipe(req.body);
  if (errors.length) return res.status(400).json({ success: false, errors });

  const { name, cuisine, country, img, description, ingredients, steps, diet } = req.body;

  try {
    const result = stmt.insertUserRecipe.run({
      name: name.trim(),
      cuisine: cuisine.trim().toLowerCase(),
      country: country.trim(),
      img: img || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
      description: description.trim(),
      ingredients: JSON.stringify(ingredients.map(i => i.trim()).filter(Boolean)),
      steps: JSON.stringify(steps.map(s => s.trim()).filter(Boolean)),
      diet
    });
    res.status(201).json({
      success: true,
      message: `"${name}" added successfully.`,
      id: `user_${result.lastInsertRowid}`
    });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ success: false, message: 'A recipe with this name already exists.' });
    }
    res.status(500).json({ success: false, message: 'Failed to save recipe.', error: err.message });
  }
});

// PUT /api/user-recipes/:id
router.put('/:id', (req, res) => {
  const existing = stmt.getUserRecipeById.get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: 'Recipe not found.' });

  const errors = validateRecipe(req.body);
  if (errors.length) return res.status(400).json({ success: false, errors });

  const { name, cuisine, country, img, description, ingredients, steps, diet } = req.body;

  stmt.updateUserRecipe.run({
    id: req.params.id,
    name: name.trim(),
    cuisine: cuisine.trim().toLowerCase(),
    country: country.trim(),
    img: img || existing.img,
    description: description.trim(),
    ingredients: JSON.stringify(ingredients.map(i => i.trim()).filter(Boolean)),
    steps: JSON.stringify(steps.map(s => s.trim()).filter(Boolean)),
    diet
  });

  res.status(200).json({ success: true, message: `"${name}" updated successfully.` });
});

// DELETE /api/user-recipes/:id
router.delete('/:id', (req, res) => {
  const existing = stmt.getUserRecipeById.get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: 'Recipe not found.' });

  stmt.deleteUserRecipe.run(req.params.id);
  res.status(200).json({ success: true, message: `"${existing.name}" deleted.` });
});

module.exports = router;