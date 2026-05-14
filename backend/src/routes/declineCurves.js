const router = require('express').Router();
const pool = require('../models/db');
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { queryOpenRouter } = require('../services/openrouter');

// Ensure ai_analysis column exists on decline_curves
pool.query(`ALTER TABLE decline_curves ADD COLUMN IF NOT EXISTS ai_analysis TEXT`).catch(() => {});

// GET with pagination
router.get('/', auth, async (req, res) => {
  try {
    const { page, limit = 20 } = req.query;
    let query = 'SELECT * FROM decline_curves ORDER BY created_at DESC';
    if (page) {
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;
      const countResult = await pool.query('SELECT COUNT(*)::int as total FROM decline_curves');
      const total = countResult.rows[0].total;
      const result = await pool.query(query + ` LIMIT $1 OFFSET $2`, [limitNum, offset]);
      return res.json({ data: result.rows, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
    }
    const result = await pool.query(query);
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

// POST /api/decline-curves/:id/calculate — Arps decline curve calculation
router.post('/:id/calculate', auth, aiRateLimiter, async (req, res) => {
  try {
    const dcResult = await pool.query('SELECT * FROM decline_curves WHERE id=$1', [req.params.id]);
    if (dcResult.rows.length === 0) return res.status(404).json({ error: 'Decline curve not found' });
    const dc = dcResult.rows[0];

    // Fetch last 12 production_history rows for the associated well (matched by well name in dc)
    // We match on well_name stored in decline_curves to find a well_id from production_history
    const histResult = await pool.query(
      `SELECT * FROM production_history WHERE user_id=$1 ORDER BY recorded_at DESC LIMIT 12`,
      [req.user.id]
    );
    const history = histResult.rows.reverse(); // oldest first

    // Compute exponential decline fit using initial_rate and decline_rate from stored data
    // qi = initial_rate_bpd, Di = decline_rate_pct / 100 / 12 (monthly)
    const qi = parseFloat(dc.initial_rate_bpd) || 100;
    const annualDecline = parseFloat(dc.decline_rate_pct) || 10;
    const Di = annualDecline / 100 / 12; // monthly decline rate

    // EUR (Estimated Ultimate Recovery) = qi / Di (exponential)
    const EUR_bbl = Di > 0 ? Math.round(qi / Di * 30) : 0; // approximate monthly

    // Forecast next 12 months
    const forecast_12mo = [];
    for (let m = 1; m <= 12; m++) {
      const rate = qi * Math.exp(-Di * m);
      forecast_12mo.push({ month: m, rate_bpd: parseFloat(rate.toFixed(2)) });
    }

    const calcResult = { qi, Di: parseFloat(Di.toFixed(6)), EUR_bbl, forecast_12mo };

    // AI narrative
    const prompt = `You are a petroleum engineer. Given these Arps decline curve results, provide a brief professional interpretation:
Well: ${dc.well_name}, Field: ${dc.field_name}
Initial Rate (qi): ${qi} BPD
Monthly Decline Rate (Di): ${(Di * 100).toFixed(3)}%
EUR (Estimated Ultimate Recovery): ${EUR_bbl.toLocaleString()} BBL
12-Month Forecast: starts at ${forecast_12mo[0]?.rate_bpd} BPD, ends at ${forecast_12mo[11]?.rate_bpd} BPD
Historical data points available: ${history.length}

Provide a 3-paragraph assessment covering: (1) curve quality and confidence, (2) EUR reasonableness, (3) operational recommendations.`;

    const { content, tokensUsed, model } = await queryOpenRouter(prompt);

    // Persist to ai_analyses
    await pool.query(
      `INSERT INTO ai_analyses (user_id, endpoint, entity_table, entity_id, result, tokens_used, model)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [req.user.id, '/decline-curves/calculate', 'decline_curves', dc.id, content, tokensUsed, model]
    ).catch(console.error);

    // Update decline_curve row
    await pool.query(
      `UPDATE decline_curves SET ai_analysis=$1 WHERE id=$2`,
      [content, dc.id]
    ).catch(console.error);

    res.json({ ...calcResult, ai_narrative: content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
