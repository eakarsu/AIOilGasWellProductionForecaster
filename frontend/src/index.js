import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    <App />
  </React.StrictMode>
);
