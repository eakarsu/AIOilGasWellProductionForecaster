const router = require('express').Router();
const pool = require('../models/db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM field_notes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM field_notes WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { well_name, note_type, title, content, author, priority } = req.body;
    if (!well_name || !title) {
      return res.status(400).json({ error: 'well_name and title are required' });
    }
    const result = await pool.query(
      `INSERT INTO field_notes (well_name, note_type, title, content, author, priority)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [well_name, note_type || 'General', title, content, author, priority || 'Low']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { well_name, note_type, title, content, author, priority } = req.body;
    const result = await pool.query(
      `UPDATE field_notes SET well_name=COALESCE($1,well_name), note_type=COALESCE($2,note_type),
       title=COALESCE($3,title), content=COALESCE($4,content), author=COALESCE($5,author),
       priority=COALESCE($6,priority), updated_at=NOW() WHERE id=$7 RETURNING *`,
      [well_name, note_type, title, content, author, priority, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM field_notes WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
