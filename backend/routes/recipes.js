// Simple in-memory cache
const { stmt } = require('../database/db');
const localRecipes = require('../data/recipes');
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCacheEntry(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry;
}

function getCached(key) {
  const entry = getCacheEntry(key);
  return entry ? entry.data : null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

function classifyIngredients(items = []) {
  const nonVegKeywords = [
    'chicken', 'beef', 'pork', 'lamb', 'mutton', 'fish', 'prawn',
    'shrimp', 'bacon', 'turkey', 'salmon', 'tuna', 'crab', 'lobster',
    'anchovy', 'sardine', 'meat', 'sausage', 'ham', 'duck', 'veal'
  ];
  const eggKeywords = ['egg', 'eggs'];
  const normalized = items.map(item => String(item).toLowerCase());

  const hasNonVeg = normalized.some(item => nonVegKeywords.some(keyword => item.includes(keyword)));
  const hasEgg = normalized.some(item => eggKeywords.some(keyword => item.includes(keyword)));

  if (hasNonVeg) return 'nonveg';
  if (hasEgg) return 'egg';
  return 'veg';
}

function normalizeLocalRecipe(recipe) {
  return {
    id: String(recipe.id),
    name: recipe.name,
    cuisine: recipe.cuisine.toLowerCase(),
    country: recipe.country || 'International',
    category: recipe.category || '',
    img: recipe.img,
    description: recipe.description || 'A delicious recipe.',
    ingredients: recipe.ingredients || [],
    steps: recipe.steps || [],
    diet: classifyIngredients(recipe.ingredients || []),
    source: 'local'
  };
}

function fetchLocalRecipes() {
  return localRecipes.map(normalizeLocalRecipe);
}

function fetchLocalAreaMeals(area) {
  const normalizedArea = area.toLowerCase();
  return localRecipes
    .filter(recipe => recipe.cuisine.toLowerCase() === normalizedArea)
    .map(normalizeLocalRecipe);
}

function searchLocalRecipes(q) {
  const term = q.trim().toLowerCase();
  return localRecipes
    .filter(recipe => {
      const haystack = [recipe.name, recipe.cuisine, recipe.country, recipe.description || '']
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    })
    .map(normalizeLocalRecipe);
}

const express = require('express');
const router = express.Router();

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Helper: classify veg/egg/nonveg from ingredient list
function classifyMeal(meal) {
  const nonVegKeywords = [
    'chicken', 'beef', 'pork', 'lamb', 'mutton', 'fish', 'prawn',
    'shrimp', 'bacon', 'turkey', 'salmon', 'tuna', 'crab', 'lobster',
    'anchovy', 'sardine', 'meat', 'sausage', 'ham', 'duck', 'veal'
  ];
  const eggKeywords = ['egg', 'eggs'];

  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    if (ing && ing.trim()) ingredients.push(ing.toLowerCase());
  }

  const hasNonVeg = ingredients.some(i => nonVegKeywords.some(k => i.includes(k)));
  const hasEgg = ingredients.some(i => eggKeywords.some(k => i.includes(k)));

  if (hasNonVeg) return 'nonveg';
  if (hasEgg) return 'egg';
  return 'veg';
}

// Helper: format TheMealDB meal into clean response
function formatMeal(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      ingredients.push(`${measure ? measure.trim() + ' ' : ''}${ing.trim()}`);
    }
  }

  return {
    id: meal.idMeal,
    name: meal.strMeal,
    cuisine: meal.strArea ? meal.strArea.toLowerCase() : 'international',
    country: meal.strArea || 'International',
    category: meal.strCategory || '',
    img: meal.strMealThumb,
    description: meal.strInstructions
      ? meal.strInstructions.split('.')[0] + '.'
      : 'A delicious recipe.',
    ingredients,
    steps: meal.strInstructions
      ? meal.strInstructions
          .split(/\r\n|\n|\r/)
          .map(s => s.trim())
          .filter(s => s.length > 5)
      : [],
    diet: classifyMeal(meal),
    source: meal.strSource || null,
    youtube: meal.strYoutube || null
  };
}

async function fetchPopularRecipes() {
  const areas = ['Indian', 'Italian', 'Chinese', 'Mexican', 'Japanese', 'American'];
  const promises = areas.map(area =>
    fetch(`${BASE_URL}/filter.php?a=${area}`)
      .then(r => r.json())
      .then(d => (d.meals || []).slice(0, 4).map(m => ({
        id: m.idMeal,
        name: m.strMeal,
        img: m.strMealThumb,
        cuisine: area.toLowerCase(),
        country: area
      })))
  );

  const results = await Promise.all(promises);
  return [...fetchLocalRecipes(), ...results.flat()];
}

async function fetchAreaMeals(area) {
  const response = await fetch(`${BASE_URL}/filter.php?a=${encodeURIComponent(area)}`);
  const data = await response.json();

  const localMeals = fetchLocalAreaMeals(area);
  if (!data.meals) return localMeals;

  const mealdbMeals = data.meals.slice(0, 20).map(m => ({
    id: m.idMeal,
    name: m.strMeal,
    img: m.strMealThumb,
    cuisine: area.toLowerCase(),
    country: area
  }));

  return [...localMeals, ...mealdbMeals];
}

async function fetchSearchMeals(q) {
  const response = await fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(q)}`);
  const data = await response.json();
  if (!data.meals) return [];
  return data.meals.map(formatMeal);
}

async function fetchAreas() {
  const response = await fetch(`${BASE_URL}/list.php?a=list`);
  const data = await response.json();
  return data.meals.map(m => m.strArea);
}

async function fetchRecipeById(id) {
  const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
  const data = await response.json();
  if (!data.meals) return null;
  return formatMeal(data.meals[0]);
}

// GET /api/recipes/search?q= — merged TheMealDB + user recipes
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Query must be at least 2 characters.' });
  }

  const cacheKey = `search:${q.trim().toLowerCase()}`;
  const cachedEntry = getCacheEntry(cacheKey);

  const pattern = `%${q.trim()}%`;
  const userResults = stmt.searchUserRecipes.all(pattern, pattern, pattern).map(row => ({
    ...row,
    id: `user_${row.id}`,
    ingredients: JSON.parse(row.ingredients),
    steps: JSON.parse(row.steps),
    isUserSubmitted: true
  }));
  const localResults = searchLocalRecipes(q);

  if (cachedEntry && cachedEntry.data.length) {
    const merged = [...userResults, ...localResults, ...cachedEntry.data];
    return res.status(200).json({ success: true, count: merged.length, data: merged });
  }

  try {
    const mealdbResults = await fetchSearchMeals(q);
    setCache(cacheKey, mealdbResults);

    const merged = [...userResults, ...localResults, ...mealdbResults];

    if (!merged.length) {
      return res.status(404).json({ success: false, message: `No recipes found for "${q}"` });
    }

    res.status(200).json({ success: true, count: merged.length, data: merged });
  } catch (err) {
    if (userResults.length) {
      return res.status(200).json({ success: true, count: userResults.length, data: userResults });
    }

    res.status(500).json({ success: false, message: 'Search failed.', error: err.message });
  }
});

// GET /api/recipes/areas — list all available cuisines
router.get('/areas', async (req, res) => {
  const cacheKey = 'areas:list';
  const cachedEntry = getCacheEntry(cacheKey);
  if (cachedEntry) {
    return res.status(200).json({ success: true, count: cachedEntry.data.length, data: cachedEntry.data, cached: true });
  }

  try {
    const areas = await fetchAreas();
    setCache(cacheKey, areas);
    res.status(200).json({ success: true, count: areas.length, data: areas });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch areas', error: err.message });
  }
});

// GET /api/recipes/area/:area — browse by cuisine
router.get('/area/:area', async (req, res) => {
  const { area } = req.params;
  const cacheKey = `area:${area.toLowerCase()}`;
  const cachedEntry = getCacheEntry(cacheKey);
  if (cachedEntry) {
    if (!cachedEntry.data.length) {
      return res.status(404).json({ success: false, message: `No recipes found for area: ${area}` });
    }

    return res.status(200).json({ success: true, count: cachedEntry.data.length, data: cachedEntry.data, cached: true });
  }

  try {
    const meals = await fetchAreaMeals(area);
    setCache(cacheKey, meals);

    if (!meals.length) {
      return res.status(404).json({ success: false, message: `No recipes found for area: ${area}` });
    }

    res.status(200).json({ success: true, count: meals.length, data: meals });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch area recipes', error: err.message });
  }
});

// GET /api/recipes/random — get a random recipe
router.get('/random', async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/random.php`);
    const data = await response.json();
    const meal = formatMeal(data.meals[0]);
    res.status(200).json({ success: true, data: meal });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch random recipe', error: err.message });
  }
});

// GET /api/recipes/:id — full detail by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) {
    return res.status(400).json({ success: false, message: 'Invalid recipe ID.' });
  }

  const localRecipe = localRecipes.find(recipe => String(recipe.id) === String(id));
  if (localRecipe) {
    return res.status(200).json({ success: true, data: normalizeLocalRecipe(localRecipe), source: 'local' });
  }

  // 1. Check in-memory cache first (fastest)
  const cacheKey = `recipe:${id}`;
  const cachedEntry = getCacheEntry(cacheKey);
  if (cachedEntry) {
    if (!cachedEntry.data) {
      return res.status(404).json({ success: false, message: `Recipe ${id} not found.` });
    }
    return res.status(200).json({ success: true, data: cachedEntry.data, source: 'memory' });
  }

  // 2. Check SQLite cache (survives server restarts)
  const dbCached = stmt.getCachedRecipe.get(id);
  if (dbCached) {
    const meal = {
      ...dbCached,
      ingredients: JSON.parse(dbCached.ingredients),
      steps: JSON.parse(dbCached.steps)
    };
    setCache(cacheKey, meal); // promote to memory cache
    return res.status(200).json({ success: true, data: meal, source: 'db' });
  }

  // 3. Fetch from TheMealDB
  try {
    const meal = await fetchRecipeById(id);

    if (!meal) {
      setCache(cacheKey, null);
      return res.status(404).json({ success: false, message: `Recipe ${id} not found.` });
    }

    // Save to both caches
    setCache(cacheKey, meal);
    try {
      stmt.insertRecipe.run({
        ...meal,
        ingredients: JSON.stringify(meal.ingredients),
        steps: JSON.stringify(meal.steps)
      });
    } catch (dbErr) {
      // DB insert failing shouldn't break the response
      console.warn('DB cache insert failed:', dbErr.message);
    }

    res.status(200).json({ success: true, data: meal, source: 'api' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch recipe', error: err.message });
  }
});

// GET /api/recipes — default: load popular Indian + Italian + Chinese + Mexican
router.get('/', async (req, res) => {
  const cacheKey = 'default_recipes';
  const cachedEntry = getCacheEntry(cacheKey);
  if (cachedEntry) {
    return res.status(200).json({ success: true, count: cachedEntry.data.length, data: cachedEntry.data, cached: true });
  }

  try {
    const meals = await fetchPopularRecipes();
    setCache(cacheKey, meals);
    res.status(200).json({ success: true, count: meals.length, data: meals });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch recipes', error: err.message });
  }
});

module.exports = router;
module.exports.warmDefaultCache = async function warmDefaultCache() {
  const meals = await fetchPopularRecipes();
  setCache('default_recipes', meals);
};
