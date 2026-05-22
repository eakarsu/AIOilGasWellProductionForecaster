// NON-VIZ component: Production Forecast PDF generator/downloader
import React, { useState } from 'react';

export default function ProductionForecastPDF() {
  const [wellId, setWellId] = useState('W-001');
  const [horizon, setHorizon] = useState(24);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadInfo, setDownloadInfo] = useState(null);

  const fetchPreview = async () => {
    setLoading(true);
    setError(null);
    setPreview(null);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`/api/custom-views/forecast-pdf?well_id=${encodeURIComponent(wellId)}&horizon_months=${horizon}&format=json`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setPreview(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    setError(null);
    setDownloadInfo(null);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`/api/custom-views/forecast-pdf?well_id=${encodeURIComponent(wellId)}&horizon_months=${horizon}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forecast_${wellId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadInfo(`Downloaded forecast_${wellId}.pdf (${(blob.size / 1024).toFixed(1)} KB)`);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div style={{ background: '#111827', padding: 20, borderRadius: 12, color: '#e5e7eb' }}>
      <h3 style={{ marginTop: 0, color: '#A78BFA' }}>Production Forecast PDF</h3>
      <p style={{ color: '#9CA3AF', fontSize: 13 }}>Generate a downloadable PDF report with production forecast and EUR estimate per well.</p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <label style={{ fontSize: 12 }}>Well ID
          <input value={wellId} onChange={e => setWellId(e.target.value)} style={inputStyle} />
        </label>
        <label style={{ fontSize: 12 }}>Horizon (months)
          <input type="number" min="1" max="60" value={horizon} onChange={e => setHorizon(Number(e.target.value))} style={inputStyle} />
        </label>
        <button onClick={fetchPreview} disabled={loading} style={{ ...btnStyle, background: '#8B5CF6' }}>
          {loading ? 'Loading…' : 'Preview Report'}
        </button>
        <button onClick={downloadPDF} style={{ ...btnStyle, background: '#10B981' }}>
          Download PDF
        </button>
      </div>

      {error && <div style={{ color: '#FCA5A5', marginBottom: 8 }}>{error}</div>}
      {downloadInfo && <div style={{ color: '#6EE7B7', marginBottom: 8 }}>{downloadInfo}</div>}

      {preview && (
        <div style={{ background: '#0B1220', padding: 14, borderRadius: 8 }}>
          <div style={{ marginBottom: 8, fontSize: 13, color: '#FBBF24' }}>
            Well: <b>{preview.well_id}</b> | Horizon: <b>{preview.horizon_months} mo</b> | EUR: <b>{preview.eur_mbbl} Mbbl</b>
          </div>
          <pre style={{
            background: '#000',
            color: '#A7F3D0',
            padding: 12,
            fontFamily: 'monospace',
            fontSize: 11,
            maxHeight: 400,
            overflow: 'auto',
            margin: 0,
            borderRadius: 4
          }}>{preview.report}</pre>
        </div>
      )}
    </div>
  );
}

const inputStyle = { background: '#1F2937', color: '#fff', border: '1px solid #374151', padding: '4px 8px', borderRadius: 4, marginLeft: 6, width: 100 };
const btnStyle = { color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 4, cursor: 'pointer' };
