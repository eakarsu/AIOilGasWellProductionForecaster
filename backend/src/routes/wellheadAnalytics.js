const router = require('express').Router();
const pool = require('../models/db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM wellhead_analytics ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM wellhead_analytics WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { well_name, location, latitude, longitude, well_type, status, pressure_psi, temperature_f, flow_rate_bpd, gas_oil_ratio, water_cut_pct, choke_size } = req.body;
    const result = await pool.query(
      `INSERT INTO wellhead_analytics (well_name, location, latitude, longitude, well_type, status, pressure_psi, temperature_f, flow_rate_bpd, gas_oil_ratio, water_cut_pct, choke_size)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [well_name, location, latitude, longitude, well_type, status, pressure_psi, temperature_f, flow_rate_bpd, gas_oil_ratio, water_cut_pct, choke_size]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { well_name, location, latitude, longitude, well_type, status, pressure_psi, temperature_f, flow_rate_bpd, gas_oil_ratio, water_cut_pct, choke_size } = req.body;
    const result = await pool.query(
      `UPDATE wellhead_analytics SET well_name=$1, location=$2, latitude=$3, longitude=$4, well_type=$5, status=$6, pressure_psi=$7, temperature_f=$8, flow_rate_bpd=$9, gas_oil_ratio=$10, water_cut_pct=$11, choke_size=$12, updated_at=NOW() WHERE id=$13 RETURNING *`,
      [well_name, location, latitude, longitude, well_type, status, pressure_psi, temperature_f, flow_rate_bpd, gas_oil_ratio, water_cut_pct, choke_size, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM wellhead_analytics WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
