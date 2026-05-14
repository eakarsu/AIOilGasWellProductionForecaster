const router = require('express').Router();
const pool = require('../models/db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { page, limit = 20 } = req.query;
    const baseQuery = 'SELECT * FROM drilling_operations ORDER BY created_at DESC';
    if (page) {
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;
      const countResult = await pool.query('SELECT COUNT(*)::int as total FROM drilling_operations');
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
    const result = await pool.query('SELECT * FROM drilling_operations WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { well_name, rig_name, operator, field_name, spud_date, current_depth_ft, target_depth_ft, rop_ft_hr, wob_klb, torque_ft_lb, rpm, mud_weight_ppg, mud_type, bit_type, bit_size_in, status } = req.body;
    const result = await pool.query(
      `INSERT INTO drilling_operations (well_name, rig_name, operator, field_name, spud_date, current_depth_ft, target_depth_ft, rop_ft_hr, wob_klb, torque_ft_lb, rpm, mud_weight_ppg, mud_type, bit_type, bit_size_in, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [well_name, rig_name, operator, field_name, spud_date, current_depth_ft, target_depth_ft, rop_ft_hr, wob_klb, torque_ft_lb, rpm, mud_weight_ppg, mud_type, bit_type, bit_size_in, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { well_name, rig_name, operator, field_name, spud_date, current_depth_ft, target_depth_ft, rop_ft_hr, wob_klb, torque_ft_lb, rpm, mud_weight_ppg, mud_type, bit_type, bit_size_in, status } = req.body;
    const result = await pool.query(
      `UPDATE drilling_operations SET well_name=$1, rig_name=$2, operator=$3, field_name=$4, spud_date=$5, current_depth_ft=$6, target_depth_ft=$7, rop_ft_hr=$8, wob_klb=$9, torque_ft_lb=$10, rpm=$11, mud_weight_ppg=$12, mud_type=$13, bit_type=$14, bit_size_in=$15, status=$16, updated_at=NOW() WHERE id=$17 RETURNING *`,
      [well_name, rig_name, operator, field_name, spud_date, current_depth_ft, target_depth_ft, rop_ft_hr, wob_klb, torque_ft_lb, rpm, mud_weight_ppg, mud_type, bit_type, bit_size_in, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM drilling_operations WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
