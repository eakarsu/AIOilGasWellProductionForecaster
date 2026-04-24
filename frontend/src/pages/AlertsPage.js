import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAlerts, createAlert, updateAlert, deleteAlert, checkAlerts } from '../services/api';
import { toast } from 'react-toastify';

const TABLE_OPTIONS = [
  'wellhead_analytics', 'reservoir_simulation', 'decline_curves', 'equipment_failure',
  'environmental_compliance', 'production_forecasting', 'well_performance', 'drilling_operations',
  'cost_analysis', 'pipeline_monitoring', 'water_management', 'safety_incidents', 'gas_lift_optimization',
];

const OPERATORS = ['>', '<', '=', '>=', '<='];
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

const SEVERITY_COLORS = {
  Low: { bg: 'rgba(16, 185, 129, 0.15)', color: '#34D399' },
  Medium: { bg: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24' },
  High: { bg: 'rgba(249, 115, 22, 0.15)', color: '#FB923C' },
  Critical: { bg: 'rgba(239, 68, 68, 0.15)', color: '#F87171' },
};

export default function AlertsPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [triggeredAlerts, setTriggeredAlerts] = useState(null);
  const [checking, setChecking] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      const { data } = await getAlerts();
      setAlerts(data);
    } catch (err) {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleNew = () => {
    setFormData({ severity: 'Medium', operator: '>' });
    setEditMode(false);
    setShowForm(true);
  };

  const handleEdit = (alert) => {
    setFormData({ ...alert });
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;
    try {
      await deleteAlert(id);
      toast.success('Alert deleted');
      fetchAlerts();
    } catch (err) {
      toast.error('Failed to delete alert');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await updateAlert(formData.id, formData);
        toast.success('Alert updated');
      } else {
        await createAlert(formData);
        toast.success('Alert created');
      }
      setShowForm(false);
      setFormData({});
      fetchAlerts();
    } catch (err) {
      toast.error('Failed to save: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCheckAlerts = async () => {
    setChecking(true);
    try {
      const { data } = await checkAlerts();
      setTriggeredAlerts(data);
      if (data.triggered && data.triggered.length > 0) {
        toast.warning(`${data.triggered.length} alert(s) triggered!`);
      } else {
        toast.success('No alerts triggered');
      }
    } catch (err) {
      toast.error('Failed to check alerts: ' + (err.response?.data?.error || err.message));
    } finally {
      setChecking(false);
    }
  };

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: key === 'threshold_value' ? (value === '' ? '' : Number(value)) : value });
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

      <div className="feature-content">
        <div className="feature-page-header">
          <div className="feature-page-header-left">
            <button className="btn-back" onClick={() => navigate('/dashboard')}>&larr; Back</button>
            <h1 style={{ color: '#EF4444' }}>Alerts &amp; Thresholds</h1>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-secondary" onClick={handleCheckAlerts} disabled={checking}>
              {checking ? 'Checking...' : '\u{1F514} Check Alerts'}
            </button>
            <button className="btn btn-success" onClick={handleNew}>+ New Alert</button>
          </div>
        </div>

        {/* Triggered Alerts */}
        {triggeredAlerts && triggeredAlerts.triggered && triggeredAlerts.triggered.length > 0 && (
          <div style={{ marginBottom: 24, padding: 20, background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 16 }}>
            <h3 style={{ color: '#F87171', marginBottom: 12 }}>Triggered Alerts</h3>
            {triggeredAlerts.triggered.map((t, i) => (
              <div key={i} style={{ padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 10, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  background: SEVERITY_COLORS[t.severity]?.bg || SEVERITY_COLORS.Medium.bg,
                  color: SEVERITY_COLORS[t.severity]?.color || SEVERITY_COLORS.Medium.color,
                }}>
                  {t.severity}
                </span>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{t.alert_name || t.name}</span>
                <span style={{ color: '#94a3b8' }}>
                  {t.field_name} {t.operator} {t.threshold_value} on {t.table_name}
                </span>
                {t.message && <span style={{ color: '#64748b', marginLeft: 'auto' }}>{t.message}</span>}
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="empty-state"><div className="ai-spinner" style={{ margin: '0 auto' }} /></div>
        ) : alerts.length === 0 ? (
          <div className="empty-state">
            <h3>No alerts configured</h3>
            <p>Click "New Alert" to set up threshold monitoring</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Alert Name</th>
                  <th>Table</th>
                  <th>Field</th>
                  <th>Condition</th>
                  <th>Severity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.id} style={{ cursor: 'default' }}>
                    <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{alert.alert_name}</td>
                    <td>{alert.table_name}</td>
                    <td>{alert.field_name}</td>
                    <td>{alert.operator} {alert.threshold_value}</td>
                    <td>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        background: SEVERITY_COLORS[alert.severity]?.bg || SEVERITY_COLORS.Medium.bg,
                        color: SEVERITY_COLORS[alert.severity]?.color || SEVERITY_COLORS.Medium.color,
                      }}>
                        {alert.severity}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => handleEdit(alert)}>Edit</button>
                        <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => handleDelete(alert.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editMode ? 'Edit' : 'New'} Alert</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleFormSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Alert Name *</label>
                    <input
                      type="text"
                      value={formData.alert_name || ''}
                      onChange={(e) => handleChange('alert_name', e.target.value)}
                      required
                      placeholder="e.g., High Pressure Warning"
                    />
                  </div>
                  <div className="form-group">
                    <label>Table *</label>
                    <select value={formData.table_name || ''} onChange={(e) => handleChange('table_name', e.target.value)} required>
                      <option value="">Select table...</option>
                      {TABLE_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Field Name *</label>
                    <input
                      type="text"
                      value={formData.field_name || ''}
                      onChange={(e) => handleChange('field_name', e.target.value)}
                      required
                      placeholder="e.g., pressure_psi"
                    />
                  </div>
                  <div className="form-group">
                    <label>Operator *</label>
                    <select value={formData.operator || '>'} onChange={(e) => handleChange('operator', e.target.value)} required>
                      {OPERATORS.map((op) => (
                        <option key={op} value={op}>{op}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Threshold Value *</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.threshold_value ?? ''}
                      onChange={(e) => handleChange('threshold_value', e.target.value)}
                      required
                      placeholder="e.g., 1500"
                    />
                  </div>
                  <div className="form-group">
                    <label>Severity *</label>
                    <select value={formData.severity || 'Medium'} onChange={(e) => handleChange('severity', e.target.value)} required>
                      {SEVERITIES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>
                    {editMode ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
