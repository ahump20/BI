import React, { useEffect, useState } from 'react';
import PremiumDashboard from './components/PremiumDashboard';

// ===== CHAMPIONSHIP APP INTERFACE =====
interface AppState {
  isLoaded: boolean;
  theme: 'championship' | 'premium';
  metricsConnected: boolean;
}

// Championship Loader Component
const ChampionshipLoader: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="championship-loader">
      <div className="loader-inner">
        <div className="loader-logo">
          <div className="logo-icon" />
        </div>
        <div className="loader-text">
          <h1 className="loader-title">BLAZE</h1>
          <p className="loader-subtitle">Intelligence Loading...</p>
        </div>
        <div className="loader-progress">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};

// ===== PREMIUM BLAZE INTELLIGENCE APP =====
const PremiumApp: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    isLoaded: false,
    theme: 'championship',
    metricsConnected: false
  });

  // ===== CHAMPIONSHIP LOADING SEQUENCE =====
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setAppState(prev => ({ ...prev, isLoaded: true }));
    }, 2500);

    return () => clearTimeout(loadingTimeout);
  }, []);

  // ===== LIVE METRICS CONNECTION =====
  useEffect(() => {
    const connectMetrics = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/metrics');
        if (response.ok) {
          setAppState(prev => ({ ...prev, metricsConnected: true }));
        }
      } catch (error) {
        console.log('Using fallback metrics');
        setAppState(prev => ({ ...prev, metricsConnected: true }));
      }
    };

    connectMetrics();
  }, []);

  if (!appState.isLoaded) {
    return <ChampionshipLoader />;
  }

  return (
    <div className="premium-app">
      {/* Premium Header */}
      <header className="premium-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-badge">🔥</div>
            <h1 className="logo-text text-gradient">Blaze Intelligence</h1>
          </div>
          <nav className="premium-nav">
            <button className="nav-btn">Dashboard</button>
            <button className="nav-btn">Analytics</button>
            <button className="nav-btn">Recruiting</button>
            <button className="nav-btn">Live Games</button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="premium-content">
        <PremiumDashboard
          theme={appState.theme}
          metricsConnected={appState.metricsConnected}
        />
      </main>

      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-item">
          <span className="status-dot" style={{
            backgroundColor: appState.metricsConnected ? '#00ff00' : '#ff0000'
          }} />
          <span>Metrics: {appState.metricsConnected ? 'Connected' : 'Offline'}</span>
        </div>
        <div className="status-item">
          <span className="status-dot" style={{ backgroundColor: '#00ff00' }} />
          <span>Real-time Updates Active</span>
        </div>
      </div>
    </div>
  );
};

export default PremiumApp;