// Core Types for Blaze Intelligence OS V2

export interface Team {
  id: string;
  name: string;
  league: string;
  division: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  team: string;
  stats: PlayerStats;
  biomechanics?: BiomechanicsData;
  microExpressions?: MicroExpressionData;
}

export interface PlayerStats {
  [key: string]: number | string | undefined;
  games: number;
  average?: number;
  era?: number;
  touchdowns?: number;
  points?: number;
}

export interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: string;
  status: 'scheduled' | 'live' | 'final';
  score?: {
    home: number;
    away: number;
  };
  predictions?: GamePrediction;
}

export interface GamePrediction {
  winner: string;
  confidence: number;
  projectedScore: {
    home: number;
    away: number;
  };
  keyFactors: string[];
}

export interface SportsData {
  teams: Team[];
  players: Player[];
  games: Game[];
  lastUpdated: string;
}

export interface SystemStatus {
  api: ServiceStatus;
  database: ServiceStatus;
  analytics: ServiceStatus;
  visionAI: ServiceStatus;
  lastUpdated: string;
}

export type ServiceStatus = 'operational' | 'degraded' | 'down';

export interface AnalyticsMetrics {
  accuracy: number;
  latency: number;
  dataPoints: number;
  activeUsers: number;
  predictions: number;
}

export interface BiomechanicsData {
  posture: number;
  balance: number;
  velocity: number;
  acceleration: number;
  efficiency: number;
  injuryRisk: number;
}

export interface MicroExpressionData {
  confidence: number;
  determination: number;
  focus: number;
  stress: number;
  grit: number;
  character: number;
}

export interface VisionAIAnalysis {
  timestamp: string;
  videoUrl?: string;
  biomechanics: BiomechanicsData;
  microExpressions: MicroExpressionData;
  recommendations: string[];
  score: number;
}

export interface NILCalculation {
  athleteId: string;
  athleteName: string;
  sport: string;
  school: string;
  baseValue: number;
  performanceMultiplier: number;
  socialMediaBoost: number;
  totalValue: number;
  breakdown: {
    athletic: number;
    academic: number;
    social: number;
    market: number;
  };
}

export interface DataIngestionConfig {
  source: string;
  frequency: 'realtime' | 'minute' | 'hourly' | 'daily';
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  status: ServiceStatus;
}

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp?: string;
  id?: string;
}

export interface ErrorState {
  message: string;
  code?: string;
  details?: any;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}