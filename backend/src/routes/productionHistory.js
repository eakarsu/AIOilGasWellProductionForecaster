const router = require('express').Router();
const pool = require('../models/db');
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Ensure table exists
async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS production_history (
      id SERIAL PRIMARY KEY,
      well_id INTEGER,
      user_id INTEGER REFERENCES users(id),
      recorded_at TIMESTAMP,
      oil_bpd DECIMAL,
      gas_mcfd DECIMAL,
      water_bpd DECIMAL,
      bhp DECIMAL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}
ensureTable().catch(console.error);

// GET /api/production-history?well_id=&page=1&limit=20
router.get('/', auth, async (req, res) => {
  try {
    const { well_id, page, limit = 20 } = req.query;
    const userId = req.user.id;
    const params = [userId];
    let where = 'WHERE user_id = $1';
    if (well_id) {
      params.push(well_id);
      where += ` AND well_id = $${params.length}`;
    }

    let query = `SELECT * FROM production_history ${where} ORDER BY recorded_at DESC`;

    if (page) {
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;
      const countResult = await pool.query(`SELECT COUNT(*)::int as total FROM production_history ${where}`, params);
      const total = countResult.rows[0].total;
      params.push(limitNum, offset);
      query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;
      const result = await pool.query(query, params);
      return res.json({ data: result.rows, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/production-history/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM production_history WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/production-history
router.post('/', auth, async (req, res) => {
  try {
    const { well_id, recorded_at, oil_bpd, gas_mcfd, water_bpd, bhp } = req.body;
    const result = await pool.query(
      `INSERT INTO production_history (well_id, user_id, recorded_at, oil_bpd, gas_mcfd, water_bpd, bhp)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [well_id, req.user.id, recorded_at, oil_bpd, gas_mcfd, water_bpd, bhp]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/production-history/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { well_id, recorded_at, oil_bpd, gas_mcfd, water_bpd, bhp } = req.body;
    const result = await pool.query(
      `UPDATE production_history SET well_id=$1, recorded_at=$2, oil_bpd=$3, gas_mcfd=$4, water_bpd=$5, bhp=$6
       WHERE id=$7 AND user_id=$8 RETURNING *`,
      [well_id, recorded_at, oil_bpd, gas_mcfd, water_bpd, bhp, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/production-history/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM production_history WHERE id=$1 AND user_id=$2 RETURNING *', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/production-history/import-csv
router.post('/import-csv', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { well_id } = req.body;
    if (!well_id) return res.status(400).json({ error: 'well_id is required' });

    const text = req.file.buffer.toString('utf8');
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return res.status(400).json({ error: 'CSV must have header row and at least one data row' });

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const dateIdx = headers.findIndex(h => ['date', 'recorded_at'].includes(h));
    const oilIdx = headers.findIndex(h => ['oil_bpd', 'oil'].includes(h));
    const gasIdx = headers.findIndex(h => ['gas_mcfd', 'gas'].includes(h));
    const waterIdx = headers.findIndex(h => ['water_bpd', 'water'].includes(h));
    const bhpIdx = headers.findIndex(h => h === 'bhp');

    const inserted = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim());
      if (cols.length < 2) continue;
      const recorded_at = dateIdx >= 0 ? cols[dateIdx] : null;
      const oil_bpd = oilIdx >= 0 ? parseFloat(cols[oilIdx]) || null : null;
      const gas_mcfd = gasIdx >= 0 ? parseFloat(cols[gasIdx]) || null : null;
      const water_bpd = waterIdx >= 0 ? parseFloat(cols[waterIdx]) || null : null;
      const bhp = bhpIdx >= 0 ? parseFloat(cols[bhpIdx]) || null : null;

      const r = await pool.query(
        `INSERT INTO production_history (well_id, user_id, recorded_at, oil_bpd, gas_mcfd, water_bpd, bhp)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
        [well_id, req.user.id, recorded_at, oil_bpd, gas_mcfd, water_bpd, bhp]
      );
      inserted.push(r.rows[0].id);
    }

    res.json({ message: `Imported ${inserted.length} rows`, inserted_ids: inserted });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
