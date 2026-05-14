const router = require('express').Router();
const pool = require('../models/db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { page, limit = 20 } = req.query;
    const baseQuery = 'SELECT * FROM pipeline_monitoring ORDER BY created_at DESC';
    if (page) {
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;
      const countResult = await pool.query('SELECT COUNT(*)::int as total FROM pipeline_monitoring');
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
    const result = await pool.query('SELECT * FROM pipeline_monitoring WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { pipeline_name, segment_id, origin, destination, length_miles, diameter_in, material, max_pressure_psi, current_pressure_psi, flow_rate_bpd, fluid_type, wall_thickness_in, corrosion_rate_mpy, last_inspection_date, integrity_status } = req.body;
    const result = await pool.query(
      `INSERT INTO pipeline_monitoring (pipeline_name, segment_id, origin, destination, length_miles, diameter_in, material, max_pressure_psi, current_pressure_psi, flow_rate_bpd, fluid_type, wall_thickness_in, corrosion_rate_mpy, last_inspection_date, integrity_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [pipeline_name, segment_id, origin, destination, length_miles, diameter_in, material, max_pressure_psi, current_pressure_psi, flow_rate_bpd, fluid_type, wall_thickness_in, corrosion_rate_mpy, last_inspection_date, integrity_status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { pipeline_name, segment_id, origin, destination, length_miles, diameter_in, material, max_pressure_psi, current_pressure_psi, flow_rate_bpd, fluid_type, wall_thickness_in, corrosion_rate_mpy, last_inspection_date, integrity_status } = req.body;
    const result = await pool.query(
      `UPDATE pipeline_monitoring SET pipeline_name=$1, segment_id=$2, origin=$3, destination=$4, length_miles=$5, diameter_in=$6, material=$7, max_pressure_psi=$8, current_pressure_psi=$9, flow_rate_bpd=$10, fluid_type=$11, wall_thickness_in=$12, corrosion_rate_mpy=$13, last_inspection_date=$14, integrity_status=$15, updated_at=NOW() WHERE id=$16 RETURNING *`,
      [pipeline_name, segment_id, origin, destination, length_miles, diameter_in, material, max_pressure_psi, current_pressure_psi, flow_rate_bpd, fluid_type, wall_thickness_in, corrosion_rate_mpy, last_inspection_date, integrity_status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM pipeline_monitoring WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
