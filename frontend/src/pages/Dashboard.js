import React, { useState, useEffect } from 'react';
import { FEATURES } from '../services/features';
import { getKPISummary } from '../services/api';

const KPI_ICONS = {
  total_active_wells: '\u26F3',
  total_production_bpd: '\uD83D\uDEE2\uFE0F',
  avg_equipment_health: '\u2699',
  open_safety_incidents: '\u26A0\uFE0F',
  non_compliant_items: '\uD83D\uDEA8',
  estimated_revenue: '\uD83D\uDCB0',
};

const KPI_LABELS = {
  total_active_wells: 'Total Active Wells',
  total_production_bpd: 'Total Production (BPD)',
  avg_equipment_health: 'Avg Equipment Health',
  open_safety_incidents: 'Open Safety Incidents',
  non_compliant_items: 'Non-Compliant Items',
  estimated_revenue: 'Estimated Revenue',
};

const KPI_COLORS = {
  total_active_wells: '#3B82F6',
  total_production_bpd: '#10B981',
  avg_equipment_health: '#8B5CF6',
  open_safety_incidents: '#EF4444',
  non_compliant_items: '#F59E0B',
  estimated_revenue: '#06B6D4',
};

const featureGroups = [
  {
    title: 'Subsurface & forecasting',
    items: ['reservoir-simulation', 'decline-curves', 'production-forecasting', 'well-performance'],
  },
  {
    title: 'Field operations',
    items: ['wellhead-analytics', 'drilling-operations', 'equipment-failure', 'gas-lift-optimization'],
  },
  {
    title: 'Risk, cost & compliance',
    items: ['environmental-compliance', 'safety-incidents', 'pipeline-monitoring', 'water-management', 'cost-analysis'],
  },
];

export default function Dashboard() {
  const [kpi, setKpi] = useState(null);

  useEffect(() => {
    const fetchKPI = async () => {
      try {
        const { data } = await getKPISummary();
        setKpi(data);
      } catch (err) {
        // KPI fetch is best-effort; don't block dashboard
      }
    };
    fetchKPI();
  }, []);

  const formatKPIValue = (key, value) => {
    if (value === null || value === undefined) return '-';
    if (key === 'estimated_revenue') return '$' + Number(value).toLocaleString();
    if (key === 'avg_equipment_health') return typeof value === 'number' ? value.toFixed(1) + '%' : value;
    if (key === 'total_production_bpd') return Number(value).toLocaleString();
    return String(value).toLocaleString();
  };

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>Production Intelligence Dashboard</h1>
            <p>Use the sidebar to move through AI forecasting, field operations, alerts, and advanced oilfield workflows.</p>
          </div>
          <div className="dashboard-header-status">
            <span>Live workspace</span>
            <strong>{Object.keys(FEATURES).length} AI modules</strong>
          </div>
        </div>

        {kpi && (
          <div className="kpi-section">
            <div className="kpi-grid">
              {Object.keys(KPI_LABELS).map((key) => (
                <div className="kpi-card" key={key} style={{ '--kpi-color': KPI_COLORS[key] }}>
                  <div className="kpi-icon" style={{ background: `${KPI_COLORS[key]}20`, color: KPI_COLORS[key] }}>
                    {KPI_ICONS[key]}
                  </div>
                  <div className="kpi-value" style={{ color: KPI_COLORS[key] }}>
                    {formatKPIValue(key, kpi[key])}
                  </div>
                  <div className="kpi-label">{KPI_LABELS[key]}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <section className="operations-overview">
          <div className="overview-panel">
            <div className="overview-panel-header">
              <h2>AI Coverage</h2>
              <p>Core well production domains available from the sidebar.</p>
            </div>
            <div className="overview-module-list">
              {featureGroups.map((group) => (
                <div className="overview-module-group" key={group.title}>
                  <h3>{group.title}</h3>
                  <div className="overview-module-rows">
                    {group.items.map((key) => (
                      <div className="overview-module-row" key={key}>
                        <span className="overview-module-dot" style={{ background: FEATURES[key].color }} />
                        <div>
                          <strong>{FEATURES[key].title}</strong>
                          <span>{FEATURES[key].description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="overview-panel compact">
            <div className="overview-panel-header">
              <h2>Operations Console</h2>
              <p>Daily workspaces are grouped in the persistent sidebar.</p>
            </div>
            <div className="workflow-list">
              <div>
                <strong>Monitor</strong>
                <span>Alerts, rules, production history, and field notes.</span>
              </div>
              <div>
                <strong>Analyze</strong>
                <span>Predictive AI, custom well views, decline curves, and AI history.</span>
              </div>
              <div>
                <strong>Control</strong>
                <span>Profile, units, RBAC, webhooks, mobile field operations, and advanced workflows.</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
