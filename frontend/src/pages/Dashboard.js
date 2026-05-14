import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FEATURES } from '../services/features';
import { getKPISummary } from '../services/api';

const ICONS = {
  'wellhead-analytics': '\u26F3',
  'reservoir-simulation': '\u26F0',
  'decline-curves': '\uD83D\uDCC9',
  'equipment-failure': '\u2699',
  'environmental-compliance': '\uD83C\uDF3F',
  'production-forecasting': '\uD83D\uDD2E',
  'well-performance': '\uD83D\uDCCA',
  'drilling-operations': '\uD83D\uDD29',
  'cost-analysis': '\uD83D\uDCB0',
  'pipeline-monitoring': '\uD83D\uDEA7',
  'water-management': '\uD83D\uDCA7',
  'safety-incidents': '\u26A0\uFE0F',
  'gas-lift-optimization': '\uD83D\uDCA8'
};

const TOOLS = [
  {
    key: 'unit-converter',
    title: 'Unit Converter',
    description: 'Convert between oil & gas industry units',
    icon: '\u2696\uFE0F',
    color: '#F59E0B',
    path: '/unit-converter',
  },
  {
    key: 'alerts',
    title: 'Alerts & Thresholds',
    description: 'Set up and monitor production alerts',
    icon: '\uD83D\uDD14',
    color: '#EF4444',
    path: '/alerts',
  },
  {
    key: 'field-notes',
    title: 'Field Notes & Logbook',
    description: 'Record field observations and maintenance logs',
    icon: '\uD83D\uDCD3',
    color: '#10B981',
    path: '/field-notes',
  },
  {
    key: 'profile',
    title: 'User Profile',
    description: 'Manage your account settings and preferences',
    icon: '\uD83D\uDC64',
    color: '#6366F1',
    path: '/profile',
  },
  {
    key: 'production-history',
    title: 'Production History',
    description: 'Time-series production data with charts and CSV import',
    icon: '\uD83D\uDCC8',
    color: '#3B82F6',
    path: '/production-history',
  },
  {
    key: 'ai-history',
    title: 'AI Analysis History',
    description: 'Review all past AI analyses and results',
    icon: '\uD83E\uDDE0',
    color: '#8B5CF6',
    path: '/ai-history',
  },
  {
    key: 'ai-predictive',
    title: 'AI Predictive Tools',
    description: 'Production anomalies, pipeline rupture prediction, and optimal maintenance windows',
    icon: '🔮',
    color: '#0EA5E9',
    path: '/ai-predictive',
  },
  {
    key: 'alert-rules',
    title: 'Alert Rules',
    description: 'Configure threshold-based alerts and evaluate violations',
    icon: '\uD83D\uDEA8',
    color: '#EF4444',
    path: '/alert-rules',
  },
];

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

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatKPIValue = (key, value) => {
    if (value === null || value === undefined) return '-';
    if (key === 'estimated_revenue') return '$' + Number(value).toLocaleString();
    if (key === 'avg_equipment_health') return typeof value === 'number' ? value.toFixed(1) + '%' : value;
    if (key === 'total_production_bpd') return Number(value).toLocaleString();
    return String(value).toLocaleString();
  };

  return (
    <div className="dashboard">
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
          <h1>Production Intelligence Dashboard</h1>
          <p>AI-powered analytics for oil & gas well production optimization</p>
        </div>

        {/* KPI Summary Section */}
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

        {/* AI Features Grid */}
        <div className="feature-grid">
          {Object.entries(FEATURES).map(([key, feature]) => (
            <div
              key={key}
              className="feature-card"
              onClick={() => navigate(`/feature/${key}`)}
              style={{ '--card-color': feature.color }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: feature.gradient, borderRadius: '20px 20px 0 0' }} />
              <div className="feature-card-icon" style={{ background: `${feature.color}20`, color: feature.color }}>
                {ICONS[key]}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <div className="feature-card-footer">
                <span className="feature-card-badge" style={{ background: `${feature.color}15`, color: feature.color }}>
                  AI-Powered
                </span>
                <div className="feature-card-arrow">&rarr;</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tools & Utilities Section */}
        <div className="tools-section">
          <div className="tools-header">
            <h2>Tools & Utilities</h2>
            <p>Non-AI tools for daily operations and management</p>
          </div>
          <div className="feature-grid">
            {TOOLS.map((tool) => (
              <div
                key={tool.key}
                className="feature-card"
                onClick={() => navigate(tool.path)}
                style={{ '--card-color': tool.color }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: tool.color, borderRadius: '20px 20px 0 0' }} />
                <div className="feature-card-icon" style={{ background: `${tool.color}20`, color: tool.color }}>
                  {tool.icon}
                </div>
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
                <div className="feature-card-footer">
                  <span className="feature-card-badge" style={{ background: `${tool.color}15`, color: tool.color }}>
                    Utility
                  </span>
                  <div className="feature-card-arrow">&rarr;</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
