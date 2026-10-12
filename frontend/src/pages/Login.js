import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, demoLogin as requestDemoLogin } from '../services/api';
import { toast } from 'react-toastify';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async () => {
    setLoading(true);
    try {
      const { data } = await requestDemoLogin();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Demo login is unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-bg-effect login-bg-1" />
      <div className="login-bg-effect login-bg-2" />
      <div className="login-bg-effect login-bg-3" />

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">&#9981;</div>
          <h1>PetroAI Forecaster</h1>
          <p>AI-Powered Oil & Gas Production Intelligence</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <button className="btn btn-fill-login" onClick={demoLogin} type="button" disabled={loading}>
          Log In as Demo
        </button>
      </div>
    </div>
  );
}
