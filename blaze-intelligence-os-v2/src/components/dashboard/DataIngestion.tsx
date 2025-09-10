import * as React from 'react';
import { Database, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export function DataIngestion() {
  const dataSources = [
    {
      id: '1',
      name: 'MLB Statcast',
      status: 'operational',
      frequency: 'Real-time',
      lastSync: '2 minutes ago',
      dataPoints: 125000,
      enabled: true
    },
    {
      id: '2',
      name: 'NFL Game Stats',
      status: 'operational',
      frequency: 'Every 5 min',
      lastSync: '5 minutes ago',
      dataPoints: 87500,
      enabled: true
    },
    {
      id: '3',
      name: 'NBA Player Tracking',
      status: 'operational',
      frequency: 'Real-time',
      lastSync: '1 minute ago',
      dataPoints: 95000,
      enabled: true
    },
    {
      id: '4',
      name: 'NCAA Football Data',
      status: 'degraded',
      frequency: 'Hourly',
      lastSync: '45 minutes ago',
      dataPoints: 42000,
      enabled: true
    },
    {
      id: '5',
      name: 'Perfect Game Baseball',
      status: 'operational',
      frequency: 'Daily',
      lastSync: '2 hours ago',
      dataPoints: 28000,
      enabled: true
    },
    {
      id: '6',
      name: 'Vision AI Processing',
      status: 'operational',
      frequency: 'On-demand',
      lastSync: '10 minutes ago',
      dataPoints: 1250,
      enabled: true
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'down':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const totalDataPoints = dataSources.reduce((sum, source) => sum + source.dataPoints, 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Database className="w-5 h-5 text-blaze-orange" />
            <span className="text-xs text-green-500 font-medium">Active</span>
          </div>
          <p className="text-2xl font-bold font-mono">{dataSources.length}</p>
          <p className="text-xs text-gray-500">Data Sources</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <RefreshCw className="w-5 h-5 text-blaze-blue" />
            <span className="text-xs text-green-500 font-medium">Live</span>
          </div>
          <p className="text-2xl font-bold font-mono">
            {(totalDataPoints / 1000).toFixed(1)}K
          </p>
          <p className="text-xs text-gray-500">Data Points/Hour</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-xs text-green-500 font-medium">100%</span>
          </div>
          <p className="text-2xl font-bold font-mono">
            {dataSources.filter(s => s.status === 'operational').length}/{dataSources.length}
          </p>
          <p className="text-xs text-gray-500">Operational</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-purple-500" />
            <span className="text-xs text-purple-500 font-medium">87ms</span>
          </div>
          <p className="text-2xl font-bold font-mono">Real-time</p>
          <p className="text-xs text-gray-500">Avg Latency</p>
        </div>
      </div>

      {/* Data Sources Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-display font-bold mb-4">Data Pipeline Status</h2>
        
        <div className="space-y-3">
          {dataSources.map(source => (
            <div key={source.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(source.status)}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {source.name}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">
                        {source.frequency}
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">
                        Last sync: {source.lastSync}
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs font-mono text-gray-500">
                        {(source.dataPoints / 1000).toFixed(1)}k points
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-medium ${getStatusColor(source.status)}`}>
                    {source.status}
                  </span>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={source.enabled}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blaze-orange"></div>
                  </label>

                  <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                  <div 
                    className="h-1 bg-gradient-to-r from-blaze-orange to-blaze-blue rounded-full animate-pulse"
                    style={{ width: source.status === 'operational' ? '100%' : '60%' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-3 mt-6">
          <button className="flex-1 px-4 py-2 bg-blaze-orange hover:bg-blaze-orange-light text-white rounded-lg font-medium transition-colors">
            Force Sync All
          </button>
          <button className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">
            Configure Sources
          </button>
        </div>
      </div>
    </div>
  );
}