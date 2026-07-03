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
import AIResultReport from '../components/AIResultReport';

const TOOLS = [
  { id: 'production-anomaly', label: 'Production Anomaly', color: '#3B82F6' },
  { id: 'pipeline-rupture', label: 'Pipeline Rupture Predict', color: '#EF4444' },
  { id: 'maintenance-window', label: 'Optimal Maintenance Window', color: '#10B981' },
  { id: 'near-miss', label: 'Near-Miss Severity Predict', color: '#F59E0B' },
  { id: 'asset-lifecycle', label: 'Asset Lifecycle Tracking', color: '#8B5CF6' },
  { id: 'multi-well-portfolio', label: 'Multi-Well Portfolio', color: '#0EA5E9' },
  { id: 'sensor-anomaly-batch', label: 'Sensor Anomaly Batch', color: '#F97316' },
];

const DEFAULT_FORMS = {
  anomaly: {
    well_id: '1',
    recent_readings: '[{"date":"2025-01-01","oil_bpd":1200,"pressure_psi":2400,"water_cut_pct":18},{"date":"2025-01-02","oil_bpd":980,"pressure_psi":2180,"water_cut_pct":24}]',
    baseline: '{"oil_bpd_mean":1300,"pressure_mean":2450,"water_cut_pct_mean":18,"normal_variance_pct":8}',
    notes: 'Recent pressure and oil-rate decline after choke adjustment. Check for equipment restriction, artificial lift issue, or reservoir anomaly.',
  },
  pipeline: {
    pipeline_id: '3',
    pressure_history: '[{"ts":"2025-01-01T08:00:00Z","psi":1450},{"ts":"2025-01-01T09:00:00Z","psi":1390},{"ts":"2025-01-01T10:00:00Z","psi":1215}]',
    flow_history: '[{"ts":"2025-01-01T08:00:00Z","bpd":8200},{"ts":"2025-01-01T09:00:00Z","bpd":7900},{"ts":"2025-01-01T10:00:00Z","bpd":7100}]',
    age_years: '18',
    last_inspection: '2024-09-15',
  },
  maintenance: {
    asset_id: '7',
    asset_type: 'Electric Submersible Pump',
    production_schedule: '[{"date":"2025-02-01","production_priority":"high"},{"date":"2025-02-05","planned_rate_bpd":1150},{"date":"2025-02-08","planned_rate_bpd":900}]',
    weather_window: 'Low wind and clear access expected Feb 5-8; road access limited after Feb 10.',
    constraints: 'Avoid downtime during peak production days. Maintenance crew available for one 12-hour shift. Parts are on site.',
  },
  nearMiss: {
    site_name: 'Permian North Pad 12',
    well_name: 'PN-12H',
    event_date: '2025-01-14',
    description: 'Dropped hand tool from work platform during pressure test setup; no injury, but crew was inside potential drop zone.',
    activity: 'Pressure testing and rig-up',
    hazard_category: 'Dropped object',
    energy_sources: 'Gravity, stored pressure, mechanical handling',
    witness_count: '4',
    recent_similar_count: '2',
    osha_recordables_12mo: '1',
    crew_experience_yrs: '3.5',
  },
  portfolio: {
    horizon_days: '90',
    ranking_metric: 'expected_eur',
    wells: '[{"well_name":"Eagle Ford 14H","avg_oil_bpd":620,"avg_gas_mcfd":1800,"water_cut_pct":21,"downtime_pct":4},{"well_name":"Permian 22H","avg_oil_bpd":910,"avg_gas_mcfd":2600,"water_cut_pct":16,"downtime_pct":9},{"well_name":"Bakken 8H","avg_oil_bpd":430,"avg_gas_mcfd":1100,"water_cut_pct":29,"downtime_pct":6}]',
  },
  sensor: {
    sensor_id: 'WH-14H-PT-02',
    window_minutes: '60',
    baseline: '{"pressure_psi":[2200,2500],"temperature_f":[145,172],"vibration_mm_s":[0.1,2.5]}',
    readings: '[{"ts":"2025-01-01T09:00:00Z","pressure_psi":2420,"temperature_f":160,"vibration_mm_s":1.2},{"ts":"2025-01-01T09:15:00Z","pressure_psi":2100,"temperature_f":166,"vibration_mm_s":3.4},{"ts":"2025-01-01T09:30:00Z","pressure_psi":1980,"temperature_f":174,"vibration_mm_s":4.1}]',
  },
  lifecycle: {
    asset_name: 'ESP-22H-A',
    asset_type: 'Electric Submersible Pump',
    manufacturer: 'BoreLift Systems',
    model: 'ESP-9000X',
    install_date: '2021-06-18',
    design_life_years: '6',
    operating_hours: '28400',
    cumulative_throughput: '1.42M BBL',
    health_score: '62',
    maintenance_history: '[{"date":"2023-04-11","type":"seal inspection"},{"date":"2024-08-04","type":"motor lead replacement"}]',
    failure_history: '[{"date":"2024-10-19","mode":"high vibration shutdown","downtime_hours":18}]',
    replacement_cost_usd: '185000',
    annual_opex_usd: '42000',
  },
};

export default function AIPredictivePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeTool, setActiveTool] = useState('production-anomaly');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const [anomalyForm, setAnomalyForm] = useState(DEFAULT_FORMS.anomaly);
  const [pipelineForm, setPipelineForm] = useState(DEFAULT_FORMS.pipeline);
  const [maintenanceForm, setMaintenanceForm] = useState(DEFAULT_FORMS.maintenance);
  const [nearMissForm, setNearMissForm] = useState(DEFAULT_FORMS.nearMiss);
  const [portfolioForm, setPortfolioForm] = useState(DEFAULT_FORMS.portfolio);
  const [sensorForm, setSensorForm] = useState(DEFAULT_FORMS.sensor);
  const [lifecycleForm, setLifecycleForm] = useState(DEFAULT_FORMS.lifecycle);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const parseJsonOrText = (s) => {
    if (!s || !s.trim()) return undefined;
    try { return JSON.parse(s); } catch { return s; }
  };

  const fillToolDefaults = (toolId) => {
    setActiveTool(toolId);
    setResult(null);
    setError('');
    if (toolId === 'production-anomaly') setAnomalyForm({ ...DEFAULT_FORMS.anomaly });
    if (toolId === 'pipeline-rupture') setPipelineForm({ ...DEFAULT_FORMS.pipeline });
    if (toolId === 'maintenance-window') setMaintenanceForm({ ...DEFAULT_FORMS.maintenance });
    if (toolId === 'near-miss') setNearMissForm({ ...DEFAULT_FORMS.nearMiss });
    if (toolId === 'multi-well-portfolio') setPortfolioForm({ ...DEFAULT_FORMS.portfolio });
    if (toolId === 'sensor-anomaly-batch') setSensorForm({ ...DEFAULT_FORMS.sensor });
    if (toolId === 'asset-lifecycle') setLifecycleForm({ ...DEFAULT_FORMS.lifecycle });
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

        <div className="ai-tool-tabs">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => fillToolDefaults(t.id)}
              className={activeTool === t.id ? 'active' : ''}
              style={{ '--tool-color': t.color }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="ai-predictive-panel">
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
              <p className="ai-field-help">Default horizon 90 days; default ranking metric is expected EUR. Leave Wells JSON blank to aggregate from production history.</p>
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
              <p className="ai-field-help">Synchronous batch endpoint over a sliding window of sensor readings.</p>
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
            className="btn btn-ai"
            style={{ marginTop: 16, width: 'auto' }}
          >
            {loading ? 'Running...' : 'Run AI'}
          </button>

          {error && <div className="ai-error-message">{error}</div>}
        </div>

        {result && (
          <div style={{ marginTop: 24 }}>
            <AIResultReport data={result.result || result.data || result} title="Predictive AI Report" />
          </div>
        )}
      </div>
    </div>
  );
}
