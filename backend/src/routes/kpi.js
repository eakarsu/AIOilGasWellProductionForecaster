const router = require('express').Router();
const pool = require('../models/db');
const auth = require('../middleware/auth');

router.get('/summary', auth, async (req, res) => {
  try {
    const activeWells = await pool.query(
      "SELECT COUNT(*) as count FROM wellhead_analytics WHERE status = 'Active'"
    );

    const totalProduction = await pool.query(
      "SELECT COALESCE(SUM(flow_rate_bpd), 0) as total FROM wellhead_analytics WHERE status = 'Active'"
    );

    const avgEquipmentHealth = await pool.query(
      'SELECT COALESCE(AVG(health_score), 0) as average FROM equipment_failure'
    );

    const openIncidents = await pool.query(
      "SELECT COUNT(*) as count FROM safety_incidents WHERE investigation_status != 'Closed'"
    );

    const nonCompliant = await pool.query(
      "SELECT COUNT(*) as count FROM environmental_compliance WHERE compliance_status != 'Compliant'"
    );

    const totalRevenue = await pool.query(
      'SELECT COALESCE(SUM(estimated_revenue_usd), 0) as total FROM production_forecasting'
    );

    res.json({
      total_active_wells: parseInt(activeWells.rows[0].count),
      total_production_bpd: parseFloat(totalProduction.rows[0].total),
      avg_equipment_health: parseFloat(parseFloat(avgEquipmentHealth.rows[0].average).toFixed(2)),
      open_safety_incidents: parseInt(openIncidents.rows[0].count),
      non_compliant_items: parseInt(nonCompliant.rows[0].count),
      total_estimated_revenue_usd: parseFloat(totalRevenue.rows[0].total)
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
