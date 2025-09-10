/**
 * Blaze Vision AI Coach Interface - Main Entry Point
 * Preserves original Blaze Intelligence OS design with Tell Detector integration
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initThreeJS } from './utils/threeBackground';

// Initialize Three.js background (preserved from original)
document.addEventListener('DOMContentLoaded', () => {
  initThreeJS();
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);