import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { convertUnit } from '../services/api';
import { toast } from 'react-toastify';

const UNIT_CATEGORIES = {
  Pressure: ['PSI', 'bar', 'kPa', 'atm'],
  Temperature: ['Fahrenheit', 'Celsius', 'Kelvin'],
  Volume: ['barrels', 'gallons', 'liters', 'cubic meters'],
  'Flow Rate': ['BPD', 'GPM', 'm3/day', 'liters/min'],
  Length: ['feet', 'meters', 'inches', 'centimeters'],
  Weight: ['pounds', 'kilograms', 'tons'],
};

const CATEGORY_ICONS = {
  Pressure: '\u{1F4A8}',
  Temperature: '\u{1F321}\uFE0F',
  Volume: '\u{1F6E2}\uFE0F',
  'Flow Rate': '\u{1F4A7}',
  Length: '\u{1F4CF}',
  Weight: '\u2696\uFE0F',
};

export default function UnitConverter() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [category, setCategory] = useState('Pressure');
  const [fromUnit, setFromUnit] = useState('PSI');
  const [toUnit, setToUnit] = useState('bar');
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    const units = UNIT_CATEGORIES[cat];
    setFromUnit(units[0]);
    setToUnit(units[1]);
    setResult(null);
  };

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setResult(null);
  };

  const handleConvert = async () => {
    if (!inputValue || isNaN(inputValue)) {
      toast.error('Please enter a valid number');
      return;
    }
    setLoading(true);
    try {
      const { data } = await convertUnit({
        category,
        fromUnit,
        toUnit,
        value: parseFloat(inputValue),
      });
      setResult(data);
      setHistory((prev) => [
        {
          id: Date.now(),
          category,
          from: `${inputValue} ${fromUnit}`,
          to: `${data.result} ${toUnit}`,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 9),
      ]);
      toast.success('Conversion complete');
    } catch (err) {
      toast.error('Conversion failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const units = UNIT_CATEGORIES[category];

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
            <h1 style={{ color: '#F59E0B' }}>Unit Converter</h1>
          </div>
        </div>

        <div className="converter-container">
          {/* Category Selector */}
          <div className="converter-categories">
            {Object.keys(UNIT_CATEGORIES).map((cat) => (
              <button
                key={cat}
                className={`converter-category-btn ${category === cat ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat)}
              >
                <span className="converter-category-icon">{CATEGORY_ICONS[cat]}</span>
                {cat}
              </button>
            ))}
          </div>

          {/* Conversion Panel */}
          <div className="converter-panel">
            <div className="converter-row">
              <div className="converter-input-group">
                <label>Value</label>
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => { setInputValue(e.target.value); setResult(null); }}
                  placeholder="Enter value..."
                  className="converter-input"
                  onKeyDown={(e) => e.key === 'Enter' && handleConvert()}
                />
              </div>

              <div className="converter-input-group">
                <label>From</label>
                <select value={fromUnit} onChange={(e) => { setFromUnit(e.target.value); setResult(null); }} className="converter-select">
                  {units.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <button className="converter-swap-btn" onClick={handleSwap} title="Swap units">
                &#8646;
              </button>

              <div className="converter-input-group">
                <label>To</label>
                <select value={toUnit} onChange={(e) => { setToUnit(e.target.value); setResult(null); }} className="converter-select">
                  {units.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <button className="btn btn-primary converter-btn" onClick={handleConvert} disabled={loading} style={{ width: 'auto', marginTop: '22px' }}>
                {loading ? 'Converting...' : 'Convert'}
              </button>
            </div>

            {/* Result */}
            {result && (
              <div className="converter-result">
                <div className="converter-result-value">
                  {parseFloat(inputValue).toLocaleString()} {fromUnit}
                </div>
                <div className="converter-result-equals">=</div>
                <div className="converter-result-value converter-result-highlight">
                  {typeof result.result === 'number' ? result.result.toLocaleString(undefined, { maximumFractionDigits: 6 }) : result.result} {toUnit}
                </div>
              </div>
            )}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="converter-history">
              <h3>Recent Conversions</h3>
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id} style={{ cursor: 'default' }}>
                        <td>{item.category}</td>
                        <td>{item.from}</td>
                        <td style={{ color: '#F59E0B', fontWeight: 600 }}>{item.to}</td>
                        <td style={{ color: '#64748b' }}>{item.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
