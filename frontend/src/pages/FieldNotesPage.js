import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFieldNotes, getFieldNote, createFieldNote, updateFieldNote, deleteFieldNote } from '../services/api';
import { toast } from 'react-toastify';

const NOTE_TYPES = ['Observation', 'Maintenance', 'Issue', 'General'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const PRIORITY_COLORS = {
  Low: { bg: 'rgba(16, 185, 129, 0.15)', color: '#34D399' },
  Medium: { bg: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24' },
  High: { bg: 'rgba(239, 68, 68, 0.15)', color: '#F87171' },
};

const NOTE_TYPE_ICONS = {
  Observation: '\u{1F441}\uFE0F',
  Maintenance: '\u{1F527}',
  Issue: '\u26A0\uFE0F',
  General: '\u{1F4DD}',
};

export default function FieldNotesPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  const fetchNotes = useCallback(async () => {
    try {
      const { data } = await getFieldNotes();
      setNotes(data);
    } catch (err) {
      toast.error('Failed to load field notes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleRowClick = async (note) => {
    try {
      const { data } = await getFieldNote(note.id);
      setSelectedNote(data);
      setShowDetail(true);
    } catch (err) {
      toast.error('Failed to load note details');
    }
  };

  const handleNew = () => {
    setFormData({ note_type: 'General', priority: 'Medium', author: user.name || '' });
    setEditMode(false);
    setShowForm(true);
  };

  const handleEdit = () => {
    setFormData({ ...selectedNote });
    setEditMode(true);
    setShowDetail(false);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this field note?')) return;
    try {
      await deleteFieldNote(selectedNote.id);
      toast.success('Field note deleted');
      setShowDetail(false);
      setSelectedNote(null);
      fetchNotes();
    } catch (err) {
      toast.error('Failed to delete field note');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await updateFieldNote(formData.id, formData);
        toast.success('Field note updated');
      } else {
        await createFieldNote(formData);
        toast.success('Field note created');
      }
      setShowForm(false);
      setFormData({});
      fetchNotes();
    } catch (err) {
      toast.error('Failed to save: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
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
            <h1 style={{ color: '#10B981' }}>Field Notes &amp; Logbook</h1>
          </div>
          <button className="btn btn-success" onClick={handleNew}>+ New Note</button>
        </div>

        {loading ? (
          <div className="empty-state"><div className="ai-spinner" style={{ margin: '0 auto' }} /></div>
        ) : notes.length === 0 ? (
          <div className="empty-state">
            <h3>No field notes yet</h3>
            <p>Click "New Note" to create your first field note</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Well</th>
                  <th>Type</th>
                  <th>Author</th>
                  <th>Priority</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {notes.map((note) => (
                  <tr key={note.id} onClick={() => handleRowClick(note)}>
                    <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{note.title}</td>
                    <td>{note.well_name || '-'}</td>
                    <td>
                      <span style={{ marginRight: 6 }}>{NOTE_TYPE_ICONS[note.note_type] || ''}</span>
                      {note.note_type}
                    </td>
                    <td>{note.author || '-'}</td>
                    <td>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        background: PRIORITY_COLORS[note.priority]?.bg || PRIORITY_COLORS.Medium.bg,
                        color: PRIORITY_COLORS[note.priority]?.color || PRIORITY_COLORS.Medium.color,
                      }}>
                        {note.priority}
                      </span>
                    </td>
                    <td style={{ color: '#64748b' }}>{formatDate(note.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedNote && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedNote.title}</h2>
              <button className="modal-close" onClick={() => setShowDetail(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Well Name</label>
                  <span>{selectedNote.well_name || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Note Type</label>
                  <span>{NOTE_TYPE_ICONS[selectedNote.note_type] || ''} {selectedNote.note_type}</span>
                </div>
                <div className="detail-item">
                  <label>Author</label>
                  <span>{selectedNote.author || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Priority</label>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    background: PRIORITY_COLORS[selectedNote.priority]?.bg || PRIORITY_COLORS.Medium.bg,
                    color: PRIORITY_COLORS[selectedNote.priority]?.color || PRIORITY_COLORS.Medium.color,
                  }}>
                    {selectedNote.priority}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Created</label>
                  <span>{formatDate(selectedNote.created_at)}</span>
                </div>
                <div className="detail-item">
                  <label>Updated</label>
                  <span>{formatDate(selectedNote.updated_at)}</span>
                </div>
              </div>

              {/* Full Content */}
              <div className="field-note-content">
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#64748b', marginBottom: 8 }}>Content</label>
                <div style={{
                  padding: 20,
                  background: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: 12,
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  color: '#cbd5e1',
                  lineHeight: 1.8,
                  fontSize: 14,
                  whiteSpace: 'pre-wrap',
                  marginTop: 4,
                }}>
                  {selectedNote.content || 'No content available.'}
                </div>
              </div>
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
          <div className="modal form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editMode ? 'Edit' : 'New'} Field Note</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleFormSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => handleChange('title', e.target.value)}
                      required
                      placeholder="Note title"
                    />
                  </div>
                  <div className="form-group">
                    <label>Well Name</label>
                    <input
                      type="text"
                      value={formData.well_name || ''}
                      onChange={(e) => handleChange('well_name', e.target.value)}
                      placeholder="e.g., Well-001"
                    />
                  </div>
                  <div className="form-group">
                    <label>Note Type *</label>
                    <select value={formData.note_type || 'General'} onChange={(e) => handleChange('note_type', e.target.value)} required>
                      {NOTE_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Author</label>
                    <input
                      type="text"
                      value={formData.author || ''}
                      onChange={(e) => handleChange('author', e.target.value)}
                      placeholder="Author name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Priority *</label>
                    <select value={formData.priority || 'Medium'} onChange={(e) => handleChange('priority', e.target.value)} required>
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: 16 }}>
                  <label>Content *</label>
                  <textarea
                    value={formData.content || ''}
                    onChange={(e) => handleChange('content', e.target.value)}
                    required
                    placeholder="Write your field note here..."
                    rows={6}
                    style={{ resize: 'vertical' }}
                  />
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
