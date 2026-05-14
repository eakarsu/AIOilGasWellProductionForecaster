const router = require('express').Router();
const pool = require('../models/db');
const auth = require('../middleware/auth');

const VALID_OPERATORS = ['>', '<', '=', '>=', '<='];
const VALID_SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

const VALID_TABLES = [
  'wellhead_analytics', 'reservoir_simulation', 'decline_curves',
  'equipment_failure', 'environmental_compliance', 'production_forecasting',
  'well_performance', 'drilling_operations', 'cost_analysis',
  'pipeline_monitoring', 'water_management', 'safety_incidents',
  'gas_lift_optimization'
];

// Ensure alert_rules table exists
pool.query(`
  CREATE TABLE IF NOT EXISTS alert_rules (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    metric VARCHAR(100) NOT NULL,
    operator VARCHAR(10) NOT NULL,
    threshold DECIMAL NOT NULL,
    entity_type VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )
`).catch(console.error);

// ─── Alert Rules CRUD ──────────────────────────────────────────────────────────

router.get('/rules', auth, async (req, res) => {
  try {
    const { page, limit = 20 } = req.query;
    let query = 'SELECT * FROM alert_rules WHERE user_id=$1 ORDER BY created_at DESC';
    if (page) {
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;
      const countResult = await pool.query('SELECT COUNT(*)::int as total FROM alert_rules WHERE user_id=$1', [req.user.id]);
      const total = countResult.rows[0].total;
      const result = await pool.query(query + ` LIMIT $2 OFFSET $3`, [req.user.id, limitNum, offset]);
      return res.json({ data: result.rows, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
    }
    const result = await pool.query(query, [req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/rules', auth, async (req, res) => {
  try {
    const { metric, operator, threshold, entity_type } = req.body;
    if (!metric || !operator || threshold === undefined) {
      return res.status(400).json({ error: 'metric, operator, and threshold are required' });
    }
    if (!VALID_OPERATORS.includes(operator)) {
      return res.status(400).json({ error: `Invalid operator. Use: ${VALID_OPERATORS.join(', ')}` });
    }
    const result = await pool.query(
      `INSERT INTO alert_rules (user_id, metric, operator, threshold, entity_type) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.user.id, metric, operator, threshold, entity_type || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/rules/:id', auth, async (req, res) => {
  try {
    const { metric, operator, threshold, entity_type, is_active } = req.body;
    if (operator && !VALID_OPERATORS.includes(operator)) {
      return res.status(400).json({ error: `Invalid operator. Use: ${VALID_OPERATORS.join(', ')}` });
    }
    const result = await pool.query(
      `UPDATE alert_rules SET metric=COALESCE($1,metric), operator=COALESCE($2,operator),
       threshold=COALESCE($3,threshold), entity_type=COALESCE($4,entity_type),
       is_active=COALESCE($5,is_active), updated_at=NOW()
       WHERE id=$6 AND user_id=$7 RETURNING *`,
      [metric, operator, threshold, entity_type, is_active, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/rules/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM alert_rules WHERE id=$1 AND user_id=$2 RETURNING *', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/alerts/evaluate — evaluate all active rules against current data
router.get('/evaluate', auth, async (req, res) => {
  try {
    const rulesResult = await pool.query(
      'SELECT * FROM alert_rules WHERE user_id=$1 AND is_active=true',
      [req.user.id]
    );
    const violations = [];

    for (const rule of rulesResult.rows) {
      // Try to find a matching table/metric combination
      const tableName = rule.entity_type && VALID_TABLES.includes(rule.entity_type) ? rule.entity_type : null;
      if (!tableName) continue;
      const column = rule.metric;
      // Validate column name (alphanumeric + underscore)
      if (!/^[a-z_][a-z0-9_]*$/.test(column)) continue;

      try {
        const dataResult = await pool.query(
          `SELECT * FROM ${tableName} WHERE CAST(${column} AS DECIMAL) ${rule.operator} $1 LIMIT 50`,
          [rule.threshold]
        );
        if (dataResult.rows.length > 0) {
          violations.push({
            rule_id: rule.id,
            metric: rule.metric,
            operator: rule.operator,
            threshold: rule.threshold,
            entity_type: rule.entity_type,
            violation_count: dataResult.rows.length,
            sample_records: dataResult.rows.slice(0, 3)
          });
        }
      } catch (queryErr) {
        // skip rules referencing non-existent columns
      }
    }

    res.json({ evaluated: rulesResult.rows.length, violations });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Original alerts CRUD ──────────────────────────────────────────────────────

router.get('/', auth, async (req, res) => {
  try {
    const { page, limit = 20 } = req.query;
    let query = 'SELECT * FROM alerts ORDER BY created_at DESC';
    if (page) {
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;
      const countResult = await pool.query('SELECT COUNT(*)::int as total FROM alerts');
      const total = countResult.rows[0].total;
      const result = await pool.query(query + ` LIMIT $1 OFFSET $2`, [limitNum, offset]);
      return res.json({ data: result.rows, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/check', auth, async (req, res) => {
  try {
    const alertsResult = await pool.query('SELECT * FROM alerts WHERE is_active = true');
    const triggered = [];

    for (const alert of alertsResult.rows) {
      if (!VALID_TABLES.includes(alert.table_name)) continue;

      const query = `SELECT * FROM ${alert.table_name} WHERE ${alert.field_name} ${alert.operator} $1`;
      try {
        const dataResult = await pool.query(query, [alert.threshold_value]);
        if (dataResult.rows.length > 0) {
          triggered.push({
            alert_id: alert.id,
            alert_name: alert.alert_name,
            severity: alert.severity,
            table_name: alert.table_name,
            field_name: alert.field_name,
            operator: alert.operator,
            threshold_value: alert.threshold_value,
            triggered_count: dataResult.rows.length,
            triggered_records: dataResult.rows
          });
        }
      } catch (queryErr) {
        continue;
      }
    }

    res.json(triggered);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { alert_name, table_name, field_name, operator, threshold_value, severity } = req.body;
    if (!alert_name || !table_name || !field_name || !operator || threshold_value === undefined) {
      return res.status(400).json({ error: 'alert_name, table_name, field_name, operator, and threshold_value are required' });
    }
    if (!VALID_OPERATORS.includes(operator)) {
      return res.status(400).json({ error: 'Invalid operator. Use: >, <, =, >=, <=' });
    }
    if (severity && !VALID_SEVERITIES.includes(severity)) {
      return res.status(400).json({ error: 'Invalid severity. Use: Low, Medium, High, Critical' });
    }
    if (!VALID_TABLES.includes(table_name)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    const result = await pool.query(
      `INSERT INTO alerts (alert_name, table_name, field_name, operator, threshold_value, severity)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [alert_name, table_name, field_name, operator, threshold_value, severity || 'Medium']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { alert_name, table_name, field_name, operator, threshold_value, severity, is_active } = req.body;
    if (operator && !VALID_OPERATORS.includes(operator)) {
      return res.status(400).json({ error: 'Invalid operator. Use: >, <, =, >=, <=' });
    }
    if (severity && !VALID_SEVERITIES.includes(severity)) {
      return res.status(400).json({ error: 'Invalid severity. Use: Low, Medium, High, Critical' });
    }
    if (table_name && !VALID_TABLES.includes(table_name)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    const result = await pool.query(
      `UPDATE alerts SET alert_name=COALESCE($1,alert_name), table_name=COALESCE($2,table_name),
       field_name=COALESCE($3,field_name), operator=COALESCE($4,operator),
       threshold_value=COALESCE($5,threshold_value), severity=COALESCE($6,severity),
       is_active=COALESCE($7,is_active), updated_at=NOW() WHERE id=$8 RETURNING *`,
      [alert_name, table_name, field_name, operator, threshold_value, severity, is_active, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM alerts WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
