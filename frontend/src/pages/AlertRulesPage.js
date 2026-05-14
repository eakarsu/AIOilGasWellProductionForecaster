import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAlertRules, createAlertRule, updateAlertRule, deleteAlertRule, evaluateAlerts } from '../services/api';

const VALID_TABLES = [
  'wellhead_analytics', 'reservoir_simulation', 'decline_curves',
  'equipment_failure', 'environmental_compliance', 'production_forecasting',
  'well_performance', 'drilling_operations', 'cost_analysis',
  'pipeline_monitoring', 'water_management', 'safety_incidents',
  'gas_lift_optimization'
];

const OPERATORS = ['>', '<', '=', '>=', '<='];

export default function AlertRulesPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRule, setEditRule] = useState(null);
  const [formData, setFormData] = useState({ operator: '>', threshold: 0 });
  const [violations, setViolations] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const { data } = await getAlertRules();
      setRules(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      toast.error('Failed to load rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRules(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editRule) {
        await updateAlertRule(editRule.id, formData);
        toast.success('Rule updated');
      } else {
        await createAlertRule(formData);
        toast.success('Rule created');
      }
      setShowForm(false);
      setEditRule(null);
      setFormData({ operator: '>', threshold: 0 });
      fetchRules();
    } catch (err) {
      toast.error('Failed to save rule: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEdit = (rule) => {
    setEditRule(rule);
    setFormData({
      metric: rule.metric,
      operator: rule.operator,
      threshold: rule.threshold,
      entity_type: rule.entity_type,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this rule?')) return;
    try {
      await deleteAlertRule(id);
      toast.success('Rule deleted');
      fetchRules();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      const { data } = await evaluateAlerts();
      setViolations(data);
      if (data.violations.length === 0) {
        toast.success('No violations found');
      } else {
        toast.warning(`${data.violations.length} violation(s) found`);
      }
    } catch (err) {
      toast.error('Evaluation failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setEvaluating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
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
            <h1 style={{ color: '#EF4444' }}>Alert Rules</h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={handleEvaluate} disabled={evaluating}>
              {evaluating ? 'Evaluating...' : 'Evaluate Now'}
            </button>
            <button className="btn btn-success" onClick={() => { setEditRule(null); setFormData({ operator: '>', threshold: 0 }); setShowForm(true); }}>
              + New Rule
            </button>
          </div>
        </div>

        {/* Violations Panel */}
        {violations && (
          <div style={{ background: violations.violations.length > 0 ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${violations.violations.length > 0 ? '#FECACA' : '#BBF7D0'}`, borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <h3 style={{ color: violations.violations.length > 0 ? '#DC2626' : '#16A34A', marginBottom: 8 }}>
              {violations.violations.length > 0 ? `${violations.violations.length} Rule Violation(s) Detected` : 'All Clear — No Violations'}
            </h3>
            {violations.violations.map((v, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 6, padding: 12, marginTop: 8, border: '1px solid #FECACA' }}>
                <strong>{v.metric} {v.operator} {v.threshold}</strong> in <em>{v.entity_type}</em>
                <span style={{ marginLeft: 8, color: '#EF4444' }}>({v.violation_count} record{v.violation_count > 1 ? 's' : ''})</span>
              </div>
            ))}
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>Rules evaluated: {violations.evaluated}</p>
          </div>
        )}

        {loading ? (
          <div className="empty-state"><div className="ai-spinner" style={{ margin: '0 auto' }} /></div>
        ) : rules.length === 0 ? (
          <div className="empty-state">
            <h3>No alert rules yet</h3>
            <p>Create rules to monitor your data for threshold violations</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Operator</th>
                  <th>Threshold</th>
                  <th>Entity Type</th>
                  <th>Active</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.metric}</strong></td>
                    <td><span style={{ fontFamily: 'monospace', fontSize: 14 }}>{r.operator}</span></td>
                    <td>{r.threshold}</td>
                    <td>{r.entity_type || '-'}</td>
                    <td>
                      <span className={`status-badge ${r.is_active ? 'status-active' : 'status-warning'}`}>
                        {r.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: 12, width: 'auto' }} onClick={() => handleEdit(r)}>Edit</button>
                      <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleDelete(r.id)}>Delete</button>
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
          <div className="modal form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editRule ? 'Edit' : 'New'} Alert Rule</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Metric (column name) *</label>
                    <input
                      type="text"
                      value={formData.metric || ''}
                      onChange={e => setFormData({ ...formData, metric: e.target.value })}
                      required
                      placeholder="e.g. pressure_psi"
                    />
                  </div>
                  <div className="form-group">
                    <label>Operator *</label>
                    <select value={formData.operator || '>'} onChange={e => setFormData({ ...formData, operator: e.target.value })}>
                      {OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Threshold *</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.threshold || ''}
                      onChange={e => setFormData({ ...formData, threshold: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Entity Type (table)</label>
                    <select value={formData.entity_type || ''} onChange={e => setFormData({ ...formData, entity_type: e.target.value })}>
                      <option value="">Select table...</option>
                      {VALID_TABLES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  {editRule && (
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={formData.is_active !== false}
                          onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                          style={{ marginRight: 8 }}
                        />
                        Active
                      </label>
                    </div>
                  )}
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>{editRule ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
