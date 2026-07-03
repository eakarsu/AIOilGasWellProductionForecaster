import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { analyzeOperationItem, createOperationItem, deleteOperationItem, getOperationItem, getOperationItems, updateOperationItem } from '../services/api';
import AIResultReport from '../components/AIResultReport';
import { getOperationAiActions, getOperationResource } from '../services/operations';

function humanizeKey(key) {
  return String(key).replace(/_/g, ' ').replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (String(value).match(/^\d{4}-\d{2}-\d{2}T/)) return new Date(value).toLocaleString();
  if (String(value).match(/^\d{4}-\d{2}-\d{2}$/)) return new Date(`${value}T00:00:00`).toLocaleDateString();
  return String(value);
}

function formValue(field, value) {
  if (value === null || value === undefined) return '';
  if (field.type === 'date' && String(value).includes('T')) return String(value).slice(0, 10);
  if (field.type === 'datetime-local' && String(value).includes('T')) return String(value).slice(0, 16);
  return value;
}

function statusClass(value) {
  const text = String(value || '').toLowerCase();
  if (/(critical|failed|overdue|expired|high|finding|suspended|low stock|escalated)/.test(text)) return 'status-critical';
  if (/(warning|pending|open|due soon|review|medium|deferred|waiting)/.test(text)) return 'status-warning';
  return 'status-active';
}

export default function OperationsResourcePage() {
  const { resourceKey } = useParams();
  const navigate = useNavigate();
  const resource = getOperationResource(resourceKey);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [aiResult, setAiResult] = useState(null);
  const [aiLoadingAction, setAiLoadingAction] = useState(null);

  const defaultFormData = useMemo(() => (
    (resource?.fields || []).reduce((data, field) => {
      if (field.options?.length) data[field.key] = field.options[0];
      return data;
    }, {})
  ), [resource]);

  const fetchItems = useCallback(async () => {
    if (!resource) return;
    setLoading(true);
    try {
      const { data } = await getOperationItems(resourceKey);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(`Failed to load ${resource.title}`);
    } finally {
      setLoading(false);
    }
  }, [resource, resourceKey]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  if (!resource) {
    return (
      <div className="feature-page">
        <div className="feature-content">
          <div className="empty-state">
            <h3>Unknown operations module</h3>
            <button className="btn btn-secondary" type="button" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  const openNewForm = () => {
    setFormData(defaultFormData);
    setEditMode(false);
    setShowForm(true);
  };

  const openDetails = async (item) => {
    try {
      const { data } = await getOperationItem(resourceKey, item.id);
      setSelectedItem(data);
      setAiResult(null);
      setShowDetail(true);
    } catch (err) {
      toast.error('Failed to load row details');
    }
  };

  const openEditForm = () => {
    const normalized = resource.fields.reduce((data, field) => {
      data[field.key] = formValue(field, selectedItem[field.key]);
      return data;
    }, { id: selectedItem.id });
    setFormData(normalized);
    setEditMode(true);
    setShowDetail(false);
    setShowForm(true);
  };

  const runContextAi = async (action) => {
    if (!selectedItem) return;
    setAiLoadingAction(action.key);
    setAiResult(null);
    try {
      const { data } = await analyzeOperationItem(resourceKey, selectedItem.id, action.key);
      setAiResult({ ...data, title: action.label });
    } catch (err) {
      toast.error(`AI action failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setAiLoadingAction(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem || !window.confirm(`Delete ${resource.title} row #${selectedItem.id}?`)) return;
    try {
      await deleteOperationItem(resourceKey, selectedItem.id);
      toast.success('Deleted');
      setShowDetail(false);
      setSelectedItem(null);
      fetchItems();
    } catch (err) {
      toast.error(`Delete failed: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editMode) {
        await updateOperationItem(resourceKey, formData.id, formData);
        toast.success('Updated');
      } else {
        await createOperationItem(resourceKey, formData);
        toast.success('Created');
      }
      setShowForm(false);
      setFormData({});
      fetchItems();
    } catch (err) {
      toast.error(`Save failed: ${err.response?.data?.error || err.message}`);
    }
  };

  const renderField = (field) => {
    const value = formData[field.key] || '';
    if (field.type === 'select') {
      return (
        <select value={value} onChange={(event) => setFormData({ ...formData, [field.key]: event.target.value })} required={field.required}>
          {(field.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      );
    }
    if (field.type === 'textarea') {
      return (
        <textarea
          rows={4}
          value={value}
          onChange={(event) => setFormData({ ...formData, [field.key]: event.target.value })}
          required={field.required}
        />
      );
    }
    return (
      <input
        type={field.type || 'text'}
        value={value}
        onChange={(event) => setFormData({ ...formData, [field.key]: field.type === 'number' && event.target.value !== '' ? Number(event.target.value) : event.target.value })}
        required={field.required}
      />
    );
  };

  const aiActions = getOperationAiActions(resourceKey);

  return (
    <div className="feature-page">
      <div className="feature-content">
        <div className="feature-page-header">
          <div className="feature-page-header-left">
            <button className="btn-back" type="button" onClick={() => navigate('/dashboard')}>Back</button>
            <div>
              <h1 style={{ color: resource.color }}>{resource.title}</h1>
              <p className="operations-page-subtitle">{resource.description}</p>
            </div>
          </div>
          {!resource.readOnly && <button className="btn btn-success" type="button" onClick={openNewForm}>+ New</button>}
        </div>

        {loading ? (
          <div className="empty-state"><div className="ai-spinner" style={{ margin: '0 auto' }} /></div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>No rows yet</h3>
            <p>{resource.readOnly ? 'Events will appear here as records are changed.' : 'Create the first record to start this workflow.'}</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {resource.columns.map((column) => <th key={column}>{humanizeKey(column)}</th>)}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} onClick={() => openDetails(item)}>
                    {resource.columns.map((column) => {
                      const value = item[column];
                      const isStatus = /(status|priority|severity|criticality|action)/.test(column);
                      return (
                        <td key={column}>
                          {isStatus ? <span className={`status-badge ${statusClass(value)}`}>{formatValue(value)}</span> : formatValue(value)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showDetail && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>{formatValue(selectedItem[resource.primary] || `${resource.title} #${selectedItem.id}`)}</h2>
              <button className="modal-close" type="button" onClick={() => setShowDetail(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                {Object.entries(selectedItem).map(([key, value]) => (
                  <div className="detail-item" key={key}>
                    <label>{humanizeKey(key)}</label>
                    <span>{formatValue(value)}</span>
                  </div>
                ))}
              </div>
              <div className="operation-ai-panel">
                <div className="operation-ai-panel-header">
                  <div>
                    <span>Contextual AI</span>
                    <strong>{resource.title} actions</strong>
                  </div>
                </div>
                <div className="operation-ai-actions">
                  {aiActions.map((action) => (
                    <button
                      key={action.key}
                      type="button"
                      onClick={() => runContextAi(action)}
                      disabled={Boolean(aiLoadingAction)}
                    >
                      {aiLoadingAction === action.key ? 'Running...' : action.label}
                    </button>
                  ))}
                </div>
                {aiResult && (
                  <AIResultReport data={{ analysis: aiResult.analysis, model: aiResult.model }} title={aiResult.title || 'AI Operations Report'} />
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" type="button" onClick={() => setShowDetail(false)}>Cancel</button>
              {!resource.readOnly && <button className="btn btn-primary" type="button" onClick={openEditForm} style={{ width: 'auto' }}>Edit</button>}
              {!resource.readOnly && <button className="btn btn-danger" type="button" onClick={handleDelete}>Delete</button>}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal form-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>{editMode ? 'Edit' : 'New'} {resource.title}</h2>
              <button className="modal-close" type="button" onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  {resource.fields.map((field) => (
                    <div className="form-group" key={field.key}>
                      <label>{field.label}{field.required ? ' *' : ''}</label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>{editMode ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
