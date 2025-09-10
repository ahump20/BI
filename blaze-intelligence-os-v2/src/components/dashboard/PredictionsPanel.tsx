import * as React from 'react';
import { Target, TrendingUp, Award, AlertTriangle } from 'lucide-react';

interface PredictionsPanelProps {
  limit?: number;
}

export function PredictionsPanel({ limit }: PredictionsPanelProps) {
  const predictions = [
    {
      id: '1',
      type: 'game',
      title: 'Cardinals vs Cubs',
      prediction: 'Cardinals Win',
      confidence: 78,
      factors: ['Home advantage', 'Pitching matchup', 'Recent form'],
      time: '7:45 PM Today',
      icon: Award,
      color: 'text-green-500'
    },
    {
      id: '2',
      type: 'player',
      title: 'Nolan Arenado Performance',
      prediction: '2+ Hits, 1 RBI',
      confidence: 65,
      factors: ['Batting streak', 'Pitcher history', 'Home stats'],
      time: 'Tonight',
      icon: Target,
      color: 'text-blue-500'
    },
    {
      id: '3',
      type: 'trend',
      title: 'Titans Season Outlook',
      prediction: 'Playoff Contention',
      confidence: 71,
      factors: ['Division standing', 'Schedule strength', 'Key injuries'],
      time: 'Season',
      icon: TrendingUp,
      color: 'text-purple-500'
    },
    {
      id: '4',
      type: 'injury',
      title: 'Injury Risk Alert',
      prediction: 'Monitor Player #27',
      confidence: 45,
      factors: ['Biomechanics deviation', 'Fatigue indicators', 'Workload'],
      time: 'Next 2 games',
      icon: AlertTriangle,
      color: 'text-yellow-500'
    }
  ];

  const displayPredictions = limit ? predictions.slice(0, limit) : predictions;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display font-bold">AI Predictions</h2>
        <span className="text-sm text-gray-500">Powered by Blaze AI</span>
      </div>

      <div className="space-y-4">
        {displayPredictions.map(prediction => {
          const Icon = prediction.icon;
          return (
            <div key={prediction.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${prediction.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {prediction.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {prediction.time}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold font-mono text-blaze-orange">
                        {prediction.confidence}%
                      </div>
                      <div className="text-xs text-gray-500">confidence</div>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {prediction.prediction}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {prediction.factors.map((factor, index) => (
                        <span key={index} className="text-xs px-2 py-1 bg-white dark:bg-gray-900 rounded-full text-gray-600 dark:text-gray-400">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Confidence Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all ${
                          prediction.confidence >= 70 
                            ? 'bg-green-500' 
                            : prediction.confidence >= 50 
                            ? 'bg-yellow-500' 
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${prediction.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {limit && predictions.length > limit && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blaze-orange hover:text-blaze-orange-light font-medium">
            View All Predictions →
          </button>
        </div>
      )}
    </div>
  );
}