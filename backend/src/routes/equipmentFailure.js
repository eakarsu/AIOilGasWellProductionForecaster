const router = require('express').Router();
const pool = require('../models/db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { page, limit = 20 } = req.query;
    const baseQuery = 'SELECT * FROM equipment_failure ORDER BY created_at DESC';
    if (page) {
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;
      const countResult = await pool.query('SELECT COUNT(*)::int as total FROM equipment_failure');
      const total = countResult.rows[0].total;
      const result = await pool.query(baseQuery + ' LIMIT $1 OFFSET $2', [limitNum, offset]);
      return res.json({ data: result.rows, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
    }
    const result = await pool.query(baseQuery);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM equipment_failure WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { equipment_name, equipment_type, well_name, manufacturer, install_date, last_maintenance_date, operating_hours, health_score, failure_probability_pct, vibration_level, temperature_f, status, next_maintenance_date } = req.body;
    const result = await pool.query(
      `INSERT INTO equipment_failure (equipment_name, equipment_type, well_name, manufacturer, install_date, last_maintenance_date, operating_hours, health_score, failure_probability_pct, vibration_level, temperature_f, status, next_maintenance_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [equipment_name, equipment_type, well_name, manufacturer, install_date, last_maintenance_date, operating_hours, health_score, failure_probability_pct, vibration_level, temperature_f, status, next_maintenance_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { equipment_name, equipment_type, well_name, manufacturer, install_date, last_maintenance_date, operating_hours, health_score, failure_probability_pct, vibration_level, temperature_f, status, next_maintenance_date } = req.body;
    const result = await pool.query(
      `UPDATE equipment_failure SET equipment_name=$1, equipment_type=$2, well_name=$3, manufacturer=$4, install_date=$5, last_maintenance_date=$6, operating_hours=$7, health_score=$8, failure_probability_pct=$9, vibration_level=$10, temperature_f=$11, status=$12, next_maintenance_date=$13, updated_at=NOW() WHERE id=$14 RETURNING *`,
      [equipment_name, equipment_type, well_name, manufacturer, install_date, last_maintenance_date, operating_hours, health_score, failure_probability_pct, vibration_level, temperature_f, status, next_maintenance_date, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM equipment_failure WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
