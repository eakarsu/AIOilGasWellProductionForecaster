const router = require('express').Router();
const pool = require('../models/db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM water_management ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM water_management WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { well_name, field_name, produced_water_bpd, injected_water_bpd, disposal_method, treatment_type, tds_ppm, ph_level, oil_in_water_ppm, disposal_well_name, injection_pressure_psi, water_source, recycled_pct, cost_per_bbl_usd, status } = req.body;
    const result = await pool.query(
      `INSERT INTO water_management (well_name, field_name, produced_water_bpd, injected_water_bpd, disposal_method, treatment_type, tds_ppm, ph_level, oil_in_water_ppm, disposal_well_name, injection_pressure_psi, water_source, recycled_pct, cost_per_bbl_usd, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [well_name, field_name, produced_water_bpd, injected_water_bpd, disposal_method, treatment_type, tds_ppm, ph_level, oil_in_water_ppm, disposal_well_name, injection_pressure_psi, water_source, recycled_pct, cost_per_bbl_usd, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { well_name, field_name, produced_water_bpd, injected_water_bpd, disposal_method, treatment_type, tds_ppm, ph_level, oil_in_water_ppm, disposal_well_name, injection_pressure_psi, water_source, recycled_pct, cost_per_bbl_usd, status } = req.body;
    const result = await pool.query(
      `UPDATE water_management SET well_name=$1, field_name=$2, produced_water_bpd=$3, injected_water_bpd=$4, disposal_method=$5, treatment_type=$6, tds_ppm=$7, ph_level=$8, oil_in_water_ppm=$9, disposal_well_name=$10, injection_pressure_psi=$11, water_source=$12, recycled_pct=$13, cost_per_bbl_usd=$14, status=$15, updated_at=NOW() WHERE id=$16 RETURNING *`,
      [well_name, field_name, produced_water_bpd, injected_water_bpd, disposal_method, treatment_type, tds_ppm, ph_level, oil_in_water_ppm, disposal_well_name, injection_pressure_psi, water_source, recycled_pct, cost_per_bbl_usd, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM water_management WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
