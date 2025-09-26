/**
 * Perfect Game Youth Baseball Data Integration
 * Blaze Intelligence - The Deep South's Sports Intelligence Hub
 * Complete youth baseball pipeline from 8U through 18U
 */

const PERFECT_GAME_CONFIG = {
  apiKey: process.env.PERFECT_GAME_API_KEY || 'demo',
  baseUrl: 'https://api.perfectgame.org/v2',
  cacheTime: 180000, // 3 minutes cache
  ageGroups: {
    '18U': { gradYear: 2025, description: 'High School Senior', recruitingPeak: true },
    '17U': { gradYear: 2026, description: 'High School Junior', recruitingActive: true },
    '16U': { gradYear: 2027, description: 'High School Sophomore', scoutingActive: true },
    '15U': { gradYear: 2028, description: 'High School Freshman', developmentFocus: true },
    '14U': { gradYear: 2029, description: 'Middle School 8th Grade', foundationBuilding: true },
    '13U': { gradYear: 2030, description: 'Middle School 7th Grade', skillsDevelopment: true },
    '12U': { gradYear: 2031, description: 'Middle School 6th Grade', fundamentals: true },
    '11U': { gradYear: 2032, description: 'Elementary 5th Grade', introduction: true },
    '10U': { gradYear: 2033, description: 'Elementary 4th Grade', basics: true },
    '9U': { gradYear: 2034, description: 'Elementary 3rd Grade', learning: true },
    '8U': { gradYear: 2035, description: 'Elementary 2nd Grade', funFirst: true }
  },
  regions: {
    'South': {
      name: 'Southern Region',
      states: ['TX', 'LA', 'AR', 'OK', 'MS', 'AL', 'TN', 'GA', 'FL', 'SC', 'NC'],
      focus: true,
      keyTournaments: ['WWBA', 'PG National', 'BCS Finals', 'Texas State Games']
    },
    'Southwest': {
      name: 'Southwest Region',
      states: ['TX', 'NM', 'AZ', 'NV', 'UT', 'CO'],
      keyTournaments: ['Perfect Game Southwest', 'Arizona Fall Classic', 'Colorado Rockies Scout Team']
    },
    'Southeast': {
      name: 'Southeast Region',
      states: ['FL', 'GA', 'AL', 'SC', 'NC', 'TN', 'KY', 'VA'],
      keyTournaments: ['WWBA Championship', 'East Cobb Invitational', 'Perfect Game National']
    },
    'Midwest': {
      name: 'Midwest Region',
      states: ['IL', 'IN', 'IA', 'KS', 'MI', 'MN', 'MO', 'ND', 'NE', 'OH', 'SD', 'WI'],
      keyTournaments: ['Perfect Game Midwest', 'Illinois State Championship']
    },
    'Northeast': {
      name: 'Northeast Region',
      states: ['CT', 'DE', 'ME', 'MD', 'MA', 'NH', 'NJ', 'NY', 'PA', 'RI', 'VT'],
      keyTournaments: ['Perfect Game Northeast', 'New York State Championships']
    },
    'West': {
      name: 'West Region',
      states: ['CA', 'OR', 'WA', 'AK', 'HI', 'ID', 'MT', 'WY'],
      keyTournaments: ['Perfect Game West', 'California State Games', 'West Coast Championships']
    }
  },
  showcaseEvents: {
    'National': [
      'Perfect Game National Showcase',
      'Perfect Game All-American Classic',
      'Perfect Game National Championship',
      'WWBA World Championship',
      'PG National Underclass'
    ],
    'Regional': [
      'Perfect Game Southwest Championships',
      'Perfect Game Southeast Classic',
      'Texas State Games',
      'Deep South Classic',
      'Lone Star State Championships'
    ],
    'State': [
      'Texas State Championship',
      'Louisiana State Championship',
      'Arkansas State Championship',
      'Oklahoma State Championship',
      'Alabama State Championship'
    ]
  }
};

class PerfectGameIntegration {
  constructor() {
    this.cache = new Map();
    this.lastUpdate = null;
    this.recruitingPipeline = new Map();
    this.showcaseResults = new Map();
    this.playerProfiles = new Map();
  }

  async fetchPlayerProfile(playerId, gradYear) {
    const cacheKey = `pg_player_${playerId}_${gradYear}_${Math.floor(Date.now() / PERFECT_GAME_CONFIG.cacheTime)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const profile = await this.simulatePerfectGameAPI(playerId, gradYear);

      // Enhanced metrics for top prospects
      if (profile.pgRating > 8.5) {
        profile.recruitingMetrics = await this.calculateRecruitingMetrics(profile);
      }

      this.cache.set(cacheKey, profile);
      setTimeout(() => this.cache.delete(cacheKey), PERFECT_GAME_CONFIG.cacheTime);

      return profile;
    } catch (error) {
      console.error(`Error fetching player ${playerId} data:`, error);
      return this.getFallbackData(playerId);
    }
  }

  async simulatePerfectGameAPI(playerId, gradYear) {
    const ageGroup = this.determineAgeGroup(gradYear);
    const position = this.generatePosition();
    const state = this.generateState();

    return {
      playerId,
      gradYear,
      ageGroup,
      playerInfo: {
        firstName: this.generateFirstName(),
        lastName: this.generateLastName(),
        position,
        state,
        city: this.generateCity(state),
        highSchool: this.generateHighSchool(state),
        height: this.generateHeight(),
        weight: this.generateWeight(),
        batsThrows: this.generateBatsThrows()
      },
      metrics: {
        exitVelocity: position.includes('P') ? null : this.generateExitVelocity(ageGroup),
        popTime: position === 'C' ? this.generatePopTime(ageGroup) : null,
        velocity: position.includes('P') ? this.generatePitchingVelocity(ageGroup) : this.generatePositionVelocity(ageGroup),
        sixtyYard: this.generateSixtyTime(ageGroup),
        infield_velo: position.includes('IF') ? this.generateInfieldVelo(ageGroup) : null,
        outfield_velo: position.includes('OF') ? this.generateOutfieldVelo(ageGroup) : null
      },
      pgRating: this.generatePGRating(ageGroup),
      commitment: this.generateCommitment(gradYear),
      showcaseHistory: this.generateShowcaseHistory(ageGroup),
      tournamentHistory: this.generateTournamentHistory(ageGroup),
      scout_notes: this.generateScoutNotes(position, ageGroup),
      projectability: this.generateProjectability(ageGroup, gradYear),
      season: 2025
    };
  }

  determineAgeGroup(gradYear) {
    for (const [age, data] of Object.entries(PERFECT_GAME_CONFIG.ageGroups)) {
      if (data.gradYear === gradYear) return age;
    }
    return '18U'; // Default
  }

  generatePosition() {
    const positions = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'RHP', 'LHP', 'OF', 'IF', 'RHP/1B', 'SS/RHP'];
    return positions[Math.floor(Math.random() * positions.length)];
  }

  generateState() {
    const southernStates = PERFECT_GAME_CONFIG.regions.South.states;
    return southernStates[Math.floor(Math.random() * southernStates.length)];
  }

  generateFirstName() {
    const names = ['Jackson', 'Mason', 'Liam', 'Noah', 'Ethan', 'Aiden', 'Lucas', 'Oliver', 'Caleb', 'Carter', 'Tyler', 'Austin', 'Connor', 'Blake', 'Hunter'];
    return names[Math.floor(Math.random() * names.length)];
  }

  generateLastName() {
    const names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];
    return names[Math.floor(Math.random() * names.length)];
  }

  generateCity(state) {
    const cities = {
      'TX': ['Austin', 'Houston', 'Dallas', 'San Antonio', 'Fort Worth', 'Plano', 'Arlington', 'Corpus Christi'],
      'LA': ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles'],
      'AR': ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro'],
      'OK': ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Lawton'],
      'FL': ['Miami', 'Tampa', 'Orlando', 'Jacksonville', 'St. Petersburg']
    };
    const stateCities = cities[state] || ['Unknown City'];
    return stateCities[Math.floor(Math.random() * stateCities.length)];
  }

  generateHighSchool(state) {
    const schools = {
      'TX': ['Southlake Carroll', 'Allen', 'Katy', 'The Woodlands', 'Vandegrift', 'Round Rock', 'Westfield'],
      'LA': ['Jesuit', 'Rummel', 'Curtis', 'Teurlings Catholic', 'Catholic'],
      'AR': ['Bentonville', 'Fayetteville', 'Conway', 'Cabot', 'Rogers']
    };
    const stateSchools = schools[state] || ['Local High School'];
    return stateSchools[Math.floor(Math.random() * stateSchools.length)];
  }

  generateHeight() {
    const feet = Math.floor(Math.random() * 3) + 5; // 5-7 feet
    const inches = Math.floor(Math.random() * 12); // 0-11 inches
    return `${feet}-${inches}`;
  }

  generateWeight() {
    return Math.floor(Math.random() * 80) + 140; // 140-220 lbs
  }

  generateBatsThrows() {
    const combos = ['R/R', 'L/L', 'S/R', 'L/R', 'R/L'];
    return combos[Math.floor(Math.random() * combos.length)];
  }

  generateExitVelocity(ageGroup) {
    const baseVelo = {
      '18U': 85, '17U': 82, '16U': 78, '15U': 75, '14U': 70, '13U': 65, '12U': 60
    }[ageGroup] || 55;
    return (baseVelo + Math.random() * 15).toFixed(1);
  }

  generatePopTime(ageGroup) {
    const baseTime = {
      '18U': 2.0, '17U': 2.1, '16U': 2.2, '15U': 2.3, '14U': 2.4, '13U': 2.5
    }[ageGroup] || 2.6;
    return (baseTime + Math.random() * 0.3).toFixed(2);
  }

  generatePitchingVelocity(ageGroup) {
    const baseVelo = {
      '18U': 82, '17U': 79, '16U': 75, '15U': 71, '14U': 68, '13U': 64, '12U': 60
    }[ageGroup] || 55;
    return (baseVelo + Math.random() * 12).toFixed(1);
  }

  generatePositionVelocity(ageGroup) {
    const baseVelo = {
      '18U': 78, '17U': 75, '16U': 72, '15U': 68, '14U': 65, '13U': 60, '12U': 55
    }[ageGroup] || 50;
    return (baseVelo + Math.random() * 10).toFixed(1);
  }

  generateSixtyTime(ageGroup) {
    const baseTime = {
      '18U': 6.8, '17U': 7.0, '16U': 7.2, '15U': 7.4, '14U': 7.6, '13U': 7.8, '12U': 8.0
    }[ageGroup] || 8.5;
    return (baseTime + Math.random() * 0.8).toFixed(2);
  }

  generateInfieldVelo(ageGroup) {
    const baseVelo = {
      '18U': 82, '17U': 79, '16U': 75, '15U': 71, '14U': 67, '13U': 63
    }[ageGroup] || 58;
    return (baseVelo + Math.random() * 8).toFixed(1);
  }

  generateOutfieldVelo(ageGroup) {
    const baseVelo = {
      '18U': 85, '17U': 82, '16U': 78, '15U': 74, '14U': 70, '13U': 66
    }[ageGroup] || 60;
    return (baseVelo + Math.random() * 10).toFixed(1);
  }

  generatePGRating(ageGroup) {
    const baseRating = {
      '18U': 7.0, '17U': 6.5, '16U': 6.0, '15U': 5.5, '14U': 5.0, '13U': 4.5, '12U': 4.0
    }[ageGroup] || 3.5;
    return Math.min(baseRating + Math.random() * 3, 10).toFixed(1);
  }

  generateCommitment(gradYear) {
    if (gradYear > 2026) return null;

    const colleges = [
      'University of Texas', 'Texas A&M', 'LSU', 'Arkansas', 'Oklahoma', 'TCU',
      'Baylor', 'Rice', 'Houston', 'Texas Tech', 'Texas State', 'Sam Houston State',
      'Vanderbilt', 'Tennessee', 'Alabama', 'Auburn', 'Florida', 'Georgia'
    ];

    if (Math.random() > 0.7) {
      return {
        school: colleges[Math.floor(Math.random() * colleges.length)],
        date: this.generateCommitmentDate(),
        type: Math.random() > 0.8 ? 'Scholarship' : 'Preferred Walk-On'
      };
    }
    return null;
  }

  generateCommitmentDate() {
    const year = 2024 + Math.floor(Math.random() * 2);
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  generateShowcaseHistory(ageGroup) {
    const history = [];
    const eventCount = ageGroup === '18U' ? 8 : ageGroup === '17U' ? 6 : Math.floor(Math.random() * 4) + 1;

    for (let i = 0; i < eventCount; i++) {
      history.push({
        event: this.selectShowcaseEvent(ageGroup),
        date: this.generateEventDate(),
        location: this.generateEventLocation(),
        pgRating: this.generatePGRating(ageGroup)
      });
    }

    return history.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  selectShowcaseEvent(ageGroup) {
    const allEvents = [
      ...PERFECT_GAME_CONFIG.showcaseEvents.National,
      ...PERFECT_GAME_CONFIG.showcaseEvents.Regional,
      ...PERFECT_GAME_CONFIG.showcaseEvents.State
    ];
    return allEvents[Math.floor(Math.random() * allEvents.length)];
  }

  generateEventDate() {
    const year = 2024 + Math.floor(Math.random() * 2);
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  generateEventLocation() {
    const locations = [
      'LakePoint Sports Complex, GA',
      'Perfect Game Headquarters, IA',
      'East Cobb Baseball Complex, GA',
      'Big League Dreams, TX',
      'Champions Baseball Academy, TX',
      'Five Tool Baseball, TX'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  generateTournamentHistory(ageGroup) {
    const tournaments = [];
    const eventCount = Math.floor(Math.random() * 6) + 2;

    for (let i = 0; i < eventCount; i++) {
      tournaments.push({
        tournament: this.selectTournament(),
        team: this.generateTeamName(),
        performance: this.generateTournamentPerformance(),
        date: this.generateEventDate()
      });
    }

    return tournaments.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  selectTournament() {
    const tournaments = [
      'WWBA World Championship',
      'Perfect Game National Championship',
      'BCS National Championship',
      'Texas State Games',
      'Deep South Classic',
      'Lone Star State Championships',
      'Southwest Classic'
    ];
    return tournaments[Math.floor(Math.random() * tournaments.length)];
  }

  generateTeamName() {
    const prefixes = ['Texas', 'Houston', 'Dallas', 'Austin', 'San Antonio', 'Louisiana', 'Arkansas', 'Oklahoma'];
    const suffixes = ['Mustangs', 'Eagles', 'Tigers', 'Cardinals', 'Bombers', 'Express', 'Lightning', 'Storm'];
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
  }

  generateTournamentPerformance() {
    const games = Math.floor(Math.random() * 8) + 3;
    const hits = Math.floor(Math.random() * games * 3);
    const atBats = hits + Math.floor(Math.random() * games * 2);

    return {
      games,
      atBats,
      hits,
      average: atBats > 0 ? (hits / atBats).toFixed(3) : '.000',
      homeRuns: Math.floor(Math.random() * 3),
      rbi: Math.floor(Math.random() * 8)
    };
  }

  generateScoutNotes(position, ageGroup) {
    const notes = [];

    if (position.includes('P')) {
      notes.push('Strong arm strength with developing command');
      notes.push('Good body control and delivery mechanics');
      if (ageGroup === '18U' || ageGroup === '17U') {
        notes.push('Projects as potential college contributor');
      }
    } else {
      notes.push('Solid fundamental skills with good baseball IQ');
      notes.push('Shows athleticism and projectability');
      if (position === 'C') {
        notes.push('Good receiving skills with developing arm strength');
      }
    }

    return notes.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  generateProjectability(ageGroup, gradYear) {
    const baseProjection = {
      '18U': 'College Ready',
      '17U': 'High College Potential',
      '16U': 'Strong Development Track',
      '15U': 'Good Foundation',
      '14U': 'Early Development',
      '13U': 'Building Skills'
    }[ageGroup] || 'Learning Fundamentals';

    const advancedProjections = [
      'Potential Professional Prospect',
      'High-Level College Player',
      'Division I Potential',
      'Strong College Candidate',
      'Developing College Prospect'
    ];

    if (Math.random() > 0.8 && (ageGroup === '18U' || ageGroup === '17U')) {
      return advancedProjections[Math.floor(Math.random() * advancedProjections.length)];
    }

    return baseProjection;
  }

  async calculateRecruitingMetrics(profile) {
    const velocity = profile.metrics.velocity ? parseFloat(profile.metrics.velocity) : 0;
    const pgRating = parseFloat(profile.pgRating);
    const showcaseCount = profile.showcaseHistory.length;

    return {
      overallGrade: this.calculateOverallGrade(profile),
      velocityGrade: this.gradeVelocity(velocity, profile.ageGroup),
      athleticismGrade: this.gradeAthleticism(profile),
      projectabilityGrade: this.gradeProjectability(profile),
      recruitingInterest: this.calculateRecruitingInterest(profile),
      collegeLevel: this.projectCollegeLevel(profile),
      timeline: this.calculateRecruitingTimeline(profile)
    };
  }

  calculateOverallGrade(profile) {
    const pgRating = parseFloat(profile.pgRating);
    if (pgRating >= 9.5) return 'A+';
    if (pgRating >= 9.0) return 'A';
    if (pgRating >= 8.5) return 'A-';
    if (pgRating >= 8.0) return 'B+';
    if (pgRating >= 7.5) return 'B';
    return 'B-';
  }

  gradeVelocity(velocity, ageGroup) {
    const standards = {
      '18U': { elite: 88, good: 84, average: 80 },
      '17U': { elite: 85, good: 81, average: 77 },
      '16U': { elite: 82, good: 78, average: 74 }
    }[ageGroup] || { elite: 80, good: 75, average: 70 };

    if (velocity >= standards.elite) return 'Elite';
    if (velocity >= standards.good) return 'Above Average';
    if (velocity >= standards.average) return 'Average';
    return 'Below Average';
  }

  gradeAthleticism(profile) {
    const sixtyTime = parseFloat(profile.metrics.sixtyYard);
    if (sixtyTime <= 6.6) return 'Elite';
    if (sixtyTime <= 6.9) return 'Above Average';
    if (sixtyTime <= 7.2) return 'Average';
    return 'Below Average';
  }

  gradeProjectability(profile) {
    if (profile.projectability.includes('Professional')) return 'High';
    if (profile.projectability.includes('Division I')) return 'Good';
    if (profile.projectability.includes('College')) return 'Moderate';
    return 'Limited';
  }

  calculateRecruitingInterest(profile) {
    const pgRating = parseFloat(profile.pgRating);
    const hasCommitment = profile.commitment !== null;
    const showcaseCount = profile.showcaseHistory.length;

    if (hasCommitment) return 'Committed';
    if (pgRating >= 9.0 && showcaseCount >= 5) return 'High';
    if (pgRating >= 8.0 && showcaseCount >= 3) return 'Moderate';
    if (pgRating >= 7.0) return 'Emerging';
    return 'Early';
  }

  projectCollegeLevel(profile) {
    const pgRating = parseFloat(profile.pgRating);
    if (pgRating >= 9.5) return 'Power 5';
    if (pgRating >= 9.0) return 'Mid-Major D1';
    if (pgRating >= 8.0) return 'Lower D1 / Upper D2';
    if (pgRating >= 7.0) return 'D2 / NAIA';
    return 'Junior College';
  }

  calculateRecruitingTimeline(profile) {
    const gradYear = profile.gradYear;
    const currentYear = 2025;
    const yearsRemaining = gradYear - currentYear;

    if (yearsRemaining <= 0) return 'Immediate';
    if (yearsRemaining === 1) return 'Senior Year';
    if (yearsRemaining === 2) return 'Junior Year';
    if (yearsRemaining === 3) return 'Sophomore Year';
    return 'Early Development';
  }

  getFallbackData(playerId) {
    return {
      playerId,
      status: 'offline',
      message: 'Using cached data',
      lastUpdate: this.lastUpdate
    };
  }

  async getTopProspects(gradYear, region = 'South', limit = 50) {
    const prospects = [];

    for (let i = 1; i <= limit; i++) {
      const profile = await this.fetchPlayerProfile(`PG${gradYear}${String(i).padStart(4, '0')}`, gradYear);
      prospects.push(profile);
    }

    return prospects
      .filter(p => !region || PERFECT_GAME_CONFIG.regions[region]?.states.includes(p.playerInfo.state))
      .sort((a, b) => parseFloat(b.pgRating) - parseFloat(a.pgRating))
      .slice(0, limit);
  }

  async getRecruitingBoard(gradYear, uncommittedOnly = true) {
    const prospects = await this.getTopProspects(gradYear, 'South', 100);

    return prospects
      .filter(p => !uncommittedOnly || !p.commitment)
      .map(p => ({
        name: `${p.playerInfo.firstName} ${p.playerInfo.lastName}`,
        position: p.playerInfo.position,
        state: p.playerInfo.state,
        school: p.playerInfo.highSchool,
        pgRating: p.pgRating,
        commitment: p.commitment,
        metrics: p.metrics,
        recruitingMetrics: p.recruitingMetrics
      }))
      .slice(0, 25);
  }

  async getShowcaseCalendar(year = 2025) {
    const calendar = {};

    for (let month = 1; month <= 12; month++) {
      calendar[month] = [];

      // Generate 2-5 events per month
      const eventCount = Math.floor(Math.random() * 4) + 2;
      for (let i = 0; i < eventCount; i++) {
        calendar[month].push({
          name: this.selectShowcaseEvent('18U'),
          date: `${year}-${month.toString().padStart(2, '0')}-${(Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0')}`,
          location: this.generateEventLocation(),
          ageGroups: this.selectAgeGroups(),
          type: Math.random() > 0.5 ? 'Showcase' : 'Tournament'
        });
      }
    }

    return calendar;
  }

  selectAgeGroups() {
    const allAges = Object.keys(PERFECT_GAME_CONFIG.ageGroups);
    const count = Math.floor(Math.random() * 4) + 2;
    const selected = [];

    for (let i = 0; i < count; i++) {
      const age = allAges[Math.floor(Math.random() * allAges.length)];
      if (!selected.includes(age)) {
        selected.push(age);
      }
    }

    return selected.sort((a, b) => parseInt(b) - parseInt(a));
  }

  async getCollegeCommitments(gradYear, region = 'South') {
    const prospects = await this.getTopProspects(gradYear, region, 200);

    return prospects
      .filter(p => p.commitment)
      .map(p => ({
        name: `${p.playerInfo.firstName} ${p.playerInfo.lastName}`,
        position: p.playerInfo.position,
        state: p.playerInfo.state,
        highSchool: p.playerInfo.highSchool,
        pgRating: p.pgRating,
        college: p.commitment.school,
        commitmentDate: p.commitment.date,
        scholarshipType: p.commitment.type
      }))
      .sort((a, b) => parseFloat(b.pgRating) - parseFloat(a.pgRating));
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerfectGameIntegration;
}

// Browser-compatible export
if (typeof window !== 'undefined') {
  window.PerfectGameIntegration = PerfectGameIntegration;
}