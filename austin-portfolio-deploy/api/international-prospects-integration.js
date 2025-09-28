/**
 * International Baseball Prospects Pipeline Integration
 * Blaze Intelligence - The Deep South's Sports Intelligence Hub
 * Latin America, Japan/NPB, Korea/KBO, and emerging markets
 */

const INTERNATIONAL_CONFIG = {
  apiKey: process.env.INTERNATIONAL_BASEBALL_API_KEY || 'demo',
  baseUrl: 'https://api.internationalbaseball.com/v2',
  cacheTime: 300000, // 5 minutes cache
  regions: {
    'LatinAmerica': {
      name: 'Latin America',
      focus: true,
      countries: {
        'DOM': { name: 'Dominican Republic', pipeline: 'elite', academies: 35, signingBonus: 'high' },
        'VEN': { name: 'Venezuela', pipeline: 'elite', academies: 28, signingBonus: 'high' },
        'CUB': { name: 'Cuba', pipeline: 'emerging', academies: 8, signingBonus: 'variable' },
        'PUR': { name: 'Puerto Rico', pipeline: 'strong', academies: 12, signingBonus: 'medium' },
        'COL': { name: 'Colombia', pipeline: 'developing', academies: 15, signingBonus: 'medium' },
        'PAN': { name: 'Panama', pipeline: 'emerging', academies: 6, signingBonus: 'low' },
        'NIC': { name: 'Nicaragua', pipeline: 'developing', academies: 4, signingBonus: 'low' },
        'MEX': { name: 'Mexico', pipeline: 'strong', academies: 18, signingBonus: 'medium' },
        'HON': { name: 'Honduras', pipeline: 'emerging', academies: 3, signingBonus: 'low' },
        'BRA': { name: 'Brazil', pipeline: 'developing', academies: 8, signingBonus: 'medium' }
      }
    },
    'Asia': {
      name: 'Asia-Pacific',
      focus: true,
      countries: {
        'JPN': { name: 'Japan', pipeline: 'elite', league: 'NPB', level: 'top', postingSystem: true },
        'KOR': { name: 'South Korea', pipeline: 'strong', league: 'KBO', level: 'high', postingSystem: true },
        'TWN': { name: 'Taiwan', pipeline: 'developing', league: 'CPBL', level: 'medium', postingSystem: false },
        'CHN': { name: 'China', pipeline: 'emerging', league: 'CBL', level: 'developing', postingSystem: false },
        'AUS': { name: 'Australia', pipeline: 'developing', league: 'ABL', level: 'medium', postingSystem: false }
      }
    },
    'Europe': {
      name: 'Europe',
      focus: false,
      countries: {
        'NED': { name: 'Netherlands', pipeline: 'developing', league: 'Hoofdklasse', level: 'medium' },
        'ITA': { name: 'Italy', pipeline: 'emerging', league: 'IBL', level: 'low' },
        'GER': { name: 'Germany', pipeline: 'emerging', league: 'Bundesliga', level: 'low' }
      }
    }
  },
  signingPeriods: {
    international: {
      start: 'January 15',
      end: 'December 15',
      bonus_pools: true,
      age_restrictions: '16-23'
    },
    posting: {
      start: 'November 1',
      end: 'March 1',
      eligible_leagues: ['NPB', 'KBO'],
      requirements: 'Professional experience'
    }
  }
};

class InternationalProspectsIntegration {
  constructor() {
    this.cache = new Map();
    this.lastUpdate = null;
    this.signingTracker = new Map();
    this.academyReports = new Map();
    this.scoutingReports = new Map();
  }

  async fetchProspectProfile(prospectId, country, region) {
    const cacheKey = `intl_${region}_${country}_${prospectId}_${Math.floor(Date.now() / INTERNATIONAL_CONFIG.cacheTime)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const profile = await this.simulateInternationalAPI(prospectId, country, region);

      // Enhanced metrics for top prospects
      if (profile.scoutingGrade >= 55) {
        profile.signingProjection = await this.calculateSigningProjection(profile);
      }

      this.cache.set(cacheKey, profile);
      setTimeout(() => this.cache.delete(cacheKey), INTERNATIONAL_CONFIG.cacheTime);

      return profile;
    } catch (error) {
      console.error(`Error fetching prospect ${prospectId} data:`, error);
      return this.getFallbackData(prospectId);
    }
  }

  async simulateInternationalAPI(prospectId, country, region) {
    const countryData = INTERNATIONAL_CONFIG.regions[region]?.countries[country];
    if (!countryData) throw new Error(`Country ${country} not found in ${region}`);

    const age = Math.floor(Math.random() * 8) + 16; // 16-23 years old
    const position = this.generatePosition();
    const isLatinAmerica = region === 'LatinAmerica';

    return {
      prospectId,
      country,
      region,
      prospectInfo: {
        firstName: this.generateFirstName(country),
        lastName: this.generateLastName(country),
        age,
        position,
        city: this.generateCity(country),
        academy: isLatinAmerica ? this.generateAcademy(country) : null,
        currentTeam: this.generateCurrentTeam(country, region),
        height: this.generateHeight(),
        weight: this.generateWeight(),
        batsThrows: this.generateBatsThrows()
      },
      skills: {
        hit: this.generateSkillGrade(),
        power: this.generateSkillGrade(),
        run: this.generateSkillGrade(),
        arm: this.generateSkillGrade(),
        field: this.generateSkillGrade(),
        overall: 0 // Will be calculated
      },
      metrics: {
        exitVelocity: position.includes('P') ? null : this.generateExitVelocity(age),
        velocity: position.includes('P') ? this.generatePitchingVelocity(age) : this.generatePositionVelocity(age),
        sixtyYard: this.generateSixtyTime(age),
        popTime: position === 'C' ? this.generatePopTime(age) : null
      },
      scoutingGrade: 0, // Will be calculated
      signingEligibility: this.calculateSigningEligibility(age, country, region),
      mlbInterest: this.generateMLBInterest(country),
      contractStatus: this.generateContractStatus(age, country, region),
      scoutingHistory: this.generateScoutingHistory(country, region),
      season: 2025
    };
  }

  generatePosition() {
    const positions = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'RHP', 'LHP', 'OF', 'IF'];
    return positions[Math.floor(Math.random() * positions.length)];
  }

  generateFirstName(country) {
    const names = {
      'DOM': ['Jose', 'Carlos', 'Luis', 'Miguel', 'Rafael', 'Pedro', 'Juan', 'Fernando', 'Roberto', 'Antonio'],
      'VEN': ['Jesus', 'Carlos', 'Jose', 'Luis', 'Miguel', 'Rafael', 'Oswaldo', 'Eduardo', 'Francisco', 'Alejandro'],
      'CUB': ['Yoenis', 'Yasiel', 'Aroldis', 'Jose', 'Yulieski', 'Yordan', 'Randy', 'Livan', 'Orlando', 'Kendrys'],
      'JPN': ['Shohei', 'Yoshinobu', 'Masahiro', 'Kenta', 'Yu', 'Hiroki', 'Koji', 'Masahito', 'Seiya', 'Kodai'],
      'KOR': ['Hyun-jin', 'Jung-ho', 'Shin-soo', 'Ha-seong', 'Ji-man', 'Kwang-hyun', 'Byung-ho', 'Min-woo', 'Sung-bum', 'Do-hyoung'],
      'MEX': ['Fernando', 'Esteban', 'Jorge', 'Adrian', 'Cesar', 'Sergio', 'Alfredo', 'Roberto', 'Ricardo', 'Marco']
    };

    const countryNames = names[country] || ['Carlos', 'Jose', 'Luis', 'Miguel', 'Rafael'];
    return countryNames[Math.floor(Math.random() * countryNames.length)];
  }

  generateLastName(country) {
    const names = {
      'DOM': ['Martinez', 'Rodriguez', 'Ramirez', 'Sosa', 'Guerrero', 'Polanco', 'Machado', 'Bautista', 'Reyes', 'Santana'],
      'VEN': ['Cabrera', 'Altuve', 'Gonzalez', 'Perez', 'Sanchez', 'Hernandez', 'Garcia', 'Suarez', 'Rondon', 'Gurriel'],
      'CUB': ['Cespedes', 'Puig', 'Chapman', 'Abreu', 'Contreras', 'Hernandez', 'El Duque', 'Palmeiro', 'Morales', 'Soler'],
      'JPN': ['Ohtani', 'Yamamoto', 'Tanaka', 'Maeda', 'Darvish', 'Kuroda', 'Uehara', 'Okajima', 'Suzuki', 'Matsui'],
      'KOR': ['Ryu', 'Kang', 'Choo', 'Kim', 'Choi', 'Kwak', 'Lee', 'Park', 'Oh', 'Lim'],
      'MEX': ['Valenzuela', 'Loaiza', 'Gonzalez', 'Urías', 'Gallardo', 'Perez', 'Leon', 'Herrera', 'Moreno', 'Castro']
    };

    const countryNames = names[country] || ['Rodriguez', 'Martinez', 'Gonzalez', 'Hernandez', 'Garcia'];
    return countryNames[Math.floor(Math.random() * countryNames.length)];
  }

  generateCity(country) {
    const cities = {
      'DOM': ['Santo Domingo', 'Santiago', 'San Pedro de Macoris', 'San Cristobal', 'Puerto Plata'],
      'VEN': ['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay'],
      'CUB': ['Havana', 'Santiago de Cuba', 'Holguín', 'Camagüey', 'Santa Clara'],
      'JPN': ['Tokyo', 'Osaka', 'Nagoya', 'Yokohama', 'Sapporo'],
      'KOR': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon'],
      'MEX': ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana']
    };

    const countryCities = cities[country] || ['Unknown City'];
    return countryCities[Math.floor(Math.random() * countryCities.length)];
  }

  generateAcademy(country) {
    const academies = {
      'DOM': ['Campo Las Palmas', 'Complejo Juan Marichal', 'Academia de los Yankees', 'Academia de los Dodgers', 'Academia de los Padres'],
      'VEN': ['Academia Los Leones', 'Campo Zulia', 'Academia Valencia', 'Centro de Entrenamiento Maracaibo', 'Academia Caracas'],
      'COL': ['Academia Cartagena', 'Centro Bogotá', 'Academia Barranquilla', 'Campo Medellín', 'Academia Costa Caribe']
    };

    const countryAcademies = academies[country] || ['Local Academy'];
    return countryAcademies[Math.floor(Math.random() * countryAcademies.length)];
  }

  generateCurrentTeam(country, region) {
    if (region === 'Asia') {
      const teams = {
        'JPN': ['Yomiuri Giants', 'Hanshin Tigers', 'Hiroshima Carp', 'Yakult Swallows', 'Chunichi Dragons'],
        'KOR': ['Doosan Bears', 'KIA Tigers', 'Samsung Lions', 'LG Twins', 'Lotte Giants'],
        'TWN': ['CTBC Brothers', 'Rakuten Monkeys', 'Uni-President Lions', 'Wei Chuan Dragons', 'Fubon Guardians']
      };

      const countryTeams = teams[country] || ['Local Professional Team'];
      return countryTeams[Math.floor(Math.random() * countryTeams.length)];
    }

    return 'Amateur/Academy';
  }

  generateHeight() {
    const feet = Math.floor(Math.random() * 3) + 5; // 5-7 feet
    const inches = Math.floor(Math.random() * 12); // 0-11 inches
    return `${feet}-${inches}`;
  }

  generateWeight() {
    return Math.floor(Math.random() * 80) + 150; // 150-230 lbs
  }

  generateBatsThrows() {
    const combos = ['R/R', 'L/L', 'S/R', 'L/R', 'R/L'];
    return combos[Math.floor(Math.random() * combos.length)];
  }

  generateSkillGrade() {
    // 20-80 scouting scale
    return Math.floor(Math.random() * 41) + 30; // 30-70 range (most prospects)
  }

  generateExitVelocity(age) {
    const baseVelo = Math.min(75 + (age - 16) * 2, 95); // Age-based progression
    return (baseVelo + Math.random() * 15).toFixed(1);
  }

  generatePitchingVelocity(age) {
    const baseVelo = Math.min(80 + (age - 16) * 1.5, 98); // Age-based progression
    return (baseVelo + Math.random() * 12).toFixed(1);
  }

  generatePositionVelocity(age) {
    const baseVelo = Math.min(75 + (age - 16) * 1.2, 90);
    return (baseVelo + Math.random() * 10).toFixed(1);
  }

  generateSixtyTime(age) {
    const baseTime = Math.max(7.5 - (age - 16) * 0.1, 6.3); // Improvement with age
    return (baseTime + Math.random() * 0.8).toFixed(2);
  }

  generatePopTime(age) {
    const baseTime = Math.max(2.3 - (age - 16) * 0.05, 1.85);
    return (baseTime + Math.random() * 0.3).toFixed(2);
  }

  calculateSigningEligibility(age, country, region) {
    if (region === 'Asia') {
      return {
        eligible: age >= 25 && Math.random() > 0.7, // Professional experience required
        type: 'posting_system',
        restrictions: 'Must be posted by current team',
        timeline: 'November 1 - March 1'
      };
    }

    // Latin America international signing
    return {
      eligible: age >= 16,
      type: 'international_signing',
      restrictions: age < 17 ? 'July 2 eligible' : 'Immediate',
      timeline: 'January 15 - December 15'
    };
  }

  generateMLBInterest(country) {
    const teams = [
      'Cardinals', 'Yankees', 'Dodgers', 'Red Sox', 'Giants', 'Rangers', 'Astros',
      'Padres', 'Braves', 'Marlins', 'Rays', 'Tigers', 'Twins', 'Pirates'
    ];

    const interestLevel = Math.random();
    let interestedTeams = [];

    if (interestLevel > 0.8) {
      // High interest - 5-8 teams
      const teamCount = Math.floor(Math.random() * 4) + 5;
      for (let i = 0; i < teamCount; i++) {
        const team = teams[Math.floor(Math.random() * teams.length)];
        if (!interestedTeams.includes(team)) {
          interestedTeams.push(team);
        }
      }
    } else if (interestLevel > 0.5) {
      // Moderate interest - 2-4 teams
      const teamCount = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < teamCount; i++) {
        const team = teams[Math.floor(Math.random() * teams.length)];
        if (!interestedTeams.includes(team)) {
          interestedTeams.push(team);
        }
      }
    } else if (interestLevel > 0.2) {
      // Limited interest - 1-2 teams
      const teamCount = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < teamCount; i++) {
        const team = teams[Math.floor(Math.random() * teams.length)];
        if (!interestedTeams.includes(team)) {
          interestedTeams.push(team);
        }
      }
    }

    return {
      level: interestLevel > 0.8 ? 'High' : interestLevel > 0.5 ? 'Moderate' : interestLevel > 0.2 ? 'Limited' : 'Minimal',
      teams: interestedTeams,
      lastUpdate: new Date().toISOString()
    };
  }

  generateContractStatus(age, country, region) {
    if (region === 'Asia' && age >= 18) {
      return {
        status: 'Professional',
        team: this.generateCurrentTeam(country, region),
        salary: this.generateProfessionalSalary(country),
        years: Math.floor(Math.random() * 5) + 1,
        postingEligible: age >= 25 && Math.random() > 0.6
      };
    }

    if (age >= 16) {
      return {
        status: 'Amateur',
        academy: region === 'LatinAmerica' ? this.generateAcademy(country) : null,
        signingEligible: true,
        bonusRange: this.generateBonusRange(country)
      };
    }

    return {
      status: 'Under Age',
      eligibleDate: `July 2, ${2025 + (17 - age)}`,
      academy: region === 'LatinAmerica' ? this.generateAcademy(country) : null
    };
  }

  generateProfessionalSalary(country) {
    const ranges = {
      'JPN': { min: 500000, max: 5000000 },
      'KOR': { min: 200000, max: 2000000 },
      'TWN': { min: 100000, max: 800000 }
    };

    const range = ranges[country] || { min: 50000, max: 500000 };
    return Math.floor(Math.random() * (range.max - range.min) + range.min);
  }

  generateBonusRange(country) {
    const ranges = {
      'DOM': '$50K - $2.5M',
      'VEN': '$40K - $2M',
      'CUB': '$500K - $8M',
      'PUR': '$25K - $1M',
      'COL': '$20K - $800K'
    };

    return ranges[country] || '$10K - $500K';
  }

  generateScoutingHistory(country, region) {
    const history = [];
    const reportCount = Math.floor(Math.random() * 8) + 2;

    const scoutingTeams = ['Cardinals', 'Yankees', 'Dodgers', 'Red Sox', 'Giants', 'Rangers', 'Astros'];

    for (let i = 0; i < reportCount; i++) {
      history.push({
        date: this.generateScoutingDate(),
        team: scoutingTeams[Math.floor(Math.random() * scoutingTeams.length)],
        scout: this.generateScoutName(),
        grade: this.generateOverallGrade(),
        notes: this.generateScoutingNotes(),
        followUp: Math.random() > 0.6
      });
    }

    return history.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  generateScoutingDate() {
    const year = 2024 + Math.floor(Math.random() * 2);
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  generateScoutName() {
    const scouts = [
      'Jose Fernandez', 'Carlos Martinez', 'Luis Rodriguez', 'Miguel Santos',
      'Rafael Perez', 'Antonio Garcia', 'Eduardo Ramirez', 'Fernando Lopez'
    ];
    return scouts[Math.floor(Math.random() * scouts.length)];
  }

  generateOverallGrade() {
    const grades = ['40', '45', '50', '55', '60', '65', '70'];
    return grades[Math.floor(Math.random() * grades.length)];
  }

  generateScoutingNotes() {
    const notes = [
      'Solid overall tools with good upside',
      'Raw power potential with developing hit tool',
      'Good athlete with strong arm',
      'Shows advanced feel for hitting',
      'Physical projection remaining',
      'Good defensive instincts',
      'Plus arm strength with accuracy',
      'Athletic frame with room to fill out'
    ];
    return notes[Math.floor(Math.random() * notes.length)];
  }

  async calculateSigningProjection(profile) {
    const scoutingGrade = profile.scoutingGrade;
    const mlbInterest = profile.mlbInterest;
    const country = profile.country;

    return {
      signingProbability: this.calculateSigningProbability(profile),
      projectedBonus: this.projectSigningBonus(profile),
      timelineProjection: this.projectSigningTimeline(profile),
      competitionLevel: this.assessCompetition(profile),
      riskFactors: this.identifyRiskFactors(profile),
      recommendations: this.generateRecommendations(profile)
    };
  }

  calculateSigningProbability(profile) {
    let probability = 0.3; // Base 30%

    if (profile.scoutingGrade >= 60) probability += 0.4;
    else if (profile.scoutingGrade >= 55) probability += 0.25;
    else if (profile.scoutingGrade >= 50) probability += 0.15;

    if (profile.mlbInterest.level === 'High') probability += 0.3;
    else if (profile.mlbInterest.level === 'Moderate') probability += 0.2;
    else if (profile.mlbInterest.level === 'Limited') probability += 0.1;

    if (profile.signingEligibility.eligible) probability += 0.2;

    return Math.min(probability * 100, 95).toFixed(1);
  }

  projectSigningBonus(profile) {
    const grade = profile.scoutingGrade;
    const country = profile.country;

    let baseBonus = 50000;

    if (grade >= 65) baseBonus = 1500000;
    else if (grade >= 60) baseBonus = 800000;
    else if (grade >= 55) baseBonus = 400000;
    else if (grade >= 50) baseBonus = 150000;

    // Country adjustments
    const multipliers = {
      'CUB': 2.5,
      'DOM': 1.5,
      'VEN': 1.4,
      'JPN': 3.0,
      'KOR': 2.0
    };

    baseBonus *= (multipliers[country] || 1.0);

    const variance = baseBonus * 0.5;
    const finalBonus = baseBonus + (Math.random() - 0.5) * variance;

    return Math.max(finalBonus, 25000);
  }

  projectSigningTimeline(profile) {
    if (!profile.signingEligibility.eligible) {
      return profile.signingEligibility.timeline || 'Not yet eligible';
    }

    if (profile.mlbInterest.level === 'High') return '2-6 months';
    if (profile.mlbInterest.level === 'Moderate') return '6-12 months';
    if (profile.mlbInterest.level === 'Limited') return '12-24 months';
    return '24+ months';
  }

  assessCompetition(profile) {
    const interestedTeams = profile.mlbInterest.teams.length;

    if (interestedTeams >= 6) return 'High Competition';
    if (interestedTeams >= 3) return 'Moderate Competition';
    if (interestedTeams >= 1) return 'Limited Competition';
    return 'Minimal Competition';
  }

  identifyRiskFactors(profile) {
    const risks = [];

    if (profile.prospectInfo.age >= 22) risks.push('Advanced age for amateur prospect');
    if (profile.country === 'CUB') risks.push('Political/defection complications');
    if (profile.region === 'Asia' && !profile.contractStatus.postingEligible) {
      risks.push('Posting system requirements');
    }
    if (profile.scoutingGrade < 50) risks.push('Below-average scouting grade');
    if (profile.mlbInterest.teams.length === 0) risks.push('Limited MLB interest');

    return risks;
  }

  generateRecommendations(profile) {
    const recommendations = [];

    if (profile.scoutingGrade >= 60) {
      recommendations.push('High priority target - aggressive pursuit recommended');
    }

    if (profile.mlbInterest.level === 'High') {
      recommendations.push('Act quickly due to high competition');
    }

    if (profile.country === 'DOM' || profile.country === 'VEN') {
      recommendations.push('Leverage regional academy relationships');
    }

    if (profile.region === 'Asia') {
      recommendations.push('Monitor posting system developments');
    }

    return recommendations;
  }

  getFallbackData(prospectId) {
    return {
      prospectId,
      status: 'offline',
      message: 'Using cached data',
      lastUpdate: this.lastUpdate
    };
  }

  async getTopProspectsByRegion(region, limit = 25) {
    const prospects = [];
    const regionData = INTERNATIONAL_CONFIG.regions[region];

    if (!regionData) throw new Error(`Region ${region} not found`);

    let prospectId = 1;
    for (const [country, countryData] of Object.entries(regionData.countries)) {
      const countryProspects = Math.floor(limit / Object.keys(regionData.countries).length) + 2;

      for (let i = 0; i < countryProspects; i++) {
        const profile = await this.fetchProspectProfile(`${region}${String(prospectId).padStart(4, '0')}`, country, region);

        // Calculate overall skills
        profile.skills.overall = Math.round(
          (profile.skills.hit + profile.skills.power + profile.skills.run + profile.skills.arm + profile.skills.field) / 5
        );
        profile.scoutingGrade = profile.skills.overall;

        prospects.push(profile);
        prospectId++;
      }
    }

    return prospects
      .sort((a, b) => b.scoutingGrade - a.scoutingGrade)
      .slice(0, limit);
  }

  async getSigningPeriodTracker() {
    const tracker = {
      currentPeriod: '2025 International Signing Period',
      periodDates: 'January 15, 2025 - December 15, 2025',
      bonusPoolsRemaining: {},
      recentSignings: [],
      upcomingEligible: [],
      postingSystemActive: 'November 1, 2024 - March 1, 2025'
    };

    // Generate recent signings
    const latinProspects = await this.getTopProspectsByRegion('LatinAmerica', 10);
    tracker.recentSignings = latinProspects.slice(0, 5).map(p => ({
      name: `${p.prospectInfo.firstName} ${p.prospectInfo.lastName}`,
      position: p.prospectInfo.position,
      country: p.country,
      signingTeam: p.mlbInterest.teams[0] || 'TBD',
      bonus: this.projectSigningBonus(p),
      date: this.generateSigningDate()
    }));

    return tracker;
  }

  generateSigningDate() {
    const year = 2025;
    const month = Math.floor(Math.random() * 11) + 1; // Jan-Nov
    const day = Math.floor(Math.random() * 28) + 1;
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  async getRegionalScoutingReports(region, country = null) {
    const reports = [];
    const regionData = INTERNATIONAL_CONFIG.regions[region];

    if (!regionData) throw new Error(`Region ${region} not found`);

    const countries = country ? [country] : Object.keys(regionData.countries);

    for (const countryCode of countries) {
      const prospects = await this.getTopProspectsByRegion(region, 5);
      const countryProspects = prospects.filter(p => p.country === countryCode);

      reports.push({
        country: regionData.countries[countryCode].name,
        countryCode,
        totalProspects: countryProspects.length,
        topProspects: countryProspects.slice(0, 3),
        pipelineStrength: regionData.countries[countryCode].pipeline,
        lastScoutingTrip: this.generateScoutingDate(),
        recommendations: this.generateCountryRecommendations(countryCode, regionData.countries[countryCode])
      });
    }

    return reports;
  }

  generateCountryRecommendations(countryCode, countryData) {
    const recommendations = [];

    if (countryData.pipeline === 'elite') {
      recommendations.push('Maintain strong presence with multiple scouts');
    }
    if (countryData.academies > 20) {
      recommendations.push('Focus on top academy relationships');
    }
    if (countryData.signingBonus === 'high') {
      recommendations.push('Prepare for competitive bidding environment');
    }

    return recommendations;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InternationalProspectsIntegration;
}

// Browser-compatible export
if (typeof window !== 'undefined') {
  window.InternationalProspectsIntegration = InternationalProspectsIntegration;
}