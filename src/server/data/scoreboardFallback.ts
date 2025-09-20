import type { ScoreboardEvent, SportKey } from '../services/scoreboardService.js';

const createEvent = (event: ScoreboardEvent): ScoreboardEvent => event;

export const fallbackScoreboards: Record<SportKey, ScoreboardEvent[]> = {
  baseball: [
    createEvent({
      id: 'mlb-fallback-tex-hou',
      name: 'Texas Rangers at Houston Astros',
      shortName: 'TEX @ HOU',
      date: '2024-04-02T23:35:00Z',
      status: {
        state: 'pre',
        detail: 'First pitch scheduled for 6:35 PM CT',
      },
      competitors: [
        {
          id: 'texas-rangers',
          name: 'Texas Rangers',
          abbreviation: 'TEX',
          score: undefined,
          homeAway: 'away',
        },
        {
          id: 'houston-astros',
          name: 'Houston Astros',
          abbreviation: 'HOU',
          score: undefined,
          homeAway: 'home',
        },
      ],
    }),
  ],
  football: [
    createEvent({
      id: 'nfl-fallback-dal-ne',
      name: 'Dallas Cowboys vs. New England Patriots',
      shortName: 'DAL vs NE',
      date: '2024-09-08T20:25:00Z',
      status: {
        state: 'pre',
        detail: 'Kickoff scheduled for 3:25 PM CT at AT&T Stadium',
      },
      competitors: [
        {
          id: 'dallas-cowboys',
          name: 'Dallas Cowboys',
          abbreviation: 'DAL',
          score: undefined,
          homeAway: 'home',
        },
        {
          id: 'new-england-patriots',
          name: 'New England Patriots',
          abbreviation: 'NE',
          score: undefined,
          homeAway: 'away',
        },
      ],
    }),
  ],
  basketball: [
    createEvent({
      id: 'nba-fallback-bos-lal',
      name: 'Boston Celtics at Los Angeles Lakers',
      shortName: 'BOS @ LAL',
      date: '2024-12-25T01:30:00Z',
      status: {
        state: 'pre',
        detail: 'Tip-off scheduled for 7:30 PM PT at Crypto.com Arena',
      },
      competitors: [
        {
          id: 'boston-celtics',
          name: 'Boston Celtics',
          abbreviation: 'BOS',
          score: undefined,
          homeAway: 'away',
        },
        {
          id: 'los-angeles-lakers',
          name: 'Los Angeles Lakers',
          abbreviation: 'LAL',
          score: undefined,
          homeAway: 'home',
        },
      ],
    }),
  ],
  'track-field': [
    createEvent({
      id: 'tf-fallback-austin-relays',
      name: 'Austin Relays Championship Finals',
      shortName: 'Austin Relays Finals',
      date: '2024-06-15T19:00:00Z',
      status: {
        state: 'in',
        detail: 'Final heats underway at Mike A. Myers Stadium',
      },
      competitors: [
        {
          id: 'texas-longhorns',
          name: 'Texas Longhorns Track & Field',
          abbreviation: 'TEX',
          score: 86,
          homeAway: 'home',
        },
        {
          id: 'lsu-tigers',
          name: 'LSU Tigers Track & Field',
          abbreviation: 'LSU',
          score: 78,
          homeAway: 'away',
        },
      ],
    }),
  ],
};
