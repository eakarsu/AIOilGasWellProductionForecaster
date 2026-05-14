import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  aiProductionAnomaly,
  aiPipelineRupture,
  aiOptimalMaintenanceWindow,
  aiNearMissSeverity,
  aiAssetLifecycle,
  aiMultiWellPortfolio,
  aiSensorAnomalyBatch,
} from '../services/api';

const TOOLS = [
  { id: 'production-anomaly', label: 'Production Anomaly', color: '#3B82F6' },
  { id: 'pipeline-rupture', label: 'Pipeline Rupture Predict', color: '#EF4444' },
  { id: 'maintenance-window', label: 'Optimal Maintenance Window', color: '#10B981' },
  { id: 'near-miss', label: 'Near-Miss Severity Predict', color: '#F59E0B' },
  { id: 'asset-lifecycle', label: 'Asset Lifecycle Tracking', color: '#8B5CF6' },
  { id: 'multi-well-portfolio', label: 'Multi-Well Portfolio', color: '#0EA5E9' },
  { id: 'sensor-anomaly-batch', label: 'Sensor Anomaly Batch', color: '#F97316' },
];

export default function AIPredictivePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeTool, setActiveTool] = useState('production-anomaly');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const [anomalyForm, setAnomalyForm] = useState({
    well_id: '',
    recent_readings: '',
    baseline: '',
    notes: '',
  });
  const [pipelineForm, setPipelineForm] = useState({
    pipeline_id: '',
    pressure_history: '',
    flow_history: '',
    age_years: '',
    last_inspection: '',
  });
  const [maintenanceForm, setMaintenanceForm] = useState({
    asset_id: '',
    asset_type: '',
    production_schedule: '',
    weather_window: '',
    constraints: '',
  });
  const [nearMissForm, setNearMissForm] = useState({
    site_name: '',
    well_name: '',
    event_date: '',
    description: '',
    activity: '',
    hazard_category: '',
    energy_sources: '',
    witness_count: '',
    recent_similar_count: '',
    osha_recordables_12mo: '',
    crew_experience_yrs: '',
  });
  const [portfolioForm, setPortfolioForm] = useState({
    horizon_days: '90',
    ranking_metric: 'expected_eur',
    wells: '',
  });
  const [sensorForm, setSensorForm] = useState({
    sensor_id: '',
    window_minutes: '60',
    baseline: '',
    readings: '',
  });
  const [lifecycleForm, setLifecycleForm] = useState({
    asset_name: '',
    asset_type: '',
    manufacturer: '',
    model: '',
    install_date: '',
    design_life_years: '',
    operating_hours: '',
    cumulative_throughput: '',
    health_score: '',
    maintenance_history: '',
    failure_history: '',
    replacement_cost_usd: '',
    annual_opex_usd: '',
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const parseJsonOrText = (s) => {
    if (!s || !s.trim()) return undefined;
    try { return JSON.parse(s); } catch { return s; }
  };

  const run = async () => {
    setLoading(true);
    setResult(null);
    setError('');
    try {
      let body;
      let res;
      if (activeTool === 'production-anomaly') {
        body = {
          well_id: anomalyForm.well_id ? parseInt(anomalyForm.well_id, 10) : undefined,
          recent_readings: parseJsonOrText(anomalyForm.recent_readings),
          baseline: parseJsonOrText(anomalyForm.baseline),
          notes: anomalyForm.notes,
        };
        res = await aiProductionAnomaly(body);
      } else if (activeTool === 'pipeline-rupture') {
        body = {
          pipeline_id: pipelineForm.pipeline_id ? parseInt(pipelineForm.pipeline_id, 10) : undefined,
          pressure_history: parseJsonOrText(pipelineForm.pressure_history),
          flow_history: parseJsonOrText(pipelineForm.flow_history),
          age_years: pipelineForm.age_years ? parseFloat(pipelineForm.age_years) : undefined,
          last_inspection: pipelineForm.last_inspection,
        };
        res = await aiPipelineRupture(body);
      } else if (activeTool === 'maintenance-window') {
        body = {
          asset_id: maintenanceForm.asset_id ? parseInt(maintenanceForm.asset_id, 10) : undefined,
          asset_type: maintenanceForm.asset_type,
          production_schedule: parseJsonOrText(maintenanceForm.production_schedule),
          weather_window: maintenanceForm.weather_window,
          constraints: maintenanceForm.constraints,
        };
        res = await aiOptimalMaintenanceWindow(body);
      } else if (activeTool === 'near-miss') {
        body = {
          data: {
            site_name: nearMissForm.site_name,
            well_name: nearMissForm.well_name,
            event_date: nearMissForm.event_date,
            description: nearMissForm.description,
            activity: nearMissForm.activity,
            hazard_category: nearMissForm.hazard_category,
            energy_sources: nearMissForm.energy_sources,
            witness_count: nearMissForm.witness_count ? parseInt(nearMissForm.witness_count, 10) : undefined,
            recent_similar_count: nearMissForm.recent_similar_count ? parseInt(nearMissForm.recent_similar_count, 10) : undefined,
            osha_recordables_12mo: nearMissForm.osha_recordables_12mo ? parseInt(nearMissForm.osha_recordables_12mo, 10) : undefined,
            crew_experience_yrs: nearMissForm.crew_experience_yrs ? parseFloat(nearMissForm.crew_experience_yrs) : undefined,
          },
        };
        res = await aiNearMissSeverity(body);
      } else if (activeTool === 'multi-well-portfolio') {
        body = {
          horizon_days: portfolioForm.horizon_days ? parseInt(portfolioForm.horizon_days, 10) : undefined,
          ranking_metric: portfolioForm.ranking_metric || undefined,
          wells: parseJsonOrText(portfolioForm.wells),
        };
        res = await aiMultiWellPortfolio(body);
      } else if (activeTool === 'sensor-anomaly-batch') {
        body = {
          sensor_id: sensorForm.sensor_id || undefined,
          window_minutes: sensorForm.window_minutes ? parseInt(sensorForm.window_minutes, 10) : undefined,
          baseline: parseJsonOrText(sensorForm.baseline),
          readings: parseJsonOrText(sensorForm.readings),
        };
        res = await aiSensorAnomalyBatch(body);
      } else {
        body = {
          data: {
            asset_name: lifecycleForm.asset_name,
            asset_type: lifecycleForm.asset_type,
            manufacturer: lifecycleForm.manufacturer,
            model: lifecycleForm.model,
            install_date: lifecycleForm.install_date,
            design_life_years: lifecycleForm.design_life_years ? parseFloat(lifecycleForm.design_life_years) : undefined,
            operating_hours: lifecycleForm.operating_hours ? parseFloat(lifecycleForm.operating_hours) : undefined,
            cumulative_throughput: lifecycleForm.cumulative_throughput,
            health_score: lifecycleForm.health_score ? parseFloat(lifecycleForm.health_score) : undefined,
            maintenance_history: parseJsonOrText(lifecycleForm.maintenance_history),
            failure_history: parseJsonOrText(lifecycleForm.failure_history),
            replacement_cost_usd: lifecycleForm.replacement_cost_usd ? parseFloat(lifecycleForm.replacement_cost_usd) : undefined,
            annual_opex_usd: lifecycleForm.annual_opex_usd ? parseFloat(lifecycleForm.annual_opex_usd) : undefined,
          },
        };
        res = await aiAssetLifecycle(body);
      }
      setResult(res.data);
      toast.success('AI analysis complete');
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'AI request failed';
      const display = status === 503 ? `AI service unavailable: ${msg}` : msg;
      setError(display);
      toast.error(display);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feature-page">
      <nav className="navbar">
        <a className="navbar-brand" href="/dashboard">
          <div className="navbar-brand-icon">&#9981;</div>
          PetroAI Forecaster
        </a>
        <div className="navbar-user">
          <span>Welcome, {user.name || 'Admin'}</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>AI Predictive Tools</h1>
          <p>Anomaly detection, pipeline rupture prediction, and optimal maintenance windows</p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setActiveTool(t.id); setResult(null); setError(''); }}
              style={{
                padding: '10px 16px',
                border: `2px solid ${t.color}`,
                background: activeTool === t.id ? t.color : 'transparent',
                color: activeTool === t.id ? '#fff' : t.color,
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          {activeTool === 'production-anomaly' && (
            <>
              <h3>Production Anomaly Detection</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                <div>
                  <label>Well ID</label>
                  <input type="number" value={anomalyForm.well_id} onChange={(e) => setAnomalyForm({ ...anomalyForm, well_id: e.target.value })} />
                </div>
                <div>
                  <label>Recent Readings (JSON)</label>
                  <textarea rows={4} value={anomalyForm.recent_readings} onChange={(e) => setAnomalyForm({ ...anomalyForm, recent_readings: e.target.value })} placeholder='[{"date":"2025-01-01","oil_bpd":1200,"pressure_psi":2400}]' />
                </div>
                <div>
                  <label>Baseline (JSON)</label>
                  <textarea rows={3} value={anomalyForm.baseline} onChange={(e) => setAnomalyForm({ ...anomalyForm, baseline: e.target.value })} placeholder='{"oil_bpd_mean":1300,"pressure_mean":2450}' />
                </div>
                <div>
                  <label>Notes</label>
                  <textarea rows={2} value={anomalyForm.notes} onChange={(e) => setAnomalyForm({ ...anomalyForm, notes: e.target.value })} />
                </div>
              </div>
            </>
          )}

          {activeTool === 'pipeline-rupture' && (
            <>
              <h3>Pipeline Rupture Prediction</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                <div>
                  <label>Pipeline ID</label>
                  <input type="number" value={pipelineForm.pipeline_id} onChange={(e) => setPipelineForm({ ...pipelineForm, pipeline_id: e.target.value })} />
                </div>
                <div>
                  <label>Pressure History (JSON)</label>
                  <textarea rows={3} value={pipelineForm.pressure_history} onChange={(e) => setPipelineForm({ ...pipelineForm, pressure_history: e.target.value })} placeholder='[{"ts":"2025-01-01","psi":1450}]' />
                </div>
                <div>
                  <label>Flow History (JSON)</label>
                  <textarea rows={3} value={pipelineForm.flow_history} onChange={(e) => setPipelineForm({ ...pipelineForm, flow_history: e.target.value })} placeholder='[{"ts":"2025-01-01","bpd":820}]' />
                </div>
                <div>
                  <label>Age (years)</label>
                  <input type="number" value={pipelineForm.age_years} onChange={(e) => setPipelineForm({ ...pipelineForm, age_years: e.target.value })} />
                </div>
                <div>
                  <label>Last Inspection</label>
                  <input type="date" value={pipelineForm.last_inspection} onChange={(e) => setPipelineForm({ ...pipelineForm, last_inspection: e.target.value })} />
                </div>
              </div>
            </>
          )}

          {activeTool === 'maintenance-window' && (
            <>
              <h3>Optimal Maintenance Window</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                <div>
                  <label>Asset ID</label>
                  <input type="number" value={maintenanceForm.asset_id} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, asset_id: e.target.value })} />
                </div>
                <div>
                  <label>Asset Type</label>
                  <input value={maintenanceForm.asset_type} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, asset_type: e.target.value })} placeholder="pump, separator, compressor..." />
                </div>
                <div>
                  <label>Production Schedule (JSON)</label>
                  <textarea rows={3} value={maintenanceForm.production_schedule} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, production_schedule: e.target.value })} placeholder='[{"date":"2025-02-01","priority":"high"}]' />
                </div>
                <div>
                  <label>Weather Window</label>
                  <input value={maintenanceForm.weather_window} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, weather_window: e.target.value })} placeholder="Calm conditions Feb 5-10" />
                </div>
                <div>
                  <label>Constraints</label>
                  <textarea rows={2} value={maintenanceForm.constraints} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, constraints: e.target.value })} />
                </div>
              </div>
            </>
          )}

          {activeTool === 'near-miss' && (
            <>
              <h3>Near-Miss Severity Prediction</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                <div><label>Site Name</label><input value={nearMissForm.site_name} onChange={(e) => setNearMissForm({ ...nearMissForm, site_name: e.target.value })} /></div>
                <div><label>Well Name</label><input value={nearMissForm.well_name} onChange={(e) => setNearMissForm({ ...nearMissForm, well_name: e.target.value })} /></div>
                <div><label>Event Date</label><input type="date" value={nearMissForm.event_date} onChange={(e) => setNearMissForm({ ...nearMissForm, event_date: e.target.value })} /></div>
                <div><label>Description</label><textarea rows={3} value={nearMissForm.description} onChange={(e) => setNearMissForm({ ...nearMissForm, description: e.target.value })} /></div>
                <div><label>Activity</label><input value={nearMissForm.activity} onChange={(e) => setNearMissForm({ ...nearMissForm, activity: e.target.value })} placeholder="tripping, lifting, hot work..." /></div>
                <div><label>Hazard Category</label><input value={nearMissForm.hazard_category} onChange={(e) => setNearMissForm({ ...nearMissForm, hazard_category: e.target.value })} placeholder="dropped object, fluid release..." /></div>
                <div><label>Energy Sources</label><input value={nearMissForm.energy_sources} onChange={(e) => setNearMissForm({ ...nearMissForm, energy_sources: e.target.value })} placeholder="pressure, mechanical, chemical..." /></div>
                <div><label>Witness Count</label><input type="number" value={nearMissForm.witness_count} onChange={(e) => setNearMissForm({ ...nearMissForm, witness_count: e.target.value })} /></div>
                <div><label>Recent Similar Events (last 90d)</label><input type="number" value={nearMissForm.recent_similar_count} onChange={(e) => setNearMissForm({ ...nearMissForm, recent_similar_count: e.target.value })} /></div>
                <div><label>OSHA Recordables (12mo)</label><input type="number" value={nearMissForm.osha_recordables_12mo} onChange={(e) => setNearMissForm({ ...nearMissForm, osha_recordables_12mo: e.target.value })} /></div>
                <div><label>Crew Experience (years avg)</label><input type="number" step="0.1" value={nearMissForm.crew_experience_yrs} onChange={(e) => setNearMissForm({ ...nearMissForm, crew_experience_yrs: e.target.value })} /></div>
              </div>
            </>
          )}

          {activeTool === 'multi-well-portfolio' && (
            <>
              <h3>Multi-Well Portfolio Analytics</h3>
              <p style={{ color: '#666', marginTop: 0 }}>Default horizon 90 days; default ranking metric is expected EUR. Leave Wells JSON blank to aggregate from production_history.</p>
              <div style={{ display: 'grid', gap: 12 }}>
                <div><label>Horizon (days)</label><input type="number" value={portfolioForm.horizon_days} onChange={(e) => setPortfolioForm({ ...portfolioForm, horizon_days: e.target.value })} /></div>
                <div><label>Ranking metric</label>
                  <select value={portfolioForm.ranking_metric} onChange={(e) => setPortfolioForm({ ...portfolioForm, ranking_metric: e.target.value })}>
                    <option value="expected_eur">Expected EUR</option>
                    <option value="oil_bpd">Oil BPD</option>
                    <option value="gas_mcfd">Gas MCFD</option>
                    <option value="net_revenue">Net Revenue</option>
                  </select>
                </div>
                <div><label>Wells JSON (optional)</label>
                  <textarea rows={5} value={portfolioForm.wells} onChange={(e) => setPortfolioForm({ ...portfolioForm, wells: e.target.value })} placeholder='[{"well_name":"W-1","avg_oil_bpd":420,"avg_water_cut_pct":12}]' />
                </div>
              </div>
            </>
          )}

          {activeTool === 'sensor-anomaly-batch' && (
            <>
              <h3>Sensor Anomaly Batch Scan</h3>
              <p style={{ color: '#666', marginTop: 0 }}>Synchronous batch endpoint over a sliding window of sensor readings. Streaming UI is a future product decision.</p>
              <div style={{ display: 'grid', gap: 12 }}>
                <div><label>Sensor ID</label><input value={sensorForm.sensor_id} onChange={(e) => setSensorForm({ ...sensorForm, sensor_id: e.target.value })} /></div>
                <div><label>Window (minutes)</label><input type="number" value={sensorForm.window_minutes} onChange={(e) => setSensorForm({ ...sensorForm, window_minutes: e.target.value })} /></div>
                <div><label>Baseline JSON</label><textarea rows={3} value={sensorForm.baseline} onChange={(e) => setSensorForm({ ...sensorForm, baseline: e.target.value })} placeholder='{"pressure_psi":[1200,1500],"temp_f":[140,180]}' /></div>
                <div><label>Readings JSON</label><textarea rows={6} value={sensorForm.readings} onChange={(e) => setSensorForm({ ...sensorForm, readings: e.target.value })} placeholder='[{"ts":"2024-01-01T00:00Z","pressure_psi":1450,"temp_f":160}]' /></div>
              </div>
            </>
          )}

          {activeTool === 'asset-lifecycle' && (
            <>
              <h3>Asset Lifecycle Tracking</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                <div><label>Asset Name</label><input value={lifecycleForm.asset_name} onChange={(e) => setLifecycleForm({ ...lifecycleForm, asset_name: e.target.value })} /></div>
                <div><label>Asset Type</label><input value={lifecycleForm.asset_type} onChange={(e) => setLifecycleForm({ ...lifecycleForm, asset_type: e.target.value })} placeholder="ESP, separator, compressor..." /></div>
                <div><label>Manufacturer</label><input value={lifecycleForm.manufacturer} onChange={(e) => setLifecycleForm({ ...lifecycleForm, manufacturer: e.target.value })} /></div>
                <div><label>Model</label><input value={lifecycleForm.model} onChange={(e) => setLifecycleForm({ ...lifecycleForm, model: e.target.value })} /></div>
                <div><label>Install Date</label><input type="date" value={lifecycleForm.install_date} onChange={(e) => setLifecycleForm({ ...lifecycleForm, install_date: e.target.value })} /></div>
                <div><label>Design Life (years)</label><input type="number" step="0.1" value={lifecycleForm.design_life_years} onChange={(e) => setLifecycleForm({ ...lifecycleForm, design_life_years: e.target.value })} /></div>
                <div><label>Operating Hours</label><input type="number" value={lifecycleForm.operating_hours} onChange={(e) => setLifecycleForm({ ...lifecycleForm, operating_hours: e.target.value })} /></div>
                <div><label>Cumulative Throughput</label><input value={lifecycleForm.cumulative_throughput} onChange={(e) => setLifecycleForm({ ...lifecycleForm, cumulative_throughput: e.target.value })} placeholder="e.g. 1.2M BBL" /></div>
                <div><label>Health Score (0-100)</label><input type="number" value={lifecycleForm.health_score} onChange={(e) => setLifecycleForm({ ...lifecycleForm, health_score: e.target.value })} /></div>
                <div><label>Maintenance History (JSON)</label><textarea rows={3} value={lifecycleForm.maintenance_history} onChange={(e) => setLifecycleForm({ ...lifecycleForm, maintenance_history: e.target.value })} placeholder='[{"date":"2024-06-01","type":"overhaul"}]' /></div>
                <div><label>Failure History (JSON)</label><textarea rows={3} value={lifecycleForm.failure_history} onChange={(e) => setLifecycleForm({ ...lifecycleForm, failure_history: e.target.value })} placeholder='[{"date":"2024-08-12","mode":"seal leak"}]' /></div>
                <div><label>Replacement Cost (USD)</label><input type="number" value={lifecycleForm.replacement_cost_usd} onChange={(e) => setLifecycleForm({ ...lifecycleForm, replacement_cost_usd: e.target.value })} /></div>
                <div><label>Annual OPEX (USD)</label><input type="number" value={lifecycleForm.annual_opex_usd} onChange={(e) => setLifecycleForm({ ...lifecycleForm, annual_opex_usd: e.target.value })} /></div>
              </div>
            </>
          )}

          <button
            onClick={run}
            disabled={loading}
            style={{
              marginTop: 16,
              padding: '12px 24px',
              background: '#3B82F6',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {loading ? 'Running...' : 'Run AI'}
          </button>

          {error && <div style={{ color: '#EF4444', marginTop: 16 }}>{error}</div>}
        </div>

        {result && (
          <div style={{ marginTop: 24, background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3>Result</h3>
            <pre style={{ background: '#F3F4F6', padding: 16, borderRadius: 8, overflow: 'auto', maxHeight: 500, fontSize: 13 }}>
              {JSON.stringify(result.result || result.data || result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
