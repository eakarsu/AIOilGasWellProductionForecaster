import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import UnitConverter from './pages/UnitConverter';
import AlertsPage from './pages/AlertsPage';
import FieldNotesPage from './pages/FieldNotesPage';
import ProfilePage from './pages/ProfilePage';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/feature/:featureKey" element={<PrivateRoute><FeaturePage /></PrivateRoute>} />
        <Route path="/unit-converter" element={<PrivateRoute><UnitConverter /></PrivateRoute>} />
        <Route path="/alerts" element={<PrivateRoute><AlertsPage /></PrivateRoute>} />
        <Route path="/field-notes" element={<PrivateRoute><FieldNotesPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
