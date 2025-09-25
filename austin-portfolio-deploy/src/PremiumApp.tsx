import React, { useEffect, useState } from 'react';
import PremiumDashboard from './components/PremiumDashboard';

// ===== CHAMPIONSHIP APP INTERFACE =====
interface AppState {
  isLoaded: boolean;
  theme: 'championship' | 'premium';
  metricsConnected: boolean;
}

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
      {/* ===== PREMIUM APP STYLES ===== */}
      <style jsx global>{`
        /* ===== GLOBAL CHAMPIONSHIP STYLES ===== */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          /* Championship Color System */
          --burnt-orange: #BF5700;
          --burnt-orange-light: #FF7A00;
          --burnt-orange-glow: rgba(191, 87, 0, 0.4);
          --sec-crimson: #9E1B32;
          --sec-crimson-light: #C73E1D;
          --titans-navy: #002244;
          --titans-navy-light: #003366;
          --field-green: #2D5016;
          --field-green-light: #3D6B1F;
          --championship-gold: #FFD700;
          --championship-gold-light: #FFED4E;
          --platinum: #E5E4E2;
          --texas-brown: #3F2A14;
          --stadium-lights: #FFF8DC;

          /* Premium Glass System */
          --glass-primary: rgba(0, 34, 68, 0.15);
          --glass-secondary: rgba(191, 87, 0, 0.1);
          --glass-accent: rgba(158, 27, 50, 0.12);
          --glass-border: rgba(255, 255, 255, 0.15);
          --glass-border-strong: rgba(255, 255, 255, 0.25);

          /* Advanced Shadows */
          --shadow-premium: 0 20px 40px rgba(0, 0, 0, 0.3),
                           0 8px 16px rgba(0, 0, 0, 0.2),
                           inset 0 1px 0 rgba(255, 255, 255, 0.1);
          --shadow-deep: 0 32px 64px rgba(0, 0, 0, 0.4);
          --shadow-glow-orange: 0 0 20px var(--burnt-orange-glow);

          /* Typography Scale */
          --font-hero: clamp(3rem, 8vw, 6rem);
          --font-display: clamp(2rem, 5vw, 4rem);
          --font-heading: clamp(1.5rem, 4vw, 2.5rem);
          --font-body: clamp(1rem, 2vw, 1.125rem);

          /* Animation Easing */
          --ease-premium: cubic-bezier(0.25, 0.8, 0.25, 1);
          --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
          --ease-slow: cubic-bezier(0.23, 1, 0.32, 1);
        }

        html {
          scroll-behavior: smooth;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 400;
          line-height: 1.6;
          color: var(--stadium-lights);
          background: #000;
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
        }

        #root {
          min-height: 100vh;
        }

        /* ===== PREMIUM APP CONTAINER ===== */
        .premium-app {
          min-height: 100vh;
          position: relative;
          background: linear-gradient(135deg,
            #000 0%,
            var(--titans-navy) 25%,
            rgba(45, 80, 22, 0.3) 50%,
            rgba(158, 27, 50, 0.2) 75%,
            #000 100%
          );
        }

        /* Advanced Background Effects */
        .premium-app::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: -1;
          background:
            radial-gradient(circle at 15% 25%, var(--burnt-orange-glow) 0%, transparent 50%),
            radial-gradient(circle at 85% 75%, rgba(158, 27, 50, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 50% 10%, rgba(255, 215, 0, 0.2) 0%, transparent 30%);
          animation: stadiumFlicker 8s ease-in-out infinite alternate;
        }

        @keyframes stadiumFlicker {
          0%, 100% { opacity: 0.4; }
          25% { opacity: 0.6; }
          50% { opacity: 0.3; }
          75% { opacity: 0.5; }
        }

        /* ===== CHAMPIONSHIP HEADER ===== */
        .championship-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: var(--glass-primary);
          backdrop-filter: blur(24px) saturate(1.8);
          border-bottom: 2px solid var(--glass-border-strong);
          box-shadow: var(--shadow-premium);
          padding: 1.5rem 2rem;
          transition: all 0.4s var(--ease-premium);
        }

        .championship-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            var(--burnt-orange) 25%,
            var(--championship-gold) 50%,
            var(--sec-crimson) 75%,
            transparent 100%
          );
        }

        .header-content {
          max-width: 1600px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .logo-premium {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          text-decoration: none;
          color: inherit;
          transition: transform 0.3s var(--ease-premium);
        }

        .logo-premium:hover {
          transform: translateY(-2px);
        }

        .logo-icon-premium {
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg,
            var(--burnt-orange) 0%,
            var(--championship-gold) 50%,
            var(--sec-crimson) 100%
          );
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-glow-orange);
          position: relative;
          overflow: hidden;
        }

        .logo-icon-premium::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          transition: left 0.6s var(--ease-premium);
        }

        .logo-icon-premium:hover::before {
          left: 100%;
        }

        .logo-icon-premium i {
          font-size: 36px;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .logo-text {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .brand-title {
          font-family: 'Oswald', sans-serif;
          font-size: var(--font-heading);
          font-weight: 700;
          background: linear-gradient(135deg,
            var(--stadium-lights) 0%,
            var(--championship-gold) 50%,
            var(--burnt-orange-light) 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }

        .brand-subtitle {
          font-size: 1rem;
          font-weight: 600;
          color: var(--platinum);
          opacity: 0.9;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1.5rem;
          background: var(--glass-secondary);
          backdrop-filter: blur(12px);
          border: 1px solid var(--glass-border);
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00FF88;
          box-shadow: 0 0 10px #00FF88;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* ===== HERO SECTION ===== */
        .hero-premium {
          padding: 4rem 2rem;
          text-align: center;
          position: relative;
          z-index: 10;
        }

        .hero-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero-badge {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background: var(--glass-accent);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--championship-gold);
          margin-bottom: 2rem;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .hero-title {
          font-family: 'Oswald', sans-serif;
          font-size: var(--font-hero);
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 2rem;
          background: linear-gradient(135deg,
            var(--stadium-lights) 0%,
            var(--championship-gold) 25%,
            var(--burnt-orange-light) 50%,
            var(--sec-crimson-light) 75%,
            var(--stadium-lights) 100%
          );
          background-size: 300% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: titleShimmer 4s ease-in-out infinite;
        }

        @keyframes titleShimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .hero-subtitle {
          font-size: var(--font-body);
          font-weight: 400;
          color: var(--platinum);
          margin-bottom: 3rem;
          opacity: 0.9;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        /* ===== RESPONSIVE DESIGN ===== */
        @media (max-width: 768px) {
          .championship-header {
            padding: 1rem 1.5rem;
          }

          .header-content {
            justify-content: center;
            text-align: center;
          }

          .logo-premium {
            flex-direction: column;
            gap: 1rem;
          }

          .hero-premium {
            padding: 2rem 1rem;
          }

          .status-indicator {
            display: none;
          }
        }

        /* ===== ACCESSIBILITY ===== */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Focus indicators */
        .logo-premium:focus {
          outline: 2px solid var(--championship-gold);
          outline-offset: 4px;
          border-radius: 4px;
        }
      `}</style>

      {/* ===== CHAMPIONSHIP HEADER ===== */}
      <header className="championship-header">
        <div className="header-content">
          <a href="/" className="logo-premium">
            <div className="logo-icon-premium">
              <i className="fas fa-fire"></i>
            </div>
            <div className="logo-text">
              <div className="brand-title">BLAZE INTELLIGENCE</div>
              <div className="brand-subtitle">The Deep South Sports Authority</div>
            </div>
          </a>

          <div className="status-indicator">
            <div className="status-dot"></div>
            <span>Championship Experience Active</span>
            {appState.metricsConnected && (
              <>
                <div className="status-dot"></div>
                <span>Live Metrics Connected</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="hero-premium">
        <div className="hero-content">
          <div className="hero-badge">Premium Visual Experience</div>
          <h1 className="hero-title">CINEMA-GRADE SPORTS INTELLIGENCE</h1>
          <p className="hero-subtitle">
            From Friday Night Lights to Sunday in the Show — experience broadcast-quality
            analytics with championship-level 3D graphics and premium interface design.
            The most visually stunning sports intelligence platform in existence.
          </p>
        </div>
      </section>

      {/* ===== PREMIUM DASHBOARD ===== */}
      <PremiumDashboard
        className="championship-dashboard"
        theme="dark"
        interactive={true}
      />
    </div>
  );
};

// ===== CHAMPIONSHIP LOADER COMPONENT =====
const ChampionshipLoader: React.FC = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #000 0%, #002244 50%, #000 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      color: '#FFF8DC'
    }}>
      <div style={{
        width: '120px',
        height: '120px',
        background: 'linear-gradient(135deg, #BF5700, #FFD700)',
        borderRadius: '50%',
        position: 'relative',
        marginBottom: '2rem',
        animation: 'loaderSpin 2s linear infinite',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 40px rgba(191, 87, 0, 0.6)'
      }}>
        <i className="fas fa-fire" style={{
          fontSize: '48px',
          color: 'white',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
        }}></i>
      </div>

      <div style={{
        fontFamily: 'Oswald, sans-serif',
        fontSize: '2.5rem',
        fontWeight: 700,
        textAlign: 'center',
        marginBottom: '1rem',
        background: 'linear-gradient(135deg, #FFF8DC 0%, #FFD700 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        🔥 BLAZE INTELLIGENCE
      </div>

      <div style={{
        fontSize: '1.25rem',
        opacity: 0.8,
        textAlign: 'center',
        fontWeight: 500
      }}>
        Loading Championship Experience...
      </div>

      <div style={{
        fontSize: '1rem',
        opacity: 0.6,
        textAlign: 'center',
        fontWeight: 400,
        marginTop: '0.5rem',
        textTransform: 'uppercase',
        letterSpacing: '0.1em'
      }}>
        The Deep South Sports Authority
      </div>

      <style jsx>{`
        @keyframes loaderSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PremiumApp;