import React from 'react';
import ReactDOM from 'react-dom/client';
import PremiumApp from './PremiumAppFixed';
import './index.css';

// Initialize React app with championship configuration
const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <PremiumApp />
  </React.StrictMode>
);