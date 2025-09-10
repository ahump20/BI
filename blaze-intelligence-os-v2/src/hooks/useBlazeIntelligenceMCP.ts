/**
 * Blaze Intelligence MCP Integration Hook
 * Connects to the MCP server for real-time Cardinals analytics
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { sportsDataManager } from '../connectors/sports-data-connectors';

// MCP Server types (matching your existing Cardinals MCP)
interface MCPResponse {
  tool: string;
  result: any;
  timestamp: number;
  cached?: boolean;
}

interface CardinalsMetrics {
  teamReadiness: number;
  leverageIndex: number;
  winProbability: number;
  playerMetrics: PlayerReadiness[];
  gameContext?: GameContext;
}

interface PlayerReadiness {
  name: string;
  position: string;
  readinessScore: number;
  recentPerformance: number;
  fatigue: number;
  confidence: number;
}

interface GameContext {
  opponent: string;
  date: string;
  venue: string;
  weather?: WeatherConditions;
  umpire?: string;
}

interface WeatherConditions {
  temperature: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
}

// Hook configuration
interface UseBlazeIntelligenceMCPConfig {
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  enableCache?: boolean;
}

// Hook state
interface BlazeIntelligenceMCPState {
  connected: boolean;
  loading: boolean;
  error: Error | null;
  metrics: CardinalsMetrics | null;
  lastUpdate: Date | null;
  cache: Map<string, any>;
}

/**
 * Custom hook for Blaze Intelligence MCP integration
 */
export function useBlazeIntelligenceMCP(
  config: UseBlazeIntelligenceMCPConfig = {}
): {
  state: BlazeIntelligenceMCPState;
  actions: {
    connect: () => Promise<void>;
    disconnect: () => void;
    getTeamReadiness: () => Promise<CardinalsMetrics>;
    getPlayerAnalysis: (playerName: string) => Promise<PlayerReadiness>;
    getGamePrediction: (opponent: string) => Promise<any>;
    refreshData: () => Promise<void>;
  };
} {
  const {
    autoConnect = true,
    reconnectAttempts = 3,
    reconnectDelay = 5000,
    enableCache = true
  } = config;

  // State management
  const [state, setState] = useState<BlazeIntelligenceMCPState>({
    connected: false,
    loading: false,
    error: null,
    metrics: null,
    lastUpdate: null,
    cache: new Map()
  });

  // Socket and connection refs
  const socketRef = useRef<Socket | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectCountRef = useRef(0);

  // MCP server endpoints
  const MCP_HTTP_URL = process.env.VITE_MCP_HTTP_URL || 'http://localhost:3000';
  const MCP_WS_URL = process.env.VITE_MCP_WS_URL || 'ws://localhost:8787';

  /**
   * Connect to MCP server
   */
  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Connect to WebSocket for real-time updates
      wsRef.current = new WebSocket(MCP_WS_URL);

      wsRef.current.onopen = () => {
        console.log('[MCP] WebSocket connected');
        setState(prev => ({ ...prev, connected: true, loading: false }));
        reconnectCountRef.current = 0;

        // Subscribe to Cardinals updates
        wsRef.current?.send(JSON.stringify({
          type: 'subscribe',
          team: 'cardinals'
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMCPMessage(data);
        } catch (error) {
          console.error('[MCP] Error parsing message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('[MCP] WebSocket error:', error);
        setState(prev => ({ ...prev, error: new Error('WebSocket connection error') }));
      };

      wsRef.current.onclose = () => {
        console.log('[MCP] WebSocket disconnected');
        setState(prev => ({ ...prev, connected: false }));
        handleReconnect();
      };

      // Initial data fetch
      await fetchInitialData();

    } catch (error) {
      console.error('[MCP] Connection error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error
      }));
      handleReconnect();
    }
  }, [MCP_WS_URL]);

  /**
   * Disconnect from MCP server
   */
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    setState(prev => ({ ...prev, connected: false }));
  }, []);

  /**
   * Handle MCP messages
   */
  const handleMCPMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'metrics':
        if (data.team === 'cardinals') {
          const metrics = parseCardinalsMetrics(data.data);
          setState(prev => ({
            ...prev,
            metrics,
            lastUpdate: new Date()
          }));
        }
        break;

      case 'alert':
        console.log('[MCP] Alert received:', data.alert);
        // Handle alerts (injuries, lineup changes, etc.)
        break;

      case 'system':
        console.log('[MCP] System metrics:', data.metrics);
        break;

      default:
        break;
    }
  }, []);

  /**
   * Parse Cardinals metrics from MCP data
   */
  const parseCardinalsMetrics = (data: any): CardinalsMetrics => {
    return {
      teamReadiness: data.metrics?.clutchScore || 0.72,
      leverageIndex: data.metrics?.leverageIndex || 1.2,
      winProbability: data.metrics?.winProbability || 0.52,
      playerMetrics: data.players?.map((p: any) => ({
        name: p.name,
        position: p.position,
        readinessScore: p.readiness || 0.75,
        recentPerformance: p.performance || 0.8,
        fatigue: p.fatigue || 0.2,
        confidence: p.confidence || 0.85
      })) || [],
      gameContext: data.gameContext
    };
  };

  /**
   * Handle reconnection logic
   */
  const handleReconnect = useCallback(() => {
    if (reconnectCountRef.current >= reconnectAttempts) {
      console.log('[MCP] Max reconnect attempts reached');
      setState(prev => ({
        ...prev,
        error: new Error('Failed to connect after multiple attempts')
      }));
      return;
    }

    reconnectCountRef.current++;
    console.log(`[MCP] Reconnecting... (attempt ${reconnectCountRef.current}/${reconnectAttempts})`);

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, reconnectDelay);
  }, [connect, reconnectAttempts, reconnectDelay]);

  /**
   * Fetch initial data from MCP
   */
  const fetchInitialData = async () => {
    try {
      // Use the MLB connector to get Cardinals data
      const mlbConnector = sportsDataManager.getConnector('mlb');
      const cardinalsData = await (mlbConnector as any).getCardinalsAnalytics();

      const metrics: CardinalsMetrics = {
        teamReadiness: cardinalsData.analytics.momentumIndex || 0.72,
        leverageIndex: 1.2,
        winProbability: cardinalsData.team.winPercentage || 0.52,
        playerMetrics: cardinalsData.keyPlayers?.map((p: any) => ({
          name: p.name,
          position: p.position,
          readinessScore: 0.75,
          recentPerformance: p.stats.batting?.avg || 0,
          fatigue: 0.2,
          confidence: 0.85
        })) || [],
        gameContext: {
          opponent: cardinalsData.upcomingGames?.[0]?.opponent || 'TBD',
          date: cardinalsData.upcomingGames?.[0]?.date || new Date().toISOString(),
          venue: cardinalsData.upcomingGames?.[0]?.venue || 'Busch Stadium'
        }
      };

      setState(prev => ({
        ...prev,
        metrics,
        lastUpdate: new Date()
      }));

      if (enableCache) {
        state.cache.set('cardinals-metrics', metrics);
      }
    } catch (error) {
      console.error('[MCP] Error fetching initial data:', error);
      throw error;
    }
  };

  /**
   * Get team readiness metrics
   */
  const getTeamReadiness = useCallback(async (): Promise<CardinalsMetrics> => {
    if (state.metrics && state.lastUpdate) {
      const age = Date.now() - state.lastUpdate.getTime();
      if (age < 60000) { // Less than 1 minute old
        return state.metrics;
      }
    }

    setState(prev => ({ ...prev, loading: true }));

    try {
      await fetchInitialData();
      return state.metrics!;
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: error as Error }));
      throw error;
    }
  }, [state.metrics, state.lastUpdate]);

  /**
   * Get player analysis
   */
  const getPlayerAnalysis = useCallback(async (playerName: string): Promise<PlayerReadiness> => {
    const cached = state.cache.get(`player-${playerName}`);
    if (cached && enableCache) {
      return cached;
    }

    // Find player in current metrics
    const player = state.metrics?.playerMetrics.find(
      p => p.name.toLowerCase().includes(playerName.toLowerCase())
    );

    if (player) {
      if (enableCache) {
        state.cache.set(`player-${playerName}`, player);
      }
      return player;
    }

    // Fetch fresh data if not found
    await getTeamReadiness();
    
    const updatedPlayer = state.metrics?.playerMetrics.find(
      p => p.name.toLowerCase().includes(playerName.toLowerCase())
    );

    if (updatedPlayer) {
      return updatedPlayer;
    }

    throw new Error(`Player ${playerName} not found`);
  }, [state.metrics, state.cache, enableCache, getTeamReadiness]);

  /**
   * Get game prediction
   */
  const getGamePrediction = useCallback(async (opponent: string): Promise<any> => {
    const cacheKey = `prediction-${opponent}`;
    const cached = state.cache.get(cacheKey);
    
    if (cached && enableCache) {
      return cached;
    }

    // Simulate prediction calculation
    const prediction = {
      opponent,
      winProbability: state.metrics?.winProbability || 0.52,
      predictedScore: {
        cardinals: Math.floor(Math.random() * 5) + 3,
        opponent: Math.floor(Math.random() * 5) + 2
      },
      keyFactors: [
        'Home field advantage',
        'Recent momentum',
        'Pitching matchup'
      ],
      confidence: 0.946
    };

    if (enableCache) {
      state.cache.set(cacheKey, prediction);
    }

    return prediction;
  }, [state.metrics, state.cache, enableCache]);

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async () => {
    setState(prev => ({ ...prev, cache: new Map() }));
    await fetchInitialData();
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect]);

  // Periodic data refresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.connected && !state.loading) {
        fetchInitialData().catch(console.error);
      }
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [state.connected, state.loading]);

  return {
    state,
    actions: {
      connect,
      disconnect,
      getTeamReadiness,
      getPlayerAnalysis,
      getGamePrediction,
      refreshData
    }
  };
}

/**
 * Additional utility hooks
 */

// Hook for real-time game updates
export function useGameUpdates(gameId: string) {
  const [updates, setUpdates] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(process.env.VITE_MCP_WS_URL || 'ws://localhost:8787');
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'subscribe',
        game: gameId
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'game-update' && data.gameId === gameId) {
        setUpdates(prev => [...prev, data]);
      }
    };

    return () => {
      ws.close();
    };
  }, [gameId]);

  return updates;
}

// Hook for player tracking
export function usePlayerTracking(playerIds: string[]) {
  const [players, setPlayers] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    const fetchPlayerData = async () => {
      const mlbConnector = sportsDataManager.getConnector('mlb');
      
      const playerData = await Promise.all(
        playerIds.map(id => mlbConnector.getPlayerData(id))
      );

      const playerMap = new Map();
      playerData.forEach((player, index) => {
        playerMap.set(playerIds[index], player);
      });

      setPlayers(playerMap);
    };

    fetchPlayerData();

    const interval = setInterval(fetchPlayerData, 300000); // Every 5 minutes
    return () => clearInterval(interval);
  }, [playerIds]);

  return players;
}

// Export types for external use
export type {
  CardinalsMetrics,
  PlayerReadiness,
  GameContext,
  WeatherConditions,
  BlazeIntelligenceMCPState,
  UseBlazeIntelligenceMCPConfig
};