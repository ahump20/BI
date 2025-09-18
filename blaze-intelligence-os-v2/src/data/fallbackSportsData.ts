import { AnalyticsMetrics, SportsData, SystemStatus } from '../types';

const timestamp = () => new Date().toISOString();

export const FALLBACK_SPORTS_DATA: SportsData = {
  teams: [
    {
      id: 'mlb-stl',
      name: 'St. Louis Cardinals',
      league: 'MLB',
      division: 'NL Central',
      primaryColor: '#C41E3A',
      secondaryColor: '#0A2253'
    },
    {
      id: 'nfl-ten',
      name: 'Tennessee Titans',
      league: 'NFL',
      division: 'AFC South',
      primaryColor: '#4B92DB',
      secondaryColor: '#0C2340'
    },
    {
      id: 'nba-mem',
      name: 'Memphis Grizzlies',
      league: 'NBA',
      division: 'Western Southwest',
      primaryColor: '#5D76A9',
      secondaryColor: '#12173F'
    },
    {
      id: 'ncaa-tex',
      name: 'Texas Longhorns',
      league: 'NCAA',
      division: 'Big 12',
      primaryColor: '#BF5700',
      secondaryColor: '#333F48'
    }
  ],
  players: [
    {
      id: 'stl-goldschmidt',
      name: 'Paul Goldschmidt',
      number: 46,
      position: '1B',
      team: 'St. Louis Cardinals',
      stats: {
        games: 158,
        average: 0.274,
        ops: 0.845,
        homeRuns: 28,
        rbi: 92
      }
    },
    {
      id: 'ten-henry',
      name: 'Derrick Henry',
      number: 22,
      position: 'RB',
      team: 'Tennessee Titans',
      stats: {
        games: 17,
        rushingYards: 1285,
        touchdowns: 14,
        yardsPerCarry: 4.5
      }
    },
    {
      id: 'mem-morant',
      name: 'Ja Morant',
      number: 12,
      position: 'PG',
      team: 'Memphis Grizzlies',
      stats: {
        games: 68,
        points: 27.6,
        assists: 8.3,
        rebounds: 5.9
      }
    },
    {
      id: 'tex-ewers',
      name: 'Quinn Ewers',
      number: 3,
      position: 'QB',
      team: 'Texas Longhorns',
      stats: {
        games: 13,
        completionPercentage: 66.2,
        touchdowns: 28,
        interceptions: 6
      }
    }
  ],
  games: [
    {
      id: 'mlb-stl-vs-chc',
      homeTeam: 'St. Louis Cardinals',
      awayTeam: 'Chicago Cubs',
      date: '2025-03-28',
      time: '19:15',
      venue: 'Busch Stadium',
      status: 'scheduled',
      predictions: {
        winner: 'St. Louis Cardinals',
        confidence: 72,
        projectedScore: { home: 5, away: 3 },
        keyFactors: ['Pitching matchup', 'Home field advantage']
      }
    },
    {
      id: 'nfl-ten-vs-hou',
      homeTeam: 'Tennessee Titans',
      awayTeam: 'Houston Texans',
      date: '2025-09-21',
      time: '13:00',
      venue: 'Nissan Stadium',
      status: 'scheduled',
      predictions: {
        winner: 'Tennessee Titans',
        confidence: 64,
        projectedScore: { home: 24, away: 20 },
        keyFactors: ['Division game', 'Run game efficiency']
      }
    }
  ],
  lastUpdated: timestamp()
};

export const FALLBACK_SYSTEM_STATUS: SystemStatus = {
  api: 'operational',
  database: 'operational',
  analytics: 'operational',
  visionAI: 'operational',
  lastUpdated: timestamp()
};

export const FALLBACK_ANALYTICS: AnalyticsMetrics = {
  accuracy: 94.6,
  latency: 87,
  dataPoints: 2800000,
  activeUsers: 1247,
  predictions: 3421
};
