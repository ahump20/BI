import * as React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

export function PerformanceChart() {
  const data = [
    { name: 'Mon', performance: 72, predictions: 45, accuracy: 89 },
    { name: 'Tue', performance: 78, predictions: 52, accuracy: 91 },
    { name: 'Wed', performance: 85, predictions: 58, accuracy: 93 },
    { name: 'Thu', performance: 81, predictions: 61, accuracy: 90 },
    { name: 'Fri', performance: 88, predictions: 67, accuracy: 94 },
    { name: 'Sat', performance: 92, predictions: 72, accuracy: 95 },
    { name: 'Sun', performance: 95, predictions: 78, accuracy: 96 }
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-display font-bold">Performance Trends</h2>
          <p className="text-sm text-gray-500 mt-1">7-day overview</p>
        </div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-green-500">+12.5%</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#BF5700" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#BF5700" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9BCBEB" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#9BCBEB" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
          <XAxis 
            dataKey="name" 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(17, 24, 39, 0.9)',
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
            labelStyle={{ color: '#F3F4F6' }}
            itemStyle={{ color: '#F3F4F6' }}
          />
          <Area
            type="monotone"
            dataKey="performance"
            stroke="#BF5700"
            fillOpacity={1}
            fill="url(#colorPerformance)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="accuracy"
            stroke="#9BCBEB"
            fillOpacity={1}
            fill="url(#colorAccuracy)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-xs text-gray-500">Avg Performance</p>
          <p className="text-xl font-bold font-mono text-blaze-orange">84.3</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Peak Accuracy</p>
          <p className="text-xl font-bold font-mono text-blaze-blue">96%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Total Predictions</p>
          <p className="text-xl font-bold font-mono text-green-500">413</p>
        </div>
      </div>
    </div>
  );
}