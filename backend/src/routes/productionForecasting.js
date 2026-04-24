const router = require('express').Router();
const pool = require('../models/db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM production_forecasting ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM production_forecasting WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { well_name, field_name, current_rate_bpd, forecast_period_months, predicted_rate_bpd, predicted_cumulative_bbl, confidence_pct, forecast_method, oil_price_usd, estimated_revenue_usd, risk_factor } = req.body;
    const result = await pool.query(
      `INSERT INTO production_forecasting (well_name, field_name, current_rate_bpd, forecast_period_months, predicted_rate_bpd, predicted_cumulative_bbl, confidence_pct, forecast_method, oil_price_usd, estimated_revenue_usd, risk_factor)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [well_name, field_name, current_rate_bpd, forecast_period_months, predicted_rate_bpd, predicted_cumulative_bbl, confidence_pct, forecast_method, oil_price_usd, estimated_revenue_usd, risk_factor]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { well_name, field_name, current_rate_bpd, forecast_period_months, predicted_rate_bpd, predicted_cumulative_bbl, confidence_pct, forecast_method, oil_price_usd, estimated_revenue_usd, risk_factor } = req.body;
    const result = await pool.query(
      `UPDATE production_forecasting SET well_name=$1, field_name=$2, current_rate_bpd=$3, forecast_period_months=$4, predicted_rate_bpd=$5, predicted_cumulative_bbl=$6, confidence_pct=$7, forecast_method=$8, oil_price_usd=$9, estimated_revenue_usd=$10, risk_factor=$11, updated_at=NOW() WHERE id=$12 RETURNING *`,
      [well_name, field_name, current_rate_bpd, forecast_period_months, predicted_rate_bpd, predicted_cumulative_bbl, confidence_pct, forecast_method, oil_price_usd, estimated_revenue_usd, risk_factor, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM production_forecasting WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
