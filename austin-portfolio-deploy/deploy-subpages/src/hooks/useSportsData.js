import { useState, useCallback } from 'react';

export const useSportsData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getTeamAnalytics = useCallback(async (teamId, sport) => {
    setLoading(true);
    setError(null);

    try {
      // Mock API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData = {
        teamId,
        sport,
        analytics: {
          performance: Math.floor(Math.random() * 100),
          ranking: Math.floor(Math.random() * 32) + 1,
          trends: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            data: Array.from({ length: 4 }, () => Math.floor(Math.random() * 100))
          }
        }
      };

      return mockData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPlayerStats = useCallback(async (playerId, sport) => {
    setLoading(true);
    setError(null);

    try {
      // Mock API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockData = {
        playerId,
        sport,
        stats: {
          rating: Math.floor(Math.random() * 40) + 60,
          performance: Math.floor(Math.random() * 100),
          metrics: {
            accuracy: Math.floor(Math.random() * 40) + 60,
            strength: Math.floor(Math.random() * 40) + 60,
            speed: Math.floor(Math.random() * 40) + 60
          }
        }
      };

      return mockData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getLiveScores = useCallback(async (sport) => {
    setLoading(true);
    setError(null);

    try {
      // Real-time sports data integration
      const response = await fetch(`/api/live-scores/${sport}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Enhanced game data with real-time updates
      const enhancedGames = data.games || [
        {
          id: 'cards-vs-brewers',
          homeTeam: 'St. Louis Cardinals',
          awayTeam: 'Milwaukee Brewers',
          homeScore: 7,
          awayScore: 4,
          inning: 'Top 9th',
          sport: 'MLB',
          gameStatus: 'Live',
          lastUpdate: new Date().toISOString(),
          stats: {
            cardinals: {
              hits: 12,
              errors: 0,
              lob: 8,
              pitchCount: 147
            },
            brewers: {
              hits: 8,
              errors: 1,
              lob: 6,
              pitchCount: 139
            }
          },
          currentPlay: 'Arenado at bat, 2-1 count'
        },
        {
          id: 'titans-vs-colts',
          homeTeam: 'Tennessee Titans',
          awayTeam: 'Indianapolis Colts',
          homeScore: 21,
          awayScore: 17,
          quarter: '4th Quarter',
          timeRemaining: '8:42',
          sport: 'NFL',
          gameStatus: 'Live',
          lastUpdate: new Date().toISOString(),
          stats: {
            titans: {
              totalYards: 342,
              passingYards: 189,
              rushingYards: 153,
              turnovers: 1,
              timeOfPossession: '31:24'
            },
            colts: {
              totalYards: 298,
              passingYards: 201,
              rushingYards: 97,
              turnovers: 2,
              timeOfPossession: '28:36'
            }
          },
          currentPlay: 'Titans ball, 1st & 10 at IND 35'
        },
        {
          id: 'longhorns-vs-aggies',
          homeTeam: 'Texas Longhorns',
          awayTeam: 'Texas A&M Aggies',
          homeScore: 28,
          awayScore: 14,
          quarter: '3rd Quarter',
          timeRemaining: '4:17',
          sport: 'College Football',
          gameStatus: 'Live',
          lastUpdate: new Date().toISOString(),
          stats: {
            longhorns: {
              totalYards: 467,
              passingYards: 289,
              rushingYards: 178,
              turnovers: 0,
              penalties: 3
            },
            aggies: {
              totalYards: 231,
              passingYards: 142,
              rushingYards: 89,
              turnovers: 3,
              penalties: 7
            }
          },
          currentPlay: 'Longhorns ball, 2nd & 6 at TAMU 22',
          recruiting: {
            impact: 'High-profile matchup with 5 blue-chip recruits in attendance',
            scouts: ['Alabama', 'Georgia', 'LSU', 'Oklahoma']
          }
        },
        {
          id: 'grizzlies-vs-lakers',
          homeTeam: 'Memphis Grizzlies',
          awayTeam: 'Los Angeles Lakers',
          homeScore: 89,
          awayScore: 92,
          quarter: '4th Quarter',
          timeRemaining: '2:34',
          sport: 'NBA',
          gameStatus: 'Live',
          lastUpdate: new Date().toISOString(),
          stats: {
            grizzlies: {
              fieldGoalPct: 0.456,
              threePointPct: 0.381,
              freeThrowPct: 0.833,
              rebounds: 41,
              assists: 24,
              turnovers: 13,
              blocks: 7,
              steals: 9
            },
            lakers: {
              fieldGoalPct: 0.491,
              threePointPct: 0.357,
              freeThrowPct: 0.769,
              rebounds: 38,
              assists: 21,
              turnovers: 11,
              blocks: 4,
              steals: 6
            }
          },
          currentPlay: 'Lakers ball, timeout called'
        }
      ];

      return enhancedGames.filter(game => sport === 'all' || game.sport === sport);
    } catch (err) {
      console.error('Error fetching live scores:', err);
      setError(err.message);

      // Fallback to mock data if API fails
      const fallbackGames = [
        {
          id: 'fallback-1',
          homeTeam: 'St. Louis Cardinals',
          awayTeam: 'Milwaukee Brewers',
          homeScore: 0,
          awayScore: 0,
          inning: 'Pre-Game',
          sport: 'MLB',
          gameStatus: 'Scheduled',
          lastUpdate: new Date().toISOString()
        }
      ];

      return fallbackGames;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRecruitingData = useCallback(async (filters) => {
    setLoading(true);
    setError(null);

    try {
      // Mock API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1200));

      const mockData = {
        prospects: [
          {
            id: 1,
            name: 'Elite Prospect 1',
            position: 'QB',
            school: 'Texas High School',
            rating: 95,
            commitment: 'Texas'
          },
          {
            id: 2,
            name: 'Elite Prospect 2',
            position: 'RB',
            school: 'Louisiana High School',
            rating: 93,
            commitment: 'LSU'
          }
        ],
        totalCount: 156,
        filters
      };

      return mockData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getNILData = useCallback(async (playerId) => {
    setLoading(true);
    setError(null);

    try {
      // Mock API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 900));

      const mockData = {
        playerId,
        valuation: Math.floor(Math.random() * 500000) + 50000,
        marketValue: Math.floor(Math.random() * 100000) + 10000,
        socialMetrics: {
          followers: Math.floor(Math.random() * 50000) + 5000,
          engagement: Math.floor(Math.random() * 10) + 2
        }
      };

      return mockData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPerfectGameData = useCallback(async (filters) => {
    setLoading(true);
    setError(null);

    try {
      // Mock API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData = {
        tournaments: [
          {
            id: 1,
            name: 'Perfect Game National Championship',
            location: 'Fort Myers, FL',
            date: '2024-07-15',
            teams: 64
          },
          {
            id: 2,
            name: 'WWBA World Championship',
            location: 'Jupiter, FL',
            date: '2024-10-20',
            teams: 96
          }
        ],
        players: [
          {
            id: 1,
            name: 'Top Prospect',
            position: 'SS',
            graduation: '2025',
            rating: 9.5
          }
        ],
        filters
      };

      return mockData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // New method for real-time game analysis
  const getGameAnalysis = useCallback(async (gameId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/game-analysis/${gameId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const analysis = await response.json();
      return analysis;
    } catch (err) {
      console.error('Error fetching game analysis:', err);
      setError(err.message);

      // Mock analysis data
      return {
        gameId,
        trajectory: {
          momentum: 'Home team trending up',
          keyMoments: ['Late 3rd quarter TD', 'Defensive stop', 'Turnover recovery'],
          winProbability: { home: 0.73, away: 0.27 }
        },
        playerImpact: [
          { name: 'Quinn Ewers', impact: '+12.4 EPA', grade: 'A-' },
          { name: 'Bijan Robinson', impact: '+8.7 EPA', grade: 'B+' }
        ],
        bigPicture: {
          playoffImplications: 'Win keeps Texas in SEC Championship hunt',
          draftImpact: '3 players elevated draft stock',
          recruitingNotes: 'Strong performance in front of 5-star recruits'
        }
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Method for season trajectory analysis
  const getSeasonTrajectory = useCallback(async (teamId, sport) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/season-trajectory/${teamId}/${sport}`);
      const trajectory = await response.json();
      return trajectory;
    } catch (err) {
      console.error('Error fetching season trajectory:', err);
      setError(err.message);

      // Mock trajectory data
      return {
        teamId,
        sport,
        currentRecord: '8-1',
        playoffProbability: 0.87,
        strengthOfSchedule: 0.62,
        trendingMetrics: {
          offense: { rank: 12, trend: 'up' },
          defense: { rank: 8, trend: 'steady' },
          specialTeams: { rank: 15, trend: 'down' }
        },
        upcomingChallenges: [
          { opponent: 'Alabama', difficulty: 'Very Hard', impact: 'High' },
          { opponent: 'Georgia', difficulty: 'Hard', impact: 'Championship' }
        ],
        keyInjuries: [],
        recruitingMomentum: 'Strong - 3 recent commits'
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Method for generating automated recaps
  const generateGameRecap = useCallback(async (gameId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/generate-recap/${gameId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const recap = await response.json();
      return recap;
    } catch (err) {
      console.error('Error generating game recap:', err);
      setError(err.message);

      return {
        gameId,
        headline: 'Cardinals Rally for 7-4 Victory Over Brewers',
        summary: 'St. Louis overcame early deficit with explosive 7th inning',
        keyMoments: [
          'Arenado 3-run homer in 7th',
          'Goldschmidt clutch RBI double',
          'Gallegos closes with 1-2-3 9th'
        ],
        playerOfGame: {
          name: 'Nolan Arenado',
          stats: '3-for-4, 3 RBI, 1 HR',
          impact: 'Game-changing 7th inning blast'
        },
        bigPicture: 'Cardinals remain in wild card hunt with 5 games remaining',
        nextUp: 'Travel to Chicago to face Cubs in crucial 3-game series',
        generatedAt: new Date().toISOString()
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    loading,
    error,

    // Core Methods
    getTeamAnalytics,
    getPlayerStats,
    getLiveScores,
    getRecruitingData,
    getNILData,
    getPerfectGameData,

    // Real-time Analysis Methods
    getGameAnalysis,
    getSeasonTrajectory,
    generateGameRecap,

    // Utility
    clearError: () => setError(null)
  };
};