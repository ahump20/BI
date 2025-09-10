import * as React from 'react';
import { useBlazeContext } from '../../context/BlazeContext';
import { TrendingUp, TrendingDown, Users, Trophy, Target, Brain } from 'lucide-react';

export function StatsOverview() {
  const { analytics, selectedTeam, selectedLeague } = useBlazeContext();

  const stats = [
    {
      label: 'Win Probability',
      value: '67.8%',
      change: '+5.2%',
      trend: 'up',
      icon: Trophy,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      label: 'Team Performance',
      value: '8.4/10',
      change: '+0.7',
      trend: 'up',
      icon: Target,
      color: 'text-blaze-orange',
      bgColor: 'bg-blaze-orange/10'
    },
    {
      label: 'Active Players',
      value: '26',
      change: '0',
      trend: 'neutral',
      icon: Users,
      color: 'text-blaze-blue',
      bgColor: 'bg-blaze-blue/10'
    },
    {
      label: 'AI Predictions',
      value: `${analytics.accuracy}%`,
      change: '+2.1%',
      trend: 'up',
      icon: Brain,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              {stat.trend !== 'neutral' && (
                <div className="flex items-center space-x-1">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="text-2xl font-bold font-mono mt-1">{stat.value}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  {selectedTeam} • {selectedLeague}
                </span>
                <span className="text-blaze-orange font-medium">Live</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}