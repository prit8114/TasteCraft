const express = require('express');
const cors = require('cors');
const path = require('path');

require('./database/db');
require('./database/seed');

const recipeRoutes     = require('./routes/recipes');
const contactRoutes    = require('./routes/contact');
const favoriteRoutes   = require('./routes/favorites');
const userRecipeRoutes = require('./routes/userRecipes');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/recipes',      recipeRoutes);
app.use('/api/contact',      contactRoutes);
app.use('/api/favorites',    favoriteRoutes);
app.use('/api/user-recipes', userRecipeRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'TasteCraft API running.' });
});

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`TasteCraft running at http://localhost:${PORT}`);
});