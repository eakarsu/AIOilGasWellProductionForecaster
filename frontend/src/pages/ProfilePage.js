import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, changePassword } from '../services/api';
import { toast } from 'react-toastify';

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [profile, setProfile] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await getProfile();
      setProfile({ name: data.name || '', email: data.email || '' });
    } catch (err) {
      // Fallback to localStorage user data
      setProfile({ name: user.name || '', email: user.email || '' });
    } finally {
      setLoading(false);
    }
  }, [user.name, user.email]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateProfile(profile);
      toast.success('Profile updated successfully');
      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, name: data.name || profile.name, email: data.email || profile.email }));
    } catch (err) {
      toast.error('Failed to update profile: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.new_password.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setChangingPassword(true);
    try {
      await changePassword({
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      });
      toast.success('Password changed successfully');
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error('Failed to change password: ' + (err.response?.data?.error || err.message));
    } finally {
      setChangingPassword(false);
    }
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
            <h1 style={{ color: '#6366F1' }}>User Profile</h1>
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><div className="ai-spinner" style={{ margin: '0 auto' }} /></div>
        ) : (
          <div className="profile-container">
            {/* Profile Info */}
            <div className="profile-section">
              <div className="profile-section-header">
                <div className="profile-avatar">
                  {(profile.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2>Profile Information</h2>
                  <p style={{ color: '#64748b', fontSize: 14 }}>Update your personal details</p>
                </div>
              </div>
              <form onSubmit={handleProfileSave}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    required
                    placeholder="Your full name"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    required
                    placeholder="your@email.com"
                  />
                </div>
                <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
                  <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password */}
            <div className="profile-section">
              <div className="profile-section-header">
                <div className="profile-avatar" style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', fontSize: 20 }}>
                  &#128274;
                </div>
                <div>
                  <h2>Change Password</h2>
                  <p style={{ color: '#64748b', fontSize: 14 }}>Ensure your account stays secure</p>
                </div>
              </div>
              <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={passwords.current_password}
                    onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
                    required
                    placeholder="Enter current password"
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={passwords.new_password}
                    onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                    required
                    placeholder="Enter new password"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwords.confirm_password}
                    onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
                    required
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
                  <button type="submit" className="btn btn-danger" disabled={changingPassword}>
                    {changingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
