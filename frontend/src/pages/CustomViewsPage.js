// Custom Views Page — sidebar "Wells Views" + 4 view components
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductionDeclineCurveChart from '../components/ProductionDeclineCurveChart';
import WellFieldHeatmap from '../components/WellFieldHeatmap';
import ProductionForecastPDF from '../components/ProductionForecastPDF';
import WellOperatingRulesEditor from '../components/WellOperatingRulesEditor';

const VIEWS = [
  { key: 'decline-curve', label: 'Decline Curve Chart', icon: '\u{1F4C9}', kind: 'VIZ', component: ProductionDeclineCurveChart },
  { key: 'field-heatmap', label: 'Field Performance Heatmap', icon: '\u{1F525}', kind: 'VIZ', component: WellFieldHeatmap },
  { key: 'forecast-pdf', label: 'Forecast PDF Export', icon: '\u{1F4C4}', kind: 'NON-VIZ', component: ProductionForecastPDF },
  { key: 'operating-rules', label: 'Operating Rules Editor', icon: '\u{2699}\u{FE0F}', kind: 'NON-VIZ', component: WellOperatingRulesEditor },
];

export default function CustomViewsPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState('decline-curve');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const Active = (VIEWS.find(v => v.key === active) || VIEWS[0]).component;

  return (
    <div data-testid="custom-views-page" style={{ minHeight: '100vh', background: '#0F172A', color: '#e5e7eb' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', background: '#0B1220', borderBottom: '1px solid #1F2937' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <span style={{ fontSize: 22 }}>&#9981;</span>
          <span style={{ fontWeight: 700, color: '#60A5FA' }}>PetroAI Forecaster — Wells Views</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13 }}>
          <span style={{ color: '#9CA3AF' }}>Welcome, {user.name || 'Admin'}</span>
          <button onClick={() => navigate('/dashboard')} style={{ background: '#374151', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 4, cursor: 'pointer' }}>Back to Dashboard</button>
        </div>
      </nav>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
        <aside data-testid="wells-views-sidebar" style={{ width: 260, background: '#0B1220', borderRight: '1px solid #1F2937', padding: '18px 12px' }}>
          <h2 style={{ color: '#A78BFA', fontSize: 16, marginTop: 0, marginBottom: 14, padding: '0 8px' }}>Wells Views</h2>
          {VIEWS.map(v => (
            <button
              key={v.key}
              data-testid={`sidebar-${v.key}`}
              onClick={() => setActive(v.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '10px 12px', marginBottom: 4,
                background: active === v.key ? '#1F2937' : 'transparent',
                color: active === v.key ? '#60A5FA' : '#D1D5DB',
                border: 'none', borderRadius: 6, cursor: 'pointer',
                textAlign: 'left', fontSize: 13, fontWeight: active === v.key ? 600 : 400,
                borderLeft: active === v.key ? '3px solid #60A5FA' : '3px solid transparent'
              }}
            >
              <span style={{ fontSize: 18 }}>{v.icon}</span>
              <div style={{ flex: 1 }}>
                <div>{v.label}</div>
                <div style={{ fontSize: 10, color: v.kind === 'VIZ' ? '#34D399' : '#FB7185' }}>{v.kind}</div>
              </div>
            </button>
          ))}

          <div style={{ marginTop: 24, padding: '12px', background: '#111827', borderRadius: 6, fontSize: 11, color: '#9CA3AF' }}>
            <div style={{ fontWeight: 600, color: '#FBBF24', marginBottom: 6 }}>Domain</div>
            Oil &amp; Gas Well Production Forecasting
          </div>
        </aside>

        <main style={{ flex: 1, padding: 24, overflow: 'auto' }}>
          <Active />
        </main>
      </div>
    </div>
  );
}
