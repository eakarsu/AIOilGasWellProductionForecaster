// NON-VIZ component: Well Operating Rules Editor (CRUD for pressure / temp thresholds)
import React, { useEffect, useState } from 'react';

export default function WellOperatingRulesEditor() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    well_id: '',
    metric: 'wellhead_pressure',
    threshold_min: 0,
    threshold_max: 1000,
    unit: 'psi',
    action: 'alert_operator'
  });

  const token = () => localStorage.getItem('token') || '';

  const fetchRules = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/custom-views/operating-rules', {
        headers: { Authorization: `Bearer ${token()}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setRules(json.items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRules(); }, []);

  const submit = async () => {
    setError(null);
    setStatus(null);
    if (!form.well_id || !form.metric) {
      setError('Well ID and metric are required.');
      return;
    }
    try {
      const body = editing ? { ...form, id: editing } : form;
      const res = await fetch('/api/custom-views/operating-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`HTTP ${res.status}: ${t}`);
      }
      const json = await res.json();
      setStatus(`Rule ${json.action}: ${json.item.well_id} / ${json.item.metric}`);
      setEditing(null);
      setForm({ well_id: '', metric: 'wellhead_pressure', threshold_min: 0, threshold_max: 1000, unit: 'psi', action: 'alert_operator' });
      fetchRules();
    } catch (e) {
      setError(e.message);
    }
  };

  const edit = (rule) => {
    setEditing(rule.id);
    setForm({
      well_id: rule.well_id,
      metric: rule.metric,
      threshold_min: rule.threshold_min,
      threshold_max: rule.threshold_max,
      unit: rule.unit,
      action: rule.action
    });
  };

  const del = async (id) => {
    if (!window.confirm('Delete this rule?')) return;
    setError(null);
    try {
      const res = await fetch(`/api/custom-views/operating-rules/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setStatus(`Deleted rule ${json.item.well_id} / ${json.item.metric}`);
      fetchRules();
    } catch (e) {
      setError(e.message);
    }
  };

  const cancel = () => {
    setEditing(null);
    setForm({ well_id: '', metric: 'wellhead_pressure', threshold_min: 0, threshold_max: 1000, unit: 'psi', action: 'alert_operator' });
  };

  return (
    <div style={{ background: '#111827', padding: 20, borderRadius: 12, color: '#e5e7eb' }}>
      <h3 style={{ marginTop: 0, color: '#FB7185' }}>Well Operating Rules Editor</h3>
      <p style={{ color: '#9CA3AF', fontSize: 13 }}>CRUD interface for pressure and temperature threshold rules per well.</p>

      <div style={{ background: '#0B1220', padding: 14, borderRadius: 8, marginBottom: 16 }}>
        <h4 style={{ marginTop: 0, color: '#FBBF24' }}>{editing ? `Editing rule #${editing}` : 'Create new rule'}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <label style={lbl}>Well ID
            <input value={form.well_id} onChange={e => setForm({ ...form, well_id: e.target.value })} style={inp} placeholder="W-001" />
          </label>
          <label style={lbl}>Metric
            <select value={form.metric} onChange={e => setForm({ ...form, metric: e.target.value })} style={inp}>
              <option value="wellhead_pressure">Wellhead Pressure</option>
              <option value="wellhead_temperature">Wellhead Temperature</option>
              <option value="casing_pressure">Casing Pressure</option>
              <option value="tubing_pressure">Tubing Pressure</option>
              <option value="bottomhole_temperature">Bottomhole Temperature</option>
            </select>
          </label>
          <label style={lbl}>Unit
            <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} style={inp} />
          </label>
          <label style={lbl}>Threshold Min
            <input type="number" value={form.threshold_min} onChange={e => setForm({ ...form, threshold_min: Number(e.target.value) })} style={inp} />
          </label>
          <label style={lbl}>Threshold Max
            <input type="number" value={form.threshold_max} onChange={e => setForm({ ...form, threshold_max: Number(e.target.value) })} style={inp} />
          </label>
          <label style={lbl}>Action
            <select value={form.action} onChange={e => setForm({ ...form, action: e.target.value })} style={inp}>
              <option value="alert_operator">Alert Operator</option>
              <option value="log_event">Log Event</option>
              <option value="flag_review">Flag for Review</option>
              <option value="auto_shutdown">Auto Shutdown</option>
            </select>
          </label>
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
          <button onClick={submit} style={{ ...btn, background: editing ? '#F59E0B' : '#10B981' }}>
            {editing ? 'Update Rule' : 'Create Rule'}
          </button>
          {editing && <button onClick={cancel} style={{ ...btn, background: '#6B7280' }}>Cancel</button>}
        </div>
      </div>

      {error && <div style={{ color: '#FCA5A5', marginBottom: 10 }}>{error}</div>}
      {status && <div style={{ color: '#6EE7B7', marginBottom: 10 }}>{status}</div>}

      <h4 style={{ color: '#A78BFA' }}>Active Rules ({rules.length}){loading && <span style={{ marginLeft: 8, color: '#9CA3AF', fontSize: 12 }}>loading…</span>}</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#1F2937' }}>
            <th style={th}>ID</th>
            <th style={th}>Well</th>
            <th style={th}>Metric</th>
            <th style={th}>Min</th>
            <th style={th}>Max</th>
            <th style={th}>Unit</th>
            <th style={th}>Action</th>
            <th style={th}>Ops</th>
          </tr>
        </thead>
        <tbody>
          {rules.map(r => (
            <tr key={r.id} style={{ borderBottom: '1px solid #1F2937' }}>
              <td style={td}>{r.id}</td>
              <td style={td}>{r.well_id}</td>
              <td style={td}>{r.metric}</td>
              <td style={td}>{r.threshold_min}</td>
              <td style={td}>{r.threshold_max}</td>
              <td style={td}>{r.unit}</td>
              <td style={td}>{r.action}</td>
              <td style={td}>
                <button onClick={() => edit(r)} style={{ ...miniBtn, background: '#3B82F6' }}>Edit</button>
                <button onClick={() => del(r.id)} style={{ ...miniBtn, background: '#EF4444', marginLeft: 6 }}>Delete</button>
              </td>
            </tr>
          ))}
          {rules.length === 0 && !loading && (
            <tr><td colSpan={8} style={{ ...td, textAlign: 'center', color: '#6B7280' }}>No rules yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const lbl = { display: 'flex', flexDirection: 'column', fontSize: 12, color: '#D1D5DB' };
const inp = { background: '#1F2937', color: '#fff', border: '1px solid #374151', padding: '6px 8px', borderRadius: 4, marginTop: 4 };
const btn = { color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 };
const th = { textAlign: 'left', padding: '8px 10px', color: '#9CA3AF', borderBottom: '1px solid #374151' };
const td = { padding: '8px 10px' };
const miniBtn = { color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 };
