const router = require('express').Router();
const pool = require('../models/db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { page, limit = 20 } = req.query;
    const baseQuery = 'SELECT * FROM reservoir_simulation ORDER BY created_at DESC';
    if (page) {
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;
      const countResult = await pool.query('SELECT COUNT(*)::int as total FROM reservoir_simulation');
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
    const result = await pool.query('SELECT * FROM reservoir_simulation WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { reservoir_name, field_name, depth_ft, porosity_pct, permeability_md, fluid_type, reservoir_pressure_psi, temperature_f, oil_saturation_pct, gas_saturation_pct, water_saturation_pct, recovery_factor_pct, simulation_model } = req.body;
    const result = await pool.query(
      `INSERT INTO reservoir_simulation (reservoir_name, field_name, depth_ft, porosity_pct, permeability_md, fluid_type, reservoir_pressure_psi, temperature_f, oil_saturation_pct, gas_saturation_pct, water_saturation_pct, recovery_factor_pct, simulation_model)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [reservoir_name, field_name, depth_ft, porosity_pct, permeability_md, fluid_type, reservoir_pressure_psi, temperature_f, oil_saturation_pct, gas_saturation_pct, water_saturation_pct, recovery_factor_pct, simulation_model]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { reservoir_name, field_name, depth_ft, porosity_pct, permeability_md, fluid_type, reservoir_pressure_psi, temperature_f, oil_saturation_pct, gas_saturation_pct, water_saturation_pct, recovery_factor_pct, simulation_model } = req.body;
    const result = await pool.query(
      `UPDATE reservoir_simulation SET reservoir_name=$1, field_name=$2, depth_ft=$3, porosity_pct=$4, permeability_md=$5, fluid_type=$6, reservoir_pressure_psi=$7, temperature_f=$8, oil_saturation_pct=$9, gas_saturation_pct=$10, water_saturation_pct=$11, recovery_factor_pct=$12, simulation_model=$13, updated_at=NOW() WHERE id=$14 RETURNING *`,
      [reservoir_name, field_name, depth_ft, porosity_pct, permeability_md, fluid_type, reservoir_pressure_psi, temperature_f, oil_saturation_pct, gas_saturation_pct, water_saturation_pct, recovery_factor_pct, simulation_model, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM reservoir_simulation WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
