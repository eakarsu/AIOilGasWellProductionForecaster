import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAIHistory, getAIHistoryItem } from '../services/api';
import AIResultReport from '../components/AIResultReport';

export default function AIHistoryPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchData = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await getAIHistory({ page: p, limit: 20 });
      setRecords(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load AI history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleViewFull = async (id) => {
    setDetailLoading(true);
    try {
      const { data } = await getAIHistoryItem(id);
      setSelected(data);
    } catch (err) {
      toast.error('Failed to load record');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRowClick = (record) => {
    if (!detailLoading) handleViewFull(record.id);
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
            <h1 style={{ color: '#8B5CF6' }}>AI Analysis History</h1>
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><div className="ai-spinner" style={{ margin: '0 auto' }} /></div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <h3>No AI analyses yet</h3>
            <p>Run AI analyses on your data to see history here</p>
          </div>
        ) : (
          <>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Endpoint</th>
                    <th>Table</th>
                    <th>Entity ID</th>
                    <th>Model</th>
                    <th>Tokens</th>
                    <th>Created At</th>
                    <th>Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r.id} onClick={() => handleRowClick(r)} title="Click to view AI analysis details">
                      <td><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.endpoint}</span></td>
                      <td>{r.entity_table || '-'}</td>
                      <td>{r.entity_id || '-'}</td>
                      <td><span style={{ fontSize: 11, color: '#6366F1' }}>{r.model?.split('/').pop()}</span></td>
                      <td>{r.tokens_used?.toLocaleString() || '-'}</td>
                      <td>{new Date(r.created_at).toLocaleString()}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: '#64748b' }}>
                        {r.result_preview}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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

      {/* Full Result Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal ai-history-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>AI Analysis Details</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="ai-history-detail-grid">
                <div className="ai-history-detail-card wide">
                  <label>Endpoint</label>
                  <strong>{selected.endpoint || '-'}</strong>
                </div>
                <div className="ai-history-detail-card">
                  <label>Source Table</label>
                  <strong>{selected.entity_table || '-'}</strong>
                </div>
                <div className="ai-history-detail-card">
                  <label>Entity ID</label>
                  <strong>{selected.entity_id || '-'}</strong>
                </div>
                <div className="ai-history-detail-card">
                  <label>Model</label>
                  <strong>{selected.model || '-'}</strong>
                </div>
                <div className="ai-history-detail-card">
                  <label>Tokens</label>
                  <strong>{selected.tokens_used?.toLocaleString() || '-'}</strong>
                </div>
                <div className="ai-history-detail-card">
                  <label>Created</label>
                  <strong>{selected.created_at ? new Date(selected.created_at).toLocaleString() : '-'}</strong>
                </div>
              </div>
              <AIResultReport
                data={{
                  result_json: selected.result,
                  model: selected.model,
                  tokens_used: selected.tokens_used,
                  id: selected.id,
                }}
                title="Saved AI Analysis"
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
