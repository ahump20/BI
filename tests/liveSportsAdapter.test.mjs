import test from 'node:test';
import assert from 'node:assert/strict';

import {
  mapScoreboardGame,
  normalizeScoreboardParams,
  normalizeStandings,
} from '../lib/liveSportsUtils.js';

test('normalizeScoreboardParams sanitizes date input', () => {
  const params = normalizeScoreboardParams({ date: '2025-07-04', week: '3', season: '2025', seasontype: '2', limit: '150' });
  assert.deepEqual(params, {
    dates: '20250704',
    week: '3',
    season: '2025',
    seasontype: '2',
    limit: '100',
  });
});

test('mapScoreboardGame transforms MLB event', () => {
  const event = {
    id: '401',
    uid: 's:1~l:10~e:401',
    name: 'Aces at Bats',
    shortName: 'ACE@BAT',
    date: '2025-08-12T18:05Z',
    competitions: [
      {
        id: '401-1',
        date: '2025-08-12T18:05Z',
        status: { type: { state: 'in', detail: 'Bottom 5th', shortDetail: 'Bot 5th' } },
        venue: { fullName: 'Blaze Ballpark' },
        broadcasts: [{ names: ['BI Network'] }],
        competitors: [
          {
            homeAway: 'home',
            score: '3',
            curatedRank: { current: 7 },
            records: [{ type: 'total', summary: '60-45' }],
            team: {
              id: '2',
              displayName: 'Blaze Bats',
              abbreviation: 'BAT',
              location: 'Blaze City',
              logos: [{ href: 'https://example.com/bats.png' }],
            },
            linescores: [{ value: 0 }, { value: 2 }, { value: 1 }, { value: 0 }, { value: 0 }],
          },
          {
            homeAway: 'away',
            score: '1',
            records: [{ type: 'total', summary: '55-50' }],
            team: {
              id: '1',
              displayName: 'Austin Aces',
              abbreviation: 'ACE',
              logos: [{ href: 'https://example.com/aces.png' }],
            },
          },
        ],
        situation: {
          inning: 5,
          inningHalf: 'bottom',
          balls: 2,
          strikes: 1,
          outs: 1,
          onFirst: true,
          onSecond: false,
          onThird: true,
          lastPlay: { text: 'Line drive single to left.' },
        },
      },
    ],
  };

  const game = mapScoreboardGame('mlb', event);
  assert.equal(game.id, '401');
  assert.equal(game.league, 'MLB');
  assert.equal(game.home.name, 'Blaze Bats');
  assert.equal(game.away.score, 1);
  assert.equal(game.status.shortDetail, 'Bot 5th');
  assert.ok(game.mlb);
  assert.equal(game.mlb.inning, 'Bottom 5');
  assert.equal(game.mlb.onFirst, true);
  assert.equal(game.broadcasts[0], 'BI Network');
});

test('mapScoreboardGame transforms NFL event', () => {
  const event = {
    id: '301',
    name: 'Legends vs Titans',
    shortName: 'LEG@TIT',
    date: '2025-09-15T17:00Z',
    competitions: [
      {
        id: '301-1',
        date: '2025-09-15T17:00Z',
        status: { type: { state: 'in', detail: 'Q3 08:35', shortDetail: 'Q3 8:35' } },
        competitors: [
          {
            homeAway: 'home',
            score: '14',
            records: [{ type: 'total', summary: '1-0' }],
            team: { id: '33', displayName: 'Nashville Titans', abbreviation: 'TIT' },
          },
          {
            homeAway: 'away',
            score: '10',
            records: [{ type: 'total', summary: '0-1' }],
            team: { id: '44', displayName: 'Legends FC', abbreviation: 'LEG' },
          },
        ],
        situation: {
          clock: '08:35',
          possession: '33',
          shortDownDistanceText: '3rd & 2',
          lastPlay: { text: 'Run up the middle for 3 yards' },
        },
      },
    ],
  };

  const game = mapScoreboardGame('nfl', event);
  assert.equal(game.nfl.clock, '08:35');
  assert.equal(game.nfl.downDistanceText, '3rd & 2');
  assert.equal(game.home.record, '1-0');
  assert.equal(game.away.name, 'Legends FC');
  assert.equal(game.status.state, 'in');
});

test('normalizeStandings flattens ESPN payload', () => {
  const payload = {
    season: { year: 2025 },
    children: [
      {
        id: '1',
        name: 'American League',
        abbreviation: 'AL',
        standings: {
          entries: [
            {
              team: { id: '2', displayName: 'Blaze Bats', abbreviation: 'BAT' },
              stats: [
                { name: 'gamesPlayed', value: 162 },
                { name: 'wins', value: 100 },
                { name: 'losses', value: 62 },
                { name: 'winPercent', value: 0.617 },
                { name: 'streak', displayValue: 'W2' },
                { name: 'pointsFor', value: 820 },
                { name: 'pointsAgainst', value: 650 },
              ],
            },
          ],
        },
      },
    ],
  };

  const standings = normalizeStandings('mlb', payload);
  assert.equal(standings.league, 'MLB');
  assert.equal(standings.season, 2025);
  assert.equal(standings.groups.length, 1);
  assert.equal(standings.groups[0].teams[0].stats.wins, 100);
  assert.equal(standings.groups[0].teams[0].stats.pointsAgainst, 650);
});
