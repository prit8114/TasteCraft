const express = require('express');
const cors = require('cors');
const path = require('path');

const recipeRoutes = require('./routes/recipes');
const contactRoutes = require('./routes/contact');

const app = express();
const PORT = 3000;

//Middleware
app.use(cors());
app.use(express.json());

// Serve frontend files statically
app.use(express.static(path.join(__dirname, '../frontend')));

//API routes
app.use('/api/recipes', recipeRoutes);
app.use('/api/contact', contactRoutes);

//Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'TasteCraft API is running.' });
});

//CATCH-ALL: serve frontend for any non-API route
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`TasteCraft server running at http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/recipes`);

  if (typeof recipeRoutes.warmDefaultCache === 'function') {
    recipeRoutes.warmDefaultCache().catch(() => {
      console.log('Default recipe cache warm failed; it will populate on the first request.');
    });
  }
});