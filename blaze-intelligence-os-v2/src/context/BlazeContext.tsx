import * as React from 'react';
const { createContext, useContext, useState, useEffect, useMemo } = React;
import { useWebSocket } from '../hooks/useWebSocket';
import { SportsData, SystemStatus, AnalyticsMetrics } from '../types';
import {
  FALLBACK_ANALYTICS,
  FALLBACK_SPORTS_DATA,
  FALLBACK_SYSTEM_STATUS
} from '../data/fallbackSportsData';

const cloneSportsData = (data: SportsData): SportsData => ({
  ...data,
  teams: data.teams.map(team => ({ ...team })),
  players: data.players.map(player => ({
    ...player,
    stats: { ...player.stats },
    biomechanics: player.biomechanics ? { ...player.biomechanics } : undefined,
    microExpressions: player.microExpressions ? { ...player.microExpressions } : undefined
  })),
  games: data.games.map(game => ({
    ...game,
    score: game.score ? { ...game.score } : undefined,
    predictions: game.predictions
      ? {
          ...game.predictions,
          projectedScore: { ...game.predictions.projectedScore },
          keyFactors: [...game.predictions.keyFactors]
        }
      : undefined
  })),
  lastUpdated: new Date().toISOString()
});

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
  const [sportsData, setSportsData] = useState<SportsData | null>(() => cloneSportsData(FALLBACK_SPORTS_DATA));
  const [selectedTeam, setSelectedTeam] = useState('Cardinals');
  const [selectedLeague, setSelectedLeague] = useState('MLB');

  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    ...FALLBACK_SYSTEM_STATUS,
    lastUpdated: new Date().toISOString()
  });

  const [analytics, setAnalytics] = useState<AnalyticsMetrics>({ ...FALLBACK_ANALYTICS });

  const envWsUrl = import.meta.env?.VITE_WS_URL;
  const websocketUrl = useMemo(() => {
    if (envWsUrl) {
      return envWsUrl;
    }

    if (typeof window !== 'undefined') {
      const { hostname, protocol } = window.location;
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

      if (isLocalhost) {
        const wsProtocol = protocol === 'https:' ? 'wss' : 'ws';
        return `${wsProtocol}://${hostname}:8787`;
      }
    }

    return null;
  }, [envWsUrl]);

  // WebSocket connection for real-time updates
  const { isConnected, sendMessage } = useWebSocket(websocketUrl, {
    onMessage: (data) => {
      if (data.type === 'sports-update' && data.payload) {
        setSportsData(cloneSportsData(data.payload));
      } else if (data.type === 'system-status' && data.payload) {
        setSystemStatus(prev => ({
          ...prev,
          ...data.payload,
          lastUpdated: data.payload.lastUpdated || new Date().toISOString()
        }));
      } else if (data.type === 'analytics-update' && data.payload) {
        setAnalytics(prev => ({
          ...prev,
          ...data.payload
        }));
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

  // Simulate live updates when WebSocket is unavailable
  useEffect(() => {
    if (isConnected) {
      return;
    }

    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        lastUpdated: new Date().toISOString()
      }));

      setAnalytics(prev => {
        const accuracy = Math.min(99.5, Math.max(88, prev.accuracy + (Math.random() - 0.5) * 0.6));
        const latency = Math.max(60, Math.min(120, prev.latency + Math.round((Math.random() - 0.5) * 6)));
        const dataPoints = prev.dataPoints + Math.floor(Math.random() * 5000 + 750);
        const predictions = prev.predictions + Math.floor(Math.random() * 25 + 5);
        const activeUsers = Math.max(0, prev.activeUsers + Math.floor(Math.random() * 11) - 5);

        return {
          accuracy: Math.round(accuracy * 10) / 10,
          latency,
          dataPoints,
          predictions,
          activeUsers
        };
      });

      setSportsData(prev => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          lastUpdated: new Date().toISOString()
        };
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [isConnected]);

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