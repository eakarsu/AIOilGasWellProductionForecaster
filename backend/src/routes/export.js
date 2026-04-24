const router = require('express').Router();
const pool = require('../models/db');
const auth = require('../middleware/auth');

const VALID_TABLES = [
  'wellhead_analytics',
  'reservoir_simulation',
  'decline_curves',
  'equipment_failure',
  'environmental_compliance',
  'production_forecasting',
  'well_performance',
  'drilling_operations',
  'cost_analysis',
  'pipeline_monitoring',
  'water_management',
  'safety_incidents',
  'gas_lift_optimization',
  'alerts',
  'field_notes'
];

router.get('/:tableName', auth, async (req, res) => {
  try {
    const { tableName } = req.params;
    if (!VALID_TABLES.includes(tableName)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    const result = await pool.query(`SELECT * FROM ${tableName} ORDER BY id`);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No data found' });
    }

    const columns = Object.keys(result.rows[0]);
    const csvHeader = columns.join(',');
    const csvRows = result.rows.map(row =>
      columns.map(col => {
        const val = row[col];
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    );
    const csv = [csvHeader, ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${tableName}.csv"`);
    res.send(csv);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
