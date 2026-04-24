const router = require('express').Router();
const pool = require('../models/db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM environmental_compliance ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM environmental_compliance WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { well_name, site_name, emission_type, emission_level, emission_unit, regulatory_threshold, compliance_status, inspection_date, inspector_name, corrective_action, penalty_amount, next_inspection_date } = req.body;
    const result = await pool.query(
      `INSERT INTO environmental_compliance (well_name, site_name, emission_type, emission_level, emission_unit, regulatory_threshold, compliance_status, inspection_date, inspector_name, corrective_action, penalty_amount, next_inspection_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [well_name, site_name, emission_type, emission_level, emission_unit, regulatory_threshold, compliance_status, inspection_date, inspector_name, corrective_action, penalty_amount, next_inspection_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { well_name, site_name, emission_type, emission_level, emission_unit, regulatory_threshold, compliance_status, inspection_date, inspector_name, corrective_action, penalty_amount, next_inspection_date } = req.body;
    const result = await pool.query(
      `UPDATE environmental_compliance SET well_name=$1, site_name=$2, emission_type=$3, emission_level=$4, emission_unit=$5, regulatory_threshold=$6, compliance_status=$7, inspection_date=$8, inspector_name=$9, corrective_action=$10, penalty_amount=$11, next_inspection_date=$12, updated_at=NOW() WHERE id=$13 RETURNING *`,
      [well_name, site_name, emission_type, emission_level, emission_unit, regulatory_threshold, compliance_status, inspection_date, inspector_name, corrective_action, penalty_amount, next_inspection_date, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM environmental_compliance WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
