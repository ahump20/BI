import * as React from 'react';
const { Suspense, lazy } = React;
import { BlazeProvider } from './context/BlazeContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/layout/Header';
import { LoadingScreen } from './components/common/LoadingScreen';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Lazy load main dashboard for code splitting
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BlazeProvider>
          <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8">
              <Suspense fallback={<LoadingScreen />}>
                <Dashboard />
              </Suspense>
            </main>
          </div>
        </BlazeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;