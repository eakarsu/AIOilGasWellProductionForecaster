import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FEATURES } from '../services/features';
import { getItems, getItem, createItem, updateItem, deleteItem, analyzeWithAI, calculateDeclineCurve } from '../services/api';
import { toast } from 'react-toastify';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function parseMarkdown(text) {
  if (!text) return '';
  let html = text
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h2>$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');
  if (!html.startsWith('<')) html = '<p>' + html + '</p>';
  return html;
}

export default function FeaturePage() {
  const { featureKey } = useParams();
  const navigate = useNavigate();
  const feature = FEATURES[featureKey];

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [declineCalc, setDeclineCalc] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchItems = useCallback(async () => {
    try {
      const { data } = await getItems(feature.endpoint);
      setItems(data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [feature.endpoint]);

  useEffect(() => {
    if (feature) fetchItems();
  }, [feature, fetchItems]);

  if (!feature) {
    navigate('/dashboard');
    return null;
  }

  const handleRowClick = async (item) => {
    try {
      const { data } = await getItem(feature.endpoint, item.id);
      setSelectedItem(data);
      setShowDetail(true);
      setAiAnalysis('');
      setDeclineCalc(null);
    } catch (err) {
      toast.error('Failed to load details');
    }
  };

  const handleCalculateDecline = async () => {
    if (!selectedItem) return;
    setCalcLoading(true);
    setDeclineCalc(null);
    try {
      const { data } = await calculateDeclineCurve(selectedItem.id);
      setDeclineCalc(data);
      toast.success('Decline curve calculated');
    } catch (err) {
      toast.error('Calculation failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setCalcLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteItem(feature.endpoint, selectedItem.id);
      toast.success('Deleted successfully');
      setShowDetail(false);
      setSelectedItem(null);
      fetchItems();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleEdit = () => {
    const data = { ...selectedItem };
    // Format dates for input fields
    feature.fields.forEach(f => {
      if (f.type === 'date' && data[f.key]) {
        data[f.key] = data[f.key].split('T')[0];
      }
    });
    setFormData(data);
    setEditMode(true);
    setShowDetail(false);
    setShowForm(true);
  };

  const handleNew = () => {
    setFormData({});
    setEditMode(false);
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await updateItem(feature.endpoint, formData.id, formData);
        toast.success('Updated successfully');
      } else {
        await createItem(feature.endpoint, formData);
        toast.success('Created successfully');
      }
      setShowForm(false);
      setFormData({});
      fetchItems();
    } catch (err) {
      toast.error('Failed to save: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAIAnalysis = async () => {
    setAiLoading(true);
    setAiAnalysis('');
    try {
      const { data } = await analyzeWithAI(feature.aiType, selectedItem);
      setAiAnalysis(data.analysis);
    } catch (err) {
      toast.error('AI analysis failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setAiLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const formatValue = (key, value) => {
    if (value === null || value === undefined) return '-';
    if (key.includes('date')) return value ? new Date(value).toLocaleDateString() : '-';
    if (key.includes('revenue') || key.includes('penalty') || key.includes('price') || key.includes('capex') || key.includes('opex') || key.includes('npv') || key.includes('drilling_cost') || key.includes('completion_cost') || key.includes('cost_per')) {
      return typeof value === 'number' ? '$' + value.toLocaleString() : value;
    }
    if (typeof value === 'number') return value.toLocaleString();
    return String(value);
  };

  const getStatusClass = (val) => {
    if (!val) return '';
    const v = String(val).toLowerCase();
    if (['active', 'operational', 'compliant', 'good', 'completed', 'producing', 'optimized', 'closed', 'low'].includes(v)) return 'status-active';
    if (['warning', 'inactive', 'non-compliant', 'fair', 'completing', 'needs review', 'in progress', 'medium', 'drilling', 'planned'].includes(v)) return 'status-warning';
    if (['critical', 'shut-in', 'suspended', 'open', 'high', 'abandoned'].includes(v)) return 'status-critical';
    return '';
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
            <h1 style={{ color: feature.color }}>{feature.title}</h1>
          </div>
          <button className="btn btn-success" onClick={handleNew}>+ New Item</button>
        </div>

        {loading ? (
          <div className="empty-state"><div className="ai-spinner" style={{ margin: '0 auto' }} /></div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No data yet</h3>
            <p>Click "New Item" to add your first record</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {feature.columns.map(col => (
                    <th key={col}>{feature.columnLabels[col] || col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} onClick={() => handleRowClick(item)}>
                    {feature.columns.map(col => (
                      <td key={col}>
                        {(['status', 'compliance_status', 'integrity_status', 'project_status', 'optimization_status', 'investigation_status', 'severity'].includes(col)) ? (
                          <span className={`status-badge ${getStatusClass(item[col])}`}>{item[col]}</span>
                        ) : (
                          formatValue(col, item[col])
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedItem[feature.fields[0].key]}</h2>
              <button className="modal-close" onClick={() => setShowDetail(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                {feature.fields.map(field => (
                  <div className="detail-item" key={field.key}>
                    <label>{field.label}</label>
                    <span>
                      {(['status', 'compliance_status', 'integrity_status', 'project_status', 'optimization_status', 'investigation_status', 'severity'].includes(field.key)) ? (
                        <span className={`status-badge ${getStatusClass(selectedItem[field.key])}`}>
                          {selectedItem[field.key] || '-'}
                        </span>
                      ) : (
                        formatValue(field.key, selectedItem[field.key])
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* AI Analysis Section */}
              <div className="ai-analysis-container">
                <div className="ai-analysis-header">
                  <span style={{ fontSize: 24 }}>&#129302;</span>
                  AI Analysis Engine
                </div>
                {!aiAnalysis && !aiLoading && (
                  <button className="btn btn-ai" onClick={handleAIAnalysis}>
                    &#9889; Run AI Analysis
                  </button>
                )}
                {aiLoading && (
                  <div className="ai-loading">
                    <div className="ai-spinner" />
                    Analyzing with AI... This may take a moment.
                  </div>
                )}
                {aiAnalysis && (
                  <div className="ai-analysis-content" dangerouslySetInnerHTML={{ __html: parseMarkdown(aiAnalysis) }} />
                )}
              </div>

              {/* Decline Curve Calculate Section — only shown on decline-curves feature */}
              {featureKey === 'decline-curves' && (
                <div className="ai-analysis-container" style={{ marginTop: 16 }}>
                  <div className="ai-analysis-header">
                    <span style={{ fontSize: 24 }}>&#128200;</span>
                    Arps Decline Curve Calculator
                  </div>
                  {!declineCalc && !calcLoading && (
                    <button className="btn btn-ai" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }} onClick={handleCalculateDecline}>
                      Calculate Decline Curve
                    </button>
                  )}
                  {calcLoading && (
                    <div className="ai-loading">
                      <div className="ai-spinner" />
                      Calculating decline curve...
                    </div>
                  )}
                  {declineCalc && (
                    <div>
                      <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                        <div style={{ background: '#F0FDF4', padding: '8px 14px', borderRadius: 8, fontSize: 13 }}>
                          <strong>qi:</strong> {declineCalc.qi} BPD
                        </div>
                        <div style={{ background: '#F0FDF4', padding: '8px 14px', borderRadius: 8, fontSize: 13 }}>
                          <strong>Di:</strong> {(declineCalc.Di * 100).toFixed(3)}%/mo
                        </div>
                        <div style={{ background: '#DBEAFE', padding: '8px 14px', borderRadius: 8, fontSize: 13 }}>
                          <strong>EUR:</strong> {declineCalc.EUR_bbl?.toLocaleString()} BBL
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={declineCalc.forecast_12mo}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -2 }} />
                          <YAxis label={{ value: 'BPD', angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(val) => `${val.toFixed(1)} BPD`} />
                          <Line type="monotone" dataKey="rate_bpd" stroke="#10B981" name="Rate (BPD)" dot={false} strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                      {declineCalc.ai_narrative && (
                        <div className="ai-analysis-content" style={{ marginTop: 12 }}>
                          {declineCalc.ai_narrative}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDetail(false)}>Close</button>
              <button className="btn btn-primary" onClick={handleEdit} style={{ width: 'auto' }}>&#9998; Edit</button>
              <button className="btn btn-danger" onClick={handleDelete}>&#128465; Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editMode ? 'Edit' : 'New'} {feature.title}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleFormSubmit}>
                <div className="form-grid">
                  {feature.fields.map(field => (
                    <div className="form-group" key={field.key}>
                      <label>{field.label}{field.required && ' *'}</label>
                      {field.type === 'select' ? (
                        <select
                          value={formData[field.key] || ''}
                          onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                          required={field.required}
                        >
                          <option value="">Select...</option>
                          {field.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={formData[field.key] || ''}
                          onChange={e => setFormData({ ...formData, [field.key]: field.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value })}
                          required={field.required}
                          step={field.type === 'number' ? 'any' : undefined}
                        />
                      )}
                    </div>
                  ))}
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
