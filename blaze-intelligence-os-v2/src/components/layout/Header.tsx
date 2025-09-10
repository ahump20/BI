import * as React from 'react';
import { useBlazeContext } from '../../context/BlazeContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Activity, Database, Cpu, Eye } from 'lucide-react';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { isConnected, systemStatus, analytics } = useBlazeContext();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <header className="bg-blaze-navy dark:bg-black border-b border-blaze-blue/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blaze-orange to-blaze-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">BI</span>
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-white">
                Blaze Intelligence OS V2
              </h1>
              <p className="text-blaze-blue text-sm">Championship Analytics Platform</p>
            </div>
          </div>

          {/* System Status Indicators */}
          <div className="flex items-center space-x-6">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-white text-sm">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Service Status Icons */}
            <div className="flex items-center space-x-3">
              <div className="flex flex-col items-center">
                <Activity className={`w-5 h-5 ${getStatusColor(systemStatus.api)}`} />
                <span className="text-xs text-gray-400 mt-1">API</span>
              </div>
              <div className="flex flex-col items-center">
                <Database className={`w-5 h-5 ${getStatusColor(systemStatus.database)}`} />
                <span className="text-xs text-gray-400 mt-1">DB</span>
              </div>
              <div className="flex flex-col items-center">
                <Cpu className={`w-5 h-5 ${getStatusColor(systemStatus.analytics)}`} />
                <span className="text-xs text-gray-400 mt-1">AI</span>
              </div>
              <div className="flex flex-col items-center">
                <Eye className={`w-5 h-5 ${getStatusColor(systemStatus.visionAI)}`} />
                <span className="text-xs text-gray-400 mt-1">Vision</span>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="flex items-center space-x-4 px-4 py-2 bg-black/20 rounded-lg">
              <div className="text-center">
                <p className="text-xs text-gray-400">Accuracy</p>
                <p className="text-sm font-mono font-bold text-blaze-orange">{analytics.accuracy}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Latency</p>
                <p className="text-sm font-mono font-bold text-blaze-blue">{analytics.latency}ms</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Data Points</p>
                <p className="text-sm font-mono font-bold text-green-500">
                  {(analytics.dataPoints / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-white" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}