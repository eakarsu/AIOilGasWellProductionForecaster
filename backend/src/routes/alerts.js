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

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM alerts ORDER BY created_at DESC');
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
        // Skip alerts with invalid field names
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
