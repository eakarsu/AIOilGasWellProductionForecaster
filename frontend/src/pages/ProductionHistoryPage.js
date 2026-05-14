import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { toast } from 'react-toastify';
import {
  getProductionHistory, createProductionHistory, deleteProductionHistory, importProductionHistoryCSV
} from '../services/api';

export default function ProductionHistoryPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wellId, setWellId] = useState('');
  const [filterWellId, setFilterWellId] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const fileRef = useRef();

  const fetchData = async (p = page, wid = filterWellId) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 20 };
      if (wid) params.well_id = wid;
      const { data } = await getProductionHistory(params);
      if (data.data) {
        setRecords(data.data);
        setTotalPages(data.pagination.totalPages);
      } else {
        setRecords(data);
      }
    } catch (err) {
      toast.error('Failed to load production history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData(1, wellId);
    setFilterWellId(wellId);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createProductionHistory(formData);
      toast.success('Record added');
      setShowForm(false);
      setFormData({});
      fetchData();
    } catch (err) {
      toast.error('Failed to add record');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await deleteProductionHistory(id);
      toast.success('Deleted');
      fetchData();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleCSVImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const wid = prompt('Enter well ID for this CSV import:');
    if (!wid) return;
    try {
      const { data } = await importProductionHistoryCSV(wid, file);
      toast.success(data.message || 'Imported successfully');
      fetchData();
    } catch (err) {
      toast.error('CSV import failed: ' + (err.response?.data?.error || err.message));
    }
    e.target.value = '';
  };

  // Prepare chart data
  const chartData = [...records]
    .sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at))
    .map(r => ({
      date: r.recorded_at ? new Date(r.recorded_at).toLocaleDateString() : '-',
      oil_bpd: parseFloat(r.oil_bpd) || 0,
      gas_mcfd: parseFloat(r.gas_mcfd) || 0,
      water_bpd: parseFloat(r.water_bpd) || 0,
    }));

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
            <h1 style={{ color: '#3B82F6' }}>Production History</h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => fileRef.current.click()}>
              Import CSV
            </button>
            <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCSVImport} />
            <button className="btn btn-success" onClick={() => setShowForm(true)}>+ Add Record</button>
          </div>
        </div>

        {/* Filter */}
        <form onSubmit={handleFilter} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            type="number"
            placeholder="Filter by Well ID"
            value={wellId}
            onChange={e => setWellId(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
          />
          <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>Filter</button>
          {filterWellId && (
            <button type="button" className="btn btn-secondary" onClick={() => { setWellId(''); setFilterWellId(''); setPage(1); fetchData(1, ''); }}>
              Clear
            </button>
          )}
        </form>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="data-table-container" style={{ padding: 16, marginBottom: 16 }}>
            <h3 style={{ marginBottom: 12, color: '#1e293b' }}>Oil Production Over Time (BPD)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="oil_bpd" stroke="#3B82F6" name="Oil (BPD)" dot={false} />
                <Line type="monotone" dataKey="gas_mcfd" stroke="#10B981" name="Gas (MCFD)" dot={false} />
                <Line type="monotone" dataKey="water_bpd" stroke="#F59E0B" name="Water (BPD)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="empty-state"><div className="ai-spinner" style={{ margin: '0 auto' }} /></div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <h3>No production history yet</h3>
            <p>Add records manually or import a CSV file</p>
          </div>
        ) : (
          <>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Well ID</th>
                    <th>Recorded At</th>
                    <th>Oil (BPD)</th>
                    <th>Gas (MCFD)</th>
                    <th>Water (BPD)</th>
                    <th>BHP</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r.id}>
                      <td>{r.well_id || '-'}</td>
                      <td>{r.recorded_at ? new Date(r.recorded_at).toLocaleDateString() : '-'}</td>
                      <td>{r.oil_bpd || '-'}</td>
                      <td>{r.gas_mcfd || '-'}</td>
                      <td>{r.water_bpd || '-'}</td>
                      <td>{r.bhp || '-'}</td>
                      <td>
                        <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleDelete(r.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
                <button className="btn btn-secondary" disabled={page === 1} onClick={() => { const p = page - 1; setPage(p); fetchData(p); }}>
                  &larr; Prev
                </button>
                <span style={{ padding: '8px 16px', fontSize: 14 }}>Page {page} of {totalPages}</span>
                <button className="btn btn-secondary" disabled={page === totalPages} onClick={() => { const p = page + 1; setPage(p); fetchData(p); }}>
                  Next &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Record Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Production Record</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreate}>
                <div className="form-grid">
                  {[
                    { key: 'well_id', label: 'Well ID', type: 'number', required: true },
                    { key: 'recorded_at', label: 'Recorded At', type: 'date', required: true },
                    { key: 'oil_bpd', label: 'Oil (BPD)', type: 'number' },
                    { key: 'gas_mcfd', label: 'Gas (MCFD)', type: 'number' },
                    { key: 'water_bpd', label: 'Water (BPD)', type: 'number' },
                    { key: 'bhp', label: 'BHP', type: 'number' },
                  ].map(f => (
                    <div className="form-group" key={f.key}>
                      <label>{f.label}{f.required && ' *'}</label>
                      <input
                        type={f.type}
                        value={formData[f.key] || ''}
                        onChange={e => setFormData({ ...formData, [f.key]: f.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value })}
                        required={f.required}
                        step="any"
                      />
                    </div>
                  ))}
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>Add Record</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
