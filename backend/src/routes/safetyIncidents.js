const router = require('express').Router();
const pool = require('../models/db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM safety_incidents ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM safety_incidents WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { incident_title, site_name, well_name, incident_date, incident_type, severity, description, root_cause, corrective_action, injuries_count, days_lost, reported_by, investigation_status, osha_recordable } = req.body;
    const result = await pool.query(
      `INSERT INTO safety_incidents (incident_title, site_name, well_name, incident_date, incident_type, severity, description, root_cause, corrective_action, injuries_count, days_lost, reported_by, investigation_status, osha_recordable)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [incident_title, site_name, well_name, incident_date, incident_type, severity, description, root_cause, corrective_action, injuries_count, days_lost, reported_by, investigation_status, osha_recordable]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { incident_title, site_name, well_name, incident_date, incident_type, severity, description, root_cause, corrective_action, injuries_count, days_lost, reported_by, investigation_status, osha_recordable } = req.body;
    const result = await pool.query(
      `UPDATE safety_incidents SET incident_title=$1, site_name=$2, well_name=$3, incident_date=$4, incident_type=$5, severity=$6, description=$7, root_cause=$8, corrective_action=$9, injuries_count=$10, days_lost=$11, reported_by=$12, investigation_status=$13, osha_recordable=$14, updated_at=NOW() WHERE id=$15 RETURNING *`,
      [incident_title, site_name, well_name, incident_date, incident_type, severity, description, root_cause, corrective_action, injuries_count, days_lost, reported_by, investigation_status, osha_recordable, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM safety_incidents WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
