const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Valid category values
const VALID_CATEGORIES = ['breakfast', 'lunch', 'dinner', 'dessert', 'other'];

// Helper: validate recipe fields. Returns an error string or null if valid.
function validateRecipe(title, category, ingredients, steps) {
  if (!title || title.trim().length < 3) {
    return 'Title is required and must be at least 3 characters';
  }
  if (!category || !VALID_CATEGORIES.includes(category)) {
    return 'Category must be one of: breakfast, lunch, dinner, dessert, other';
  }
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return 'Ingredients must be a non-empty array';
  }
  if (!steps || steps.trim().length < 10) {
    return 'Steps are required and must be at least 10 characters';
  }
  return null;
}

// POST /api/recipes - create a new recipe
router.post('/', authMiddleware, (req, res) => {
  const { title, category, ingredients, steps } = req.body;

  // Validate all fields
  const error = validateRecipe(title, category, ingredients, steps);
  if (error) {
    return res.status(400).json({ error });
  }

  // Save to database, store ingredients as JSON string
  const result = db
    .prepare(
      'INSERT INTO recipes (title, category, ingredients, steps, user_id) VALUES (?, ?, ?, ?, ?)'
    )
    .run(title.trim(), category, JSON.stringify(ingredients), steps.trim(), req.user.userId);

  return res.status(201).json({ message: 'Recipe created', id: result.lastInsertRowid });
});

// PUT /api/recipes/:id - update an existing recipe
router.put('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { title, category, ingredients, steps } = req.body;

  // Validate all fields
  const error = validateRecipe(title, category, ingredients, steps);
  if (error) {
    return res.status(400).json({ error });
  }

  // Check the recipe exists and belongs to the logged-in user
  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id);
  if (!recipe || recipe.user_id !== req.user.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Update the recipe in the database
  db.prepare(
    'UPDATE recipes SET title = ?, category = ?, ingredients = ?, steps = ? WHERE id = ?'
  ).run(title.trim(), category, JSON.stringify(ingredients), steps.trim(), id);

  return res.status(200).json({ message: 'Recipe updated' });
});

// DELETE /api/recipes/:id - delete a recipe
router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;

  // Check the recipe exists and belongs to the logged-in user
  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id);
  if (!recipe || recipe.user_id !== req.user.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Delete the recipe from the database
  db.prepare('DELETE FROM recipes WHERE id = ?').run(id);

  return res.status(200).json({ message: 'Recipe deleted' });
});

// PATCH /api/recipes/:id/favourite - toggle the favourite status for the logged-in user
router.patch('/:id/favourite', authMiddleware, (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  // Check the recipe exists (any user can favourite any recipe)
  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id);
  if (!recipe) {
    return res.status(404).json({ error: 'Recipe not found' });
  }

  // Check if this user has already favourited this recipe
  const existing = db
    .prepare('SELECT * FROM favourites WHERE user_id = ? AND recipe_id = ?')
    .get(userId, id);

  let newValue;
  if (existing) {
    // Already favourited — remove it
    db.prepare('DELETE FROM favourites WHERE user_id = ? AND recipe_id = ?').run(userId, id);
    newValue = 0;
  } else {
    // Not favourited yet — add it
    db.prepare('INSERT INTO favourites (user_id, recipe_id) VALUES (?, ?)').run(userId, id);
    newValue = 1;
  }

  return res.status(200).json({ message: 'Updated', is_favourite: newValue });
});

module.exports = router;

// To register these routes, add this line to server.js:
// const recipeActionsRouter = require('./routes/recipeActions');
// app.use('/api/recipes', recipeActionsRouter);
