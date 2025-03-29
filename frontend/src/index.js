import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  // Global styles import
import App from './App';
import reportWebVitals from './reportWebVitals';  // Performance metrics

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Optional: Log performance metrics
reportWebVitals(console.log);