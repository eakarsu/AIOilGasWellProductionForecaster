const router = require('express').Router();
const pool = require('../models/db');
const auth = require('../middleware/auth');

// Ensure ai_analyses table exists
pool.query(`
  CREATE TABLE IF NOT EXISTS ai_analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    endpoint VARCHAR(100),
    entity_table VARCHAR(100),
    entity_id INTEGER,
    result TEXT,
    tokens_used INTEGER,
    model VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
  )
`).catch(console.error);

// GET /api/ai-history?page=1&limit=20
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const countResult = await pool.query(
      'SELECT COUNT(*)::int as total FROM ai_analyses WHERE user_id=$1',
      [req.user.id]
    );
    const total = countResult.rows[0].total;

    const result = await pool.query(
      'SELECT id, endpoint, entity_table, entity_id, tokens_used, model, created_at, LEFT(result, 300) as result_preview FROM ai_analyses WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [req.user.id, limitNum, offset]
    );

    res.json({
      data: result.rows,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/ai-history/:id — full result
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ai_analyses WHERE id=$1 AND user_id=$2',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
