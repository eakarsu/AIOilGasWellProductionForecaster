const router = require('express').Router();
const pool = require('../models/db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM decline_curves ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM decline_curves WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { well_name, field_name, initial_rate_bpd, current_rate_bpd, decline_rate_pct, decline_type, b_factor, economic_limit_bpd, estimated_reserves_bbl, production_start_date, time_to_abandonment_months } = req.body;
    const result = await pool.query(
      `INSERT INTO decline_curves (well_name, field_name, initial_rate_bpd, current_rate_bpd, decline_rate_pct, decline_type, b_factor, economic_limit_bpd, estimated_reserves_bbl, production_start_date, time_to_abandonment_months)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [well_name, field_name, initial_rate_bpd, current_rate_bpd, decline_rate_pct, decline_type, b_factor, economic_limit_bpd, estimated_reserves_bbl, production_start_date, time_to_abandonment_months]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { well_name, field_name, initial_rate_bpd, current_rate_bpd, decline_rate_pct, decline_type, b_factor, economic_limit_bpd, estimated_reserves_bbl, production_start_date, time_to_abandonment_months } = req.body;
    const result = await pool.query(
      `UPDATE decline_curves SET well_name=$1, field_name=$2, initial_rate_bpd=$3, current_rate_bpd=$4, decline_rate_pct=$5, decline_type=$6, b_factor=$7, economic_limit_bpd=$8, estimated_reserves_bbl=$9, production_start_date=$10, time_to_abandonment_months=$11, updated_at=NOW() WHERE id=$12 RETURNING *`,
      [well_name, field_name, initial_rate_bpd, current_rate_bpd, decline_rate_pct, decline_type, b_factor, economic_limit_bpd, estimated_reserves_bbl, production_start_date, time_to_abandonment_months, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM decline_curves WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
