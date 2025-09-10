import * as React from 'react';
const { useState } = React;
import { Calculator, DollarSign } from 'lucide-react';

export function NILCalculator() {
  const [formData, setFormData] = useState({
    athleteName: '',
    sport: 'football',
    school: '',
    socialFollowers: 10000,
    performance: 75,
    marketSize: 'medium'
  });

  const [calculation, setCalculation] = useState<any>(null);

  const calculateNIL = () => {
    const baseValues = {
      football: 50000,
      basketball: 45000,
      baseball: 35000,
      other: 25000
    };

    const marketMultipliers = {
      small: 0.7,
      medium: 1.0,
      large: 1.5
    };

    const base = baseValues[formData.sport as keyof typeof baseValues] || 25000;
    const performanceMultiplier = formData.performance / 100 + 0.5;
    const socialBoost = Math.log10(formData.socialFollowers) * 0.1;
    const marketMultiplier = marketMultipliers[formData.marketSize as keyof typeof marketMultipliers];

    const totalValue = Math.round(
      base * performanceMultiplier * (1 + socialBoost) * marketMultiplier
    );

    setCalculation({
      athleteName: formData.athleteName || 'Athlete',
      school: formData.school || 'University',
      sport: formData.sport,
      baseValue: base,
      performanceMultiplier: performanceMultiplier.toFixed(2),
      socialMediaBoost: (socialBoost * 100).toFixed(1),
      totalValue,
      breakdown: {
        athletic: Math.round(totalValue * 0.5),
        academic: Math.round(totalValue * 0.2),
        social: Math.round(totalValue * 0.2),
        market: Math.round(totalValue * 0.1)
      }
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Calculator className="w-6 h-6 text-blaze-orange" />
        <h2 className="text-xl font-display font-bold">NIL Value Calculator</h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Athlete Name
            </label>
            <input
              type="text"
              value={formData.athleteName}
              onChange={(e) => setFormData({...formData, athleteName: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Enter athlete name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sport
            </label>
            <select
              value={formData.sport}
              onChange={(e) => setFormData({...formData, sport: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="football">Football</option>
              <option value="basketball">Basketball</option>
              <option value="baseball">Baseball</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              School/University
            </label>
            <input
              type="text"
              value={formData.school}
              onChange={(e) => setFormData({...formData, school: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Enter school name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Social Media Followers
            </label>
            <input
              type="number"
              value={formData.socialFollowers}
              onChange={(e) => setFormData({...formData, socialFollowers: parseInt(e.target.value) || 0})}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Performance Rating ({formData.performance}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.performance}
              onChange={(e) => setFormData({...formData, performance: parseInt(e.target.value)})}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Market Size
            </label>
            <select
              value={formData.marketSize}
              onChange={(e) => setFormData({...formData, marketSize: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="small">Small Market</option>
              <option value="medium">Medium Market</option>
              <option value="large">Large Market</option>
            </select>
          </div>

          <button
            onClick={calculateNIL}
            className="w-full px-4 py-3 bg-blaze-orange hover:bg-blaze-orange-light text-white rounded-lg font-medium transition-colors"
          >
            Calculate NIL Value
          </button>
        </div>

        {/* Results */}
        {calculation && (
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-blaze-orange to-blaze-blue rounded-lg text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm opacity-90">Estimated NIL Value</span>
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="text-4xl font-bold font-mono">
                ${calculation.totalValue.toLocaleString()}
              </div>
              <div className="text-sm opacity-90 mt-1">per year</div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 dark:text-white">Value Breakdown</h3>
              
              {Object.entries(calculation.breakdown).map(([key, value]: [string, any]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm capitalize text-gray-600 dark:text-gray-400">
                    {key} Value
                  </span>
                  <span className="font-mono font-bold">
                    ${value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-blaze-orange/10 border border-blaze-orange/30 rounded-lg">
              <h4 className="text-sm font-bold text-blaze-orange mb-2">Key Factors</h4>
              <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Base Value: ${calculation.baseValue.toLocaleString()}</li>
                <li>• Performance Multiplier: {calculation.performanceMultiplier}x</li>
                <li>• Social Media Boost: +{calculation.socialMediaBoost}%</li>
              </ul>
            </div>

            <button className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">
              Export Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}