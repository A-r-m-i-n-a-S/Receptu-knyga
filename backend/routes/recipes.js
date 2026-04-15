const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/recipes - returns all recipes, optionally filtered by category and/or search term
// Each recipe includes is_favourite = 1/0 based on the logged-in user's favourites
router.get('/', authMiddleware, (req, res) => {
  const { category, search } = req.query;
  const userId = req.user.userId;

  let query = `
    SELECT r.*,
      CASE WHEN f.recipe_id IS NOT NULL THEN 1 ELSE 0 END AS is_favourite
    FROM recipes r
    LEFT JOIN favourites f ON f.recipe_id = r.id AND f.user_id = ?
    WHERE 1=1
  `;
  const params = [userId];

  // Filter by category if provided
  if (category) {
    query += ' AND r.category = ?';
    params.push(category);
  }

  // Filter by title if search term is provided (case insensitive)
  if (search) {
    query += ' AND LOWER(r.title) LIKE ?';
    params.push(`%${search.toLowerCase()}%`);
  }

  const recipes = db.prepare(query).all(...params);
  return res.json(recipes);
});

// GET /api/recipes/:id - returns a single recipe by id
// Includes is_favourite scoped to the logged-in user
router.get('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const recipe = db.prepare(`
    SELECT r.*,
      CASE WHEN f.recipe_id IS NOT NULL THEN 1 ELSE 0 END AS is_favourite
    FROM recipes r
    LEFT JOIN favourites f ON f.recipe_id = r.id AND f.user_id = ?
    WHERE r.id = ?
  `).get(userId, id);

  if (!recipe) {
    return res.status(404).json({ error: 'Recipe not found' });
  }

  return res.json(recipe);
});

module.exports = router;
