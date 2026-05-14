const router = require('express').Router();
const pool = require('../models/db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { page, limit = 20 } = req.query;
    const baseQuery = 'SELECT * FROM gas_lift_optimization ORDER BY created_at DESC';
    if (page) {
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;
      const countResult = await pool.query('SELECT COUNT(*)::int as total FROM gas_lift_optimization');
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
    const result = await pool.query('SELECT * FROM gas_lift_optimization WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { well_name, field_name, injection_rate_mcfd, injection_pressure_psi, oil_rate_before_bpd, oil_rate_after_bpd, gas_source, valve_count, deepest_valve_depth_ft, casing_pressure_psi, tubing_pressure_psi, glr_scf_bbl, optimization_status, cost_per_mcf_usd, incremental_revenue_usd } = req.body;
    const result = await pool.query(
      `INSERT INTO gas_lift_optimization (well_name, field_name, injection_rate_mcfd, injection_pressure_psi, oil_rate_before_bpd, oil_rate_after_bpd, gas_source, valve_count, deepest_valve_depth_ft, casing_pressure_psi, tubing_pressure_psi, glr_scf_bbl, optimization_status, cost_per_mcf_usd, incremental_revenue_usd)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [well_name, field_name, injection_rate_mcfd, injection_pressure_psi, oil_rate_before_bpd, oil_rate_after_bpd, gas_source, valve_count, deepest_valve_depth_ft, casing_pressure_psi, tubing_pressure_psi, glr_scf_bbl, optimization_status, cost_per_mcf_usd, incremental_revenue_usd]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { well_name, field_name, injection_rate_mcfd, injection_pressure_psi, oil_rate_before_bpd, oil_rate_after_bpd, gas_source, valve_count, deepest_valve_depth_ft, casing_pressure_psi, tubing_pressure_psi, glr_scf_bbl, optimization_status, cost_per_mcf_usd, incremental_revenue_usd } = req.body;
    const result = await pool.query(
      `UPDATE gas_lift_optimization SET well_name=$1, field_name=$2, injection_rate_mcfd=$3, injection_pressure_psi=$4, oil_rate_before_bpd=$5, oil_rate_after_bpd=$6, gas_source=$7, valve_count=$8, deepest_valve_depth_ft=$9, casing_pressure_psi=$10, tubing_pressure_psi=$11, glr_scf_bbl=$12, optimization_status=$13, cost_per_mcf_usd=$14, incremental_revenue_usd=$15, updated_at=NOW() WHERE id=$16 RETURNING *`,
      [well_name, field_name, injection_rate_mcfd, injection_pressure_psi, oil_rate_before_bpd, oil_rate_after_bpd, gas_source, valve_count, deepest_valve_depth_ft, casing_pressure_psi, tubing_pressure_psi, glr_scf_bbl, optimization_status, cost_per_mcf_usd, incremental_revenue_usd, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM gas_lift_optimization WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
