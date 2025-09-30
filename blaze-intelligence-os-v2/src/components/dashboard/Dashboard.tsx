import * as React from 'react';
import { useBlazeContext } from '../../context/BlazeContext';
import { TeamSelector } from './TeamSelector';
import { StatsOverview } from './StatsOverview';
import { LiveGames } from './LiveGames';
import { VisionAIPanel } from './VisionAIPanel';
import { PredictionsPanel } from './PredictionsPanel';
import { DataIngestion } from './DataIngestion';
import { NILCalculator } from './NILCalculator';
import { PerformanceChart } from './PerformanceChart';
import { DomainIntegrator } from './DomainIntegrator';

export default function Dashboard() {
  const { selectedLeague, selectedTeam } = useBlazeContext();
  const [activeTab, setActiveTab] = React.useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'live', label: 'Live Games', icon: '🔴' },
    { id: 'predictions', label: 'Predictions', icon: '🎯' },
    { id: 'vision', label: 'Vision AI', icon: '👁️' },
    { id: 'nil', label: 'NIL Calculator', icon: '💰' },
    { id: 'data', label: 'Data Sources', icon: '📡' },
    { id: 'domains', label: 'Domains', icon: '🌐' }
  ];

  return (
    <div className="space-y-6">
      {/* Team and League Selector */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <TeamSelector />
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-2">
        <nav className="flex space-x-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-blaze-orange text-white'
                  : 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6">
        {activeTab === 'overview' && (
          <>
            <StatsOverview />
            <div className="grid lg:grid-cols-2 gap-6">
              <PerformanceChart />
              <PredictionsPanel limit={3} />
            </div>
          </>
        )}

        {activeTab === 'live' && <LiveGames />}
        {activeTab === 'predictions' && <PredictionsPanel />}
        {activeTab === 'vision' && <VisionAIPanel />}
        {activeTab === 'nil' && <NILCalculator />}
        {activeTab === 'data' && <DataIngestion />}
        {activeTab === 'domains' && <DomainIntegrator />}
      </div>

      {/* Footer Stats Bar */}
      <div className="bg-gradient-to-r from-blaze-navy to-blaze-navy/80 rounded-lg p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-6">
            <div>
              <span className="text-xs text-blaze-blue">Selected</span>
              <p className="font-bold">{selectedTeam} ({selectedLeague})</p>
            </div>
            <div className="h-8 w-px bg-blaze-blue/30" />
            <div>
              <span className="text-xs text-blaze-blue">Active Mode</span>
              <p className="font-bold">Championship Analytics</p>
            </div>
          </div>
          <div className="text-sm text-blaze-blue">
            Powered by Blaze Intelligence OS V2
          </div>
        </div>
      </div>
    </div>
  );
}