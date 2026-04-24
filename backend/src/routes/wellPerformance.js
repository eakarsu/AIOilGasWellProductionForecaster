const router = require('express').Router();
const pool = require('../models/db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM well_performance ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM well_performance WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { well_name, field_name, oil_rate_bpd, gas_rate_mcfd, water_rate_bpd, water_cut_pct, gas_oil_ratio, bottom_hole_pressure_psi, tubing_pressure_psi, casing_pressure_psi, uptime_pct, efficiency_pct } = req.body;
    const result = await pool.query(
      `INSERT INTO well_performance (well_name, field_name, oil_rate_bpd, gas_rate_mcfd, water_rate_bpd, water_cut_pct, gas_oil_ratio, bottom_hole_pressure_psi, tubing_pressure_psi, casing_pressure_psi, uptime_pct, efficiency_pct)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [well_name, field_name, oil_rate_bpd, gas_rate_mcfd, water_rate_bpd, water_cut_pct, gas_oil_ratio, bottom_hole_pressure_psi, tubing_pressure_psi, casing_pressure_psi, uptime_pct, efficiency_pct]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { well_name, field_name, oil_rate_bpd, gas_rate_mcfd, water_rate_bpd, water_cut_pct, gas_oil_ratio, bottom_hole_pressure_psi, tubing_pressure_psi, casing_pressure_psi, uptime_pct, efficiency_pct } = req.body;
    const result = await pool.query(
      `UPDATE well_performance SET well_name=$1, field_name=$2, oil_rate_bpd=$3, gas_rate_mcfd=$4, water_rate_bpd=$5, water_cut_pct=$6, gas_oil_ratio=$7, bottom_hole_pressure_psi=$8, tubing_pressure_psi=$9, casing_pressure_psi=$10, uptime_pct=$11, efficiency_pct=$12, updated_at=NOW() WHERE id=$13 RETURNING *`,
      [well_name, field_name, oil_rate_bpd, gas_rate_mcfd, water_rate_bpd, water_cut_pct, gas_oil_ratio, bottom_hole_pressure_psi, tubing_pressure_psi, casing_pressure_psi, uptime_pct, efficiency_pct, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM well_performance WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
