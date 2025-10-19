/**
 * Canonical schemas for blazesportsintel.com
 * Deep South sports authority data structures
 */

import { z } from 'zod';

// Base schemas
export const LeagueSchema = z.object({
  id: z.string(),
  name: z.string(),
  abbreviation: z.string(),
  sport: z.enum(['football', 'baseball', 'basketball']),
  level: z.enum(['high-school', 'college', 'professional', 'youth']),
  region: z.string().optional(),
  website: z.string().url().optional(),
  externalRefs: z.record(z.string()).optional()
});

export const SeasonSchema = z.object({
  id: z.string(),
  leagueId: z.string(),
  year: z.number().int().min(2000).max(2030),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isActive: z.boolean(),
  phase: z.enum(['preseason', 'regular', 'postseason', 'offseason'])
});

export const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string().optional(),
  city: z.string(),
  state: z.string(),
  leagueId: z.string(),
  conference: z.string().optional(),
  division: z.string().optional(),
  colors: z.object({
    primary: z.string(),
    secondary: z.string().optional()
  }).optional(),
  venue: z.object({
    name: z.string(),
    capacity: z.number().optional(),
    location: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional()
  }).optional(),
  website: z.string().url().optional(),
  externalRefs: z.record(z.string()).optional()
});

export const PlayerSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  position: z.string(),
  number: z.number().int().optional(),
  teamId: z.string(),
  height: z.number().optional(), // inches
  weight: z.number().optional(), // pounds
  birthDate: z.string().date().optional(),
  graduationYear: z.number().int().optional(),
  hometown: z.object({
    city: z.string(),
    state: z.string()
  }).optional(),
  highSchool: z.string().optional(),
  rating: z.number().min(0).max(100).optional(),
  externalRefs: z.record(z.string()).optional()
});

export const StaffSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.string(), // 'head-coach', 'assistant-coach', 'coordinator', etc.
  teamId: z.string(),
  yearStarted: z.number().int().optional(),
  externalRefs: z.record(z.string()).optional()
});

export const GameSchema = z.object({
  id: z.string(),
  seasonId: z.string(),
  week: z.number().int().optional(),
  date: z.string().datetime(),
  homeTeamId: z.string(),
  awayTeamId: z.string(),
  homeScore: z.number().int().optional(),
  awayScore: z.number().int().optional(),
  status: z.enum(['scheduled', 'in-progress', 'final', 'postponed', 'canceled']),
  venue: z.string().optional(),
  attendance: z.number().int().optional(),
  weather: z.object({
    temperature: z.number().optional(),
    conditions: z.string().optional(),
    windSpeed: z.number().optional()
  }).optional(),
  externalRefs: z.record(z.string()).optional()
});

export const StatLineSchema = z.object({
  id: z.string(),
  gameId: z.string(),
  playerId: z.string(),
  teamId: z.string(),
  stats: z.record(z.union([z.number(), z.string()])), // flexible stats object
  createdAt: z.string().datetime(),
  externalRefs: z.record(z.string()).optional()
});

export const StandingRowSchema = z.object({
  id: z.string(),
  seasonId: z.string(),
  teamId: z.string(),
  wins: z.number().int().min(0),
  losses: z.number().int().min(0),
  ties: z.number().int().min(0).optional(),
  winPercentage: z.number().min(0).max(1),
  conferenceWins: z.number().int().min(0).optional(),
  conferenceLosses: z.number().int().min(0).optional(),
  divisionWins: z.number().int().min(0).optional(),
  divisionLosses: z.number().int().min(0).optional(),
  streak: z.object({
    type: z.enum(['W', 'L']),
    count: z.number().int().min(0)
  }).optional(),
  lastUpdated: z.string().datetime()
});

// Sport-specific schemas

// Texas High School Football
export const UILClassificationSchema = z.object({
  classification: z.enum(['6A', '5A', '4A', '3A', '2A', '1A']),
  division: z.enum(['I', 'II']).optional(),
  region: z.number().int().min(1).max(4),
  district: z.number().int().min(1)
});

export const TexasHSFootballTeamSchema = TeamSchema.extend({
  uilClassification: UILClassificationSchema,
  mascot: z.string(),
  enrollment: z.number().int().optional(),
  coordinators: z.object({
    headCoach: z.string(),
    offensiveCoordinator: z.string().optional(),
    defensiveCoordinator: z.string().optional()
  }).optional()
});

// Perfect Game Baseball
export const PerfectGameTournamentSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.object({
    city: z.string(),
    state: z.string(),
    facility: z.string()
  }),
  startDate: z.string().date(),
  endDate: z.string().date(),
  ageGroup: z.string(), // '14U', '16U', '18U', etc.
  level: z.enum(['showcase', 'tournament', 'league']),
  teamCount: z.number().int().optional(),
  website: z.string().url().optional()
});

export const PerfectGamePlayerSchema = PlayerSchema.extend({
  graduationYear: z.number().int().min(2024).max(2030),
  commitmentStatus: z.enum(['uncommitted', 'committed', 'signed']).optional(),
  committedSchool: z.string().optional(),
  pgRating: z.number().min(1).max(10).optional(),
  primaryPosition: z.string(),
  secondaryPosition: z.string().optional(),
  battingHand: z.enum(['L', 'R', 'S']).optional(),
  throwingHand: z.enum(['L', 'R']).optional(),
  velocity: z.object({
    fastball: z.number().optional(), // mph
    exit: z.number().optional(), // mph
    pop: z.number().optional() // catcher pop time
  }).optional()
});

// NCAA Football/Baseball
export const NCAADivisionSchema = z.enum(['FBS', 'FCS', 'D2', 'D3', 'NAIA', 'JUCO']);

export const NCAATeamSchema = TeamSchema.extend({
  division: NCAADivisionSchema,
  conference: z.string(),
  mascot: z.string(),
  recruitingClass: z.object({
    year: z.number().int(),
    ranking: z.number().int().optional(),
    commits: z.number().int().optional()
  }).optional()
});

// NFL/MLB Professional schemas
export const NFLTeamSchema = TeamSchema.extend({
  conference: z.enum(['AFC', 'NFC']),
  division: z.enum(['North', 'South', 'East', 'West']),
  established: z.number().int().optional(),
  championships: z.number().int().optional()
});

export const MLBTeamSchema = TeamSchema.extend({
  league: z.enum(['AL', 'NL']),
  division: z.enum(['East', 'Central', 'West']),
  established: z.number().int().optional(),
  worldSeries: z.number().int().optional()
});

// Link-out entities
export const LinkoutSchema = z.object({
  id: z.string(),
  entityType: z.enum(['team', 'player', 'game', 'tournament']),
  entityId: z.string(),
  source: z.string(), // 'baseball-reference', 'sports-reference', etc.
  url: z.string().url(),
  verified: z.boolean().default(false),
  lastChecked: z.string().datetime(),
  isActive: z.boolean().default(true)
});

// Export all schemas
export const Schemas = {
  League: LeagueSchema,
  Season: SeasonSchema,
  Team: TeamSchema,
  Player: PlayerSchema,
  Staff: StaffSchema,
  Game: GameSchema,
  StatLine: StatLineSchema,
  StandingRow: StandingRowSchema,
  UILClassification: UILClassificationSchema,
  TexasHSFootballTeam: TexasHSFootballTeamSchema,
  PerfectGameTournament: PerfectGameTournamentSchema,
  PerfectGamePlayer: PerfectGamePlayerSchema,
  NCAATeam: NCAATeamSchema,
  NFLTeam: NFLTeamSchema,
  MLBTeam: MLBTeamSchema,
  Linkout: LinkoutSchema
};

// Type exports for TypeScript
export type League = z.infer<typeof LeagueSchema>;
export type Season = z.infer<typeof SeasonSchema>;
export type Team = z.infer<typeof TeamSchema>;
export type Player = z.infer<typeof PlayerSchema>;
export type Staff = z.infer<typeof StaffSchema>;
export type Game = z.infer<typeof GameSchema>;
export type StatLine = z.infer<typeof StatLineSchema>;
export type StandingRow = z.infer<typeof StandingRowSchema>;
export type TexasHSFootballTeam = z.infer<typeof TexasHSFootballTeamSchema>;
export type PerfectGameTournament = z.infer<typeof PerfectGameTournamentSchema>;
export type PerfectGamePlayer = z.infer<typeof PerfectGamePlayerSchema>;
export type NCAATeam = z.infer<typeof NCAATeamSchema>;
export type NFLTeam = z.infer<typeof NFLTeamSchema>;
export type MLBTeam = z.infer<typeof MLBTeamSchema>;
export type Linkout = z.infer<typeof LinkoutSchema>;

export default Schemas;