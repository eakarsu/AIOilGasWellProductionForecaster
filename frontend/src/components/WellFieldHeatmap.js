// VIZ component: Well Field Performance Heatmap
import React, { useEffect, useState } from 'react';

function scoreColor(score) {
  // Red (low) → Yellow → Green (high)
  const h = (score / 100) * 120; // 0 = red, 120 = green
  return `hsl(${h}, 70%, ${30 + score * 0.25}%)`;
}

export default function WellFieldHeatmap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hover, setHover] = useState(null);
  const [field, setField] = useState('Permian-A');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`/api/custom-views/field-heatmap?field=${encodeURIComponent(field)}&rows=8&cols=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <div style={{ background: '#111827', padding: 20, borderRadius: 12, color: '#e5e7eb' }}>
      <h3 style={{ marginTop: 0, color: '#F59E0B' }}>Well Field Performance Heatmap</h3>
      <p style={{ color: '#9CA3AF', fontSize: 13 }}>2D grid of well productivity scores across the field. Brighter green = higher production.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
        <label style={{ fontSize: 12 }}>Field
          <input value={field} onChange={e => setField(e.target.value)} style={{ background: '#1F2937', color: '#fff', border: '1px solid #374151', padding: '4px 8px', borderRadius: 4, marginLeft: 6 }} />
        </label>
        <button onClick={load} disabled={loading} style={{ background: '#F59E0B', color: '#000', border: 'none', padding: '6px 14px', borderRadius: 4, cursor: 'pointer' }}>
          {loading ? 'Loading…' : 'Reload Field'}
        </button>
      </div>

      {error && <div style={{ color: '#FCA5A5' }}>{error}</div>}
      {data && (
        <>
          <div style={{ display: 'flex', gap: 20, marginBottom: 14, fontSize: 13, color: '#A7F3D0', flexWrap: 'wrap' }}>
            <span>Field: <b>{data.field}</b></span>
            <span>Wells: <b>{data.dimensions.well_count}</b></span>
            <span>Avg Score: <b>{data.stats.avg_score}</b></span>
            <span>Max: <b>{data.stats.max_score}</b></span>
            <span>Min: <b>{data.stats.min_score}</b></span>
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${data.dimensions.cols}, 50px)`, gap: 4 }}>
              {data.grid.flat().map((cell, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHover(cell)}
                  onMouseLeave={() => setHover(null)}
                  style={{
                    width: 50, height: 50, background: scoreColor(cell.score),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, color: '#fff', fontWeight: 600, cursor: 'pointer',
                    borderRadius: 4, border: hover && hover.well_id === cell.well_id ? '2px solid #FBBF24' : '1px solid #1F2937'
                  }}
                  title={`${cell.well_id} — ${cell.score} (${cell.production_bpd} bpd)`}
                >
                  {cell.score.toFixed(0)}
                </div>
              ))}
            </div>
            <div style={{ minWidth: 200 }}>
              <h4 style={{ color: '#FBBF24', marginTop: 0 }}>Top 5 Performers</h4>
              <table style={{ width: '100%', fontSize: 12, color: '#D1D5DB' }}>
                <thead><tr><th align="left">Well</th><th align="right">Score</th><th align="right">bpd</th></tr></thead>
                <tbody>
                  {data.stats.top_performers.map(t => (
                    <tr key={t.well_id}><td>{t.well_id}</td><td align="right">{t.score}</td><td align="right">{t.production_bpd}</td></tr>
                  ))}
                </tbody>
              </table>
              {hover && (
                <div style={{ marginTop: 14, padding: 10, background: '#1F2937', borderRadius: 6, fontSize: 12 }}>
                  <div><b>{hover.well_id}</b></div>
                  <div>Score: {hover.score}</div>
                  <div>Production: {hover.production_bpd} bpd</div>
                  <div>Grid: row {hover.row}, col {hover.col}</div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
