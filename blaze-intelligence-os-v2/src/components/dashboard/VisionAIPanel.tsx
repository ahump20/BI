import * as React from 'react';
const { useState } = React;
import { Eye, Upload, Camera, Brain, Activity, AlertCircle } from 'lucide-react';

export function VisionAIPanel() {
  const [activeAnalysis, setActiveAnalysis] = useState<'biomechanics' | 'microexpressions'>('biomechanics');
  
  const biomechanicsData = {
    posture: 92,
    balance: 88,
    velocity: 95,
    acceleration: 87,
    efficiency: 91,
    injuryRisk: 15
  };

  const microExpressionData = {
    confidence: 89,
    determination: 94,
    focus: 91,
    stress: 22,
    grit: 96,
    character: 93
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Eye className="w-6 h-6 text-blaze-orange" />
          <h2 className="text-xl font-display font-bold">Vision AI Analysis</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-lg bg-blaze-orange/10 hover:bg-blaze-orange/20 text-blaze-orange transition-colors">
            <Upload className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg bg-blaze-orange/10 hover:bg-blaze-orange/20 text-blaze-orange transition-colors">
            <Camera className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Analysis Type Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveAnalysis('biomechanics')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-all ${
            activeAnalysis === 'biomechanics'
              ? 'bg-white dark:bg-gray-900 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span className="font-medium">Biomechanics</span>
        </button>
        <button
          onClick={() => setActiveAnalysis('microexpressions')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-all ${
            activeAnalysis === 'microexpressions'
              ? 'bg-white dark:bg-gray-900 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span className="font-medium">Micro-Expressions</span>
        </button>
      </div>

      {/* Analysis Content */}
      {activeAnalysis === 'biomechanics' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(biomechanicsData).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm capitalize text-gray-600 dark:text-gray-400">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className={`text-sm font-bold ${
                    key === 'injuryRisk' 
                      ? value < 30 ? 'text-green-500' : value < 60 ? 'text-yellow-500' : 'text-red-500'
                      : value >= 90 ? 'text-green-500' : value >= 70 ? 'text-blue-500' : 'text-gray-500'
                  }`}>
                    {value}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      key === 'injuryRisk'
                        ? 'bg-gradient-to-r from-green-500 to-red-500'
                        : 'bg-gradient-to-r from-blaze-orange to-blaze-blue'
                    }`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Alert for injury risk */}
          {biomechanicsData.injuryRisk < 30 && (
            <div className="flex items-start space-x-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-400">
                  Low Injury Risk Detected
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Biomechanical efficiency is optimal. Maintain current training regimen.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(microExpressionData).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm capitalize text-gray-600 dark:text-gray-400">
                    {key}
                  </span>
                  <span className={`text-sm font-bold ${
                    key === 'stress' 
                      ? value < 30 ? 'text-green-500' : value < 60 ? 'text-yellow-500' : 'text-red-500'
                      : value >= 90 ? 'text-green-500' : value >= 70 ? 'text-blue-500' : 'text-gray-500'
                  }`}>
                    {value}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      key === 'stress'
                        ? 'bg-gradient-to-r from-green-500 to-red-500'
                        : 'bg-gradient-to-r from-blaze-blue to-blaze-orange'
                    }`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Character assessment */}
          <div className="p-4 bg-blaze-orange/10 border border-blaze-orange/30 rounded-lg">
            <h3 className="text-sm font-bold text-blaze-orange mb-2">Character Assessment</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              High levels of grit and determination detected. This athlete demonstrates 
              championship-caliber mental fortitude and focus under pressure.
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button className="flex-1 px-4 py-2 bg-blaze-orange hover:bg-blaze-orange-light text-white rounded-lg font-medium transition-colors">
          Generate Report
        </button>
        <button className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">
          Export Data
        </button>
      </div>
    </div>
  );
}