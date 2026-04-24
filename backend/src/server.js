require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.BACKEND_PORT || 4000;

app.use(cors());
app.use(express.json());

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Oil & Gas Forecaster API Running' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
