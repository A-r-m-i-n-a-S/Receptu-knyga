const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/recipes - returns all recipes, optionally filtered by category and/or search term
router.get('/', authMiddleware, (req, res) => {
  const { category, search } = req.query;

  let query = 'SELECT * FROM recipes WHERE 1=1';
  const params = [];

  // Filter by category if provided
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  // Filter by title if search term is provided (case insensitive)
  if (search) {
    query += ' AND LOWER(title) LIKE ?';
    params.push(`%${search.toLowerCase()}%`);
  }

  const recipes = db.prepare(query).all(...params);
  return res.json(recipes);
});

// GET /api/recipes/:id - returns a single recipe by id
router.get('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;

  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id);
  if (!recipe) {
    return res.status(404).json({ error: 'Recipe not found' });
  }

  return res.json(recipe);
});

module.exports = router;
