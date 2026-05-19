require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const crypto = require('crypto');

const app = express();
const PORT = process.env.BACKEND_PORT || 4000;

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || ['http://localhost:3000', 'http://localhost:3500'],
  credentials: true
}));
app.use(express.json());

// Request ID middleware
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wellhead-analytics', require('./routes/wellheadAnalytics'));
app.use('/api/reservoir-simulation', require('./routes/reservoirSimulation'));
app.use('/api/decline-curves', require('./routes/declineCurves'));
app.use('/api/equipment-failure', require('./routes/equipmentFailure'));
app.use('/api/environmental-compliance', require('./routes/environmentalCompliance'));
app.use('/api/production-forecasting', require('./routes/productionForecasting'));
app.use('/api/well-performance', require('./routes/wellPerformance'));
app.use('/api/drilling-operations', require('./routes/drillingOperations'));
app.use('/api/cost-analysis', require('./routes/costAnalysis'));
app.use('/api/pipeline-monitoring', require('./routes/pipelineMonitoring'));
app.use('/api/water-management', require('./routes/waterManagement'));
app.use('/api/safety-incidents', require('./routes/safetyIncidents'));
app.use('/api/gas-lift-optimization', require('./routes/gasLiftOptimization'));
app.use('/api/export', require('./routes/export'));
app.use('/api/unit-converter', require('./routes/unitConverter'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/kpi', require('./routes/kpi'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/field-notes', require('./routes/fieldNotes'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/production-history', require('./routes/productionHistory'));
app.use('/api/ai-history', require('./routes/aiHistory'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Oil & Gas Forecaster API Running' });
});

// === Custom Views mount (must be before 404/error handler) ===
app.use('/api/custom-views', require('./routes/customViews'));

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    requestId: req.id
  });
});


// === Custom Feature Mounts (batch_06) ===
app.use('/api/cf-agentic-well-optimization', require('./routes/customFeat01_AgenticWellOptimization'));
app.use('/api/cf-decline-curve-ensemble-modeling', require('./routes/customFeat02_DeclineCurveEnsembleModeling'));
app.use('/api/cf-sensor-anomaly-streaming', require('./routes/customFeat03_SensorAnomalyStreaming'));
app.use('/api/cf-environmental-compliance-assistant', require('./routes/customFeat04_EnvironmentalComplianceAssistant'));
app.use('/api/cf-cross-operator-benchmarking', require('./routes/customFeat05_CrossOperatorBenchmarking'));


// === Batch 06 Gaps & Frontend Mounts ===
app.use('/api/gap-production-history-logged-but-no-production', require('./routes/gapFeat_production_history_logged_but_no_production'));
app.use('/api/gap-pipeline-monitoring-without-pipeline', require('./routes/gapFeat_pipeline_monitoring_without_pipeline'));
app.use('/api/gap-safety-incidents-without-near', require('./routes/gapFeat_safety_incidents_without_near'));
app.use('/api/gap-equipment-maintenance-without-optimal', require('./routes/gapFeat_equipment_maintenance_without_optimal'));
app.use('/api/gap-no-real', require('./routes/gapFeat_no_real'));
app.use('/api/gap-no-asset-lifecycle-tracking-equipment-purchase-ins', require('./routes/gapFeat_no_asset_lifecycle_tracking_equipment_purchase_ins'));
app.use('/api/gap-no-preventive-maintenance-scheduling', require('./routes/gapFeat_no_preventive_maintenance_scheduling'));
app.use('/api/gap-limited-multi', require('./routes/gapFeat_limited_multi'));
app.use('/api/gap-no-integration-with-geological-petrophysical-datab', require('./routes/gapFeat_no_integration_with_geological_petrophysical_datab'));
app.use('/api/gap-no-webhooks-for-alert-delivery-pagerduty-slack', require('./routes/gapFeat_no_webhooks_for_alert_delivery_pagerduty_slack'));
app.use('/api/gap-no-mobile-field', require('./routes/gapFeat_no_mobile_field'));
app.use('/api/gap-no-rbac-beyond-auth', require('./routes/gapFeat_no_rbac_beyond_auth'));

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
