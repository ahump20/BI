import * as React from 'react';
const { createContext, useContext, useState, useEffect } = React;
import { useWebSocket } from '../hooks/useWebSocket';
import { SportsData, SystemStatus, AnalyticsMetrics } from '../types';

interface BlazeContextType {
  sportsData: SportsData | null;
  systemStatus: SystemStatus;
  analytics: AnalyticsMetrics;
  isConnected: boolean;
  selectedTeam: string;
  setSelectedTeam: (team: string) => void;
  selectedLeague: string;
  setSelectedLeague: (league: string) => void;
}

const BlazeContext = createContext<BlazeContextType | undefined>(undefined);

export function BlazeProvider({ children }: { children: React.ReactNode }) {
  const [sportsData, setSportsData] = useState<SportsData | null>(null);
  const [selectedTeam, setSelectedTeam] = useState('Cardinals');
  const [selectedLeague, setSelectedLeague] = useState('MLB');
  
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    api: 'operational',
    database: 'operational',
    analytics: 'operational',
    visionAI: 'operational',
    lastUpdated: new Date().toISOString()
  });

  const [analytics, setAnalytics] = useState<AnalyticsMetrics>({
    accuracy: 94.6,
    latency: 87,
    dataPoints: 2800000,
    activeUsers: 1247,
    predictions: 3421
  });

  // WebSocket connection for real-time updates
  const { isConnected, sendMessage } = useWebSocket('ws://localhost:8001', {
    onMessage: (data) => {
      if (data.type === 'sports-update') {
        setSportsData(data.payload);
      } else if (data.type === 'system-status') {
        setSystemStatus(data.payload);
      } else if (data.type === 'analytics-update') {
        setAnalytics(data.payload);
      }
    }
  });

  // Subscribe to updates when team/league changes
  useEffect(() => {
    if (isConnected) {
      sendMessage({
        type: 'subscribe',
        payload: { team: selectedTeam, league: selectedLeague }
      });
    }
  }, [selectedTeam, selectedLeague, isConnected, sendMessage]);

  return (
    <BlazeContext.Provider value={{
      sportsData,
      systemStatus,
      analytics,
      isConnected,
      selectedTeam,
      setSelectedTeam,
      selectedLeague,
      setSelectedLeague
    }}>
      {children}
    </BlazeContext.Provider>
  );
}

export function useBlazeContext() {
  const context = useContext(BlazeContext);
  if (!context) {
    throw new Error('useBlazeContext must be used within BlazeProvider');
  }
  return context;
}