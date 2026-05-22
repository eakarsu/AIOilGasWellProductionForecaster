// VIZ component: Production Decline Curve Chart
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function ProductionDeclineCurveChart() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wellId, setWellId] = useState('W-001');
  const [qi, setQi] = useState(1000);
  const [di, setDi] = useState(0.08);
  const [b, setB] = useState(0.5);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || '';
      const params = new URLSearchParams({ well_id: wellId, qi, di, b, months: 60 });
      const res = await fetch(`/api/custom-views/decline-curve?${params}`, {
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
      <h3 style={{ marginTop: 0, color: '#60A5FA' }}>Production Decline Curve (Arps Hyperbolic)</h3>
      <p style={{ color: '#9CA3AF', fontSize: 13 }}>Forecast vs actual production rate over time using Arps decline model.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <label style={{ fontSize: 12 }}>Well
          <input value={wellId} onChange={e => setWellId(e.target.value)} style={inputStyle} />
        </label>
        <label style={{ fontSize: 12 }}>qi (bpd)
          <input type="number" value={qi} onChange={e => setQi(Number(e.target.value))} style={inputStyle} />
        </label>
        <label style={{ fontSize: 12 }}>di
          <input type="number" step="0.01" value={di} onChange={e => setDi(Number(e.target.value))} style={inputStyle} />
        </label>
        <label style={{ fontSize: 12 }}>b
          <input type="number" step="0.1" value={b} onChange={e => setB(Number(e.target.value))} style={inputStyle} />
        </label>
        <button onClick={load} disabled={loading} style={btnStyle}>
          {loading ? 'Loading…' : 'Update Curve'}
        </button>
      </div>

      {error && <div style={{ color: '#FCA5A5' }}>{error}</div>}
      {data && (
        <>
          <div style={{ marginBottom: 10, fontSize: 13, color: '#A7F3D0' }}>
            Well: <b>{data.well_id}</b> | EUR: <b>{data.eur_mbbl} Mbbl</b> | Model: {data.model}
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data.series}>
              <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} label={{ value: 'bpd', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
              <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #374151' }} />
              <Legend />
              <Line type="monotone" dataKey="forecast_bpd" stroke="#60A5FA" strokeWidth={2} dot={false} name="Forecast" />
              <Line type="monotone" dataKey="actual_bpd" stroke="#34D399" strokeWidth={2} dot={false} name="Actual" />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}

const inputStyle = { background: '#1F2937', color: '#fff', border: '1px solid #374151', padding: '4px 8px', borderRadius: 4, marginLeft: 6, width: 80 };
const btnStyle = { background: '#3B82F6', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 4, cursor: 'pointer', alignSelf: 'flex-end' };
