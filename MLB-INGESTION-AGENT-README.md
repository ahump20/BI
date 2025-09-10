# MLB Ingestion & Evaluation Agent

A comprehensive MLB data ingestion and evaluation system that integrates with MLB Stats API and Baseball Savant to provide advanced player and team analytics with professional scouting metrics.

## 🌟 Features

### **Data Sources**
- **MLB Stats API**: Official MLB statistics, rosters, schedules, and game data
- **Baseball Savant**: Statcast data for advanced metrics (exit velocity, spin rate, etc.)
- **Cross-validation**: Data accuracy verification across multiple sources

### **30-Team Coverage**
- Complete roster data for all 30 MLB teams
- Season statistics and performance metrics
- Historical data and projections
- Division and league standings integration

### **Advanced Evaluation System**
- **MLB Scouting Scale (20-80)**: Professional-grade player evaluations
- **Hitting Metrics**: Contact, power, speed, discipline grades
- **Pitching Metrics**: Velocity, control, movement, durability grades  
- **Fielding Metrics**: Defensive range, arm strength, fielding percentage
- **Composite Scores**: Overall player value and projection ratings

### **Multi-Storage Architecture**
- **Local JSON**: Fast access and development
- **Cloudflare R2**: Scalable object storage
- **Cloudflare D1**: Structured SQL database
- **Redundancy**: Triple-backup with automatic fallback

### **Data Quality & Validation**
- Roster size validation (20-40 players expected)
- Player name format verification
- Statistical consistency cross-checks
- Data freshness monitoring (<48 hours)
- Real-time error reporting and logging

## 🚀 Quick Start

### 1. Installation

```bash
# Clone/download the agent files
# Ensure you have the following files:
# - mlb-ingestion-evaluation-agent.js
# - mlb-storage-integration.js
# - mlb-agent-setup.js

# Run setup
node mlb-agent-setup.js setup
```

### 2. Configuration

```bash
# Copy environment template
cp .env.template .env

# Edit .env with your API keys (optional for basic functionality)
# MLB Stats API is free and doesn't require keys
```

### 3. Run Ingestion

```bash
# Complete ingestion of all 30 teams
node mlb-agent-runner.js full

# Health check
node mlb-agent-runner.js health

# Test with Cardinals data
node mlb-agent-runner.js test
```

## 📊 Output Structure

### Team Data Format
```json
{
  "team": {
    "id": 138,
    "name": "St. Louis Cardinals",
    "abbreviation": "STL",
    "division": "NL Central",
    "competitiveIndex": 72,
    "legacyScore": 85
  },
  "roster": [
    {
      "id": 458015,
      "name": "Nolan Arenado",
      "position": "Third Base",
      "age": 32,
      "evaluation": {
        "grades": {
          "hitting": 70,
          "power": 65,
          "fielding": 80
        },
        "composite": 72,
        "projectedValue": 75
      }
    }
  ],
  "evaluation": {
    "overallGrade": "A-",
    "strengths": ["Elite defensive fundamentals", "Veteran leadership"],
    "projections": {
      "playoffOdds": "Good (60-80%)",
      "projectedTotalWins": 87
    }
  }
}
```

### Storage Locations
- **Local**: `./data/mlb/teams/stl_2024.json`
- **R2**: `s3://blaze-intelligence-mlb/teams/2024/stl.json`
- **D1**: Normalized tables (teams, players, stats, games)

## 🏗️ Architecture

### Core Components

1. **MLBIngestionAgent**: Main ingestion engine
   - Rate limiting (1000 requests/hour)
   - Error handling and retry logic
   - 30-team processing loop

2. **EvaluationEngine**: Player/team assessment
   - MLB scouting scale implementation
   - Advanced metric calculations
   - Projection algorithms

3. **ValidationSystem**: Data quality assurance
   - Multi-level validation checks
   - Cross-source verification
   - Real-time monitoring

4. **StorageIntegration**: Multi-backend persistence
   - Local JSON files
   - Cloudflare R2 object storage  
   - Cloudflare D1 SQL database

### Data Flow
```
MLB Stats API → Ingestion → Evaluation → Validation → Storage
     ↓              ↓           ↓           ↓         ↓
Baseball Savant → Processing → Grading → Quality → Multi-Store
```

## 🔧 Configuration Options

### mlb-agent-config.json
```json
{
  "mlb": {
    "statsApiUrl": "https://statsapi.mlb.com/api/v1",
    "rateLimit": 1000,
    "season": 2024,
    "retries": 3
  },
  "storage": {
    "r2": {
      "enabled": false,
      "bucket": "blaze-intelligence-mlb"
    },
    "d1": {
      "enabled": false
    }
  },
  "evaluation": {
    "gradeScale": "20-80",
    "includeProjections": true
  },
  "validation": {
    "accuracyThreshold": 0.95,
    "enableCrossChecks": true
  }
}
```

### Environment Variables
```bash
# Optional: Cloudflare Storage
R2_ACCESS_KEY_ID=your_key
R2_SECRET_ACCESS_KEY=your_secret
CLOUDFLARE_API_TOKEN=your_token
CLOUDFLARE_ACCOUNT_ID=your_account
D1_DATABASE_ID=your_database

# Features
ENABLE_R2_STORAGE=false
ENABLE_D1_STORAGE=false
ENABLE_ADVANCED_METRICS=true
```

## 📈 Evaluation Metrics

### Hitting Grades (20-80 Scale)
- **80 (Elite)**: .320+ AVG, 40+ HR pace
- **70 (Plus-Plus)**: .300+ AVG, 30+ HR pace  
- **60 (Plus)**: .280+ AVG, 20+ HR pace
- **50 (Average)**: .260+ AVG, 15+ HR pace
- **40 (Below Avg)**: .240+ AVG, 10+ HR pace

### Pitching Grades
- **Velocity**: Inferred from K/9 and ERA
- **Control**: BB/9 and WHIP based
- **Movement**: BABIP and ground ball rate
- **Durability**: Innings per game

### Team Metrics
- **Competitive Index**: 0-100 scale based on talent + performance
- **Legacy Score**: Historical significance + current strength
- **Overall Grade**: A+ to D based on composite rating

## 🔍 Validation System

### Team-Level Checks
- ✅ Roster size (20-40 players)
- ✅ Player name format validation
- ✅ Statistical consistency verification
- ✅ Data freshness (<48 hours)

### Data Quality Scoring
- **A+ (95%+)**: Excellent data quality
- **A (90%+)**: Very good quality
- **B (75%+)**: Good quality with minor issues
- **C (60%+)**: Acceptable with notable issues
- **D (<60%)**: Poor quality, needs attention

## 🚨 Error Handling

### Automatic Recovery
- **Rate Limiting**: Automatic backoff and retry
- **API Failures**: Exponential retry with circuit breaker
- **Storage Failures**: Multi-backend redundancy
- **Data Validation**: Graceful degradation with warnings

### Monitoring
- Real-time logging to console and files
- Data quality score tracking
- Storage health checks
- Performance metrics

## 📋 API Reference

### EnhancedMLBAgent

```javascript
const { EnhancedMLBAgent } = require('./mlb-storage-integration.js');

const agent = new EnhancedMLBAgent(options);

// Full ingestion
await agent.ingestAllTeamsWithStorage();

// Get team data
const cardinals = await agent.getTeamAnalysis('STL', 'local');

// Health check
const health = await agent.storage.healthCheck();
```

### MLBIngestionAgent

```javascript
const MLBIngestionAgent = require('./mlb-ingestion-evaluation-agent.js');

const agent = new MLBIngestionAgent(options);

// Process all teams
const results = await agent.ingestAllTeams();

// Process specific team
const teamData = await agent.ingestTeamData({ id: 138, code: 'STL', name: 'Cardinals' });
```

### Storage Integration

```javascript
const { MLBStorageIntegration } = require('./mlb-storage-integration.js');

const storage = new MLBStorageIntegration(options);
await storage.initialize();

// Save team data to all configured storage systems
await storage.saveTeamData('STL', teamData);

// Retrieve from specific storage
const data = await storage.getTeamData('STL', 'local');
```

## 🎯 Use Cases

### Scouting & Player Evaluation
- Professional-grade player assessments
- Comparative analysis across positions
- Prospect ranking and projection
- Trade value evaluation

### Team Analysis
- Roster construction analysis
- Competitive positioning
- Playoff probability modeling
- Organizational strength assessment

### Business Intelligence
- Market analysis and team valuation
- Performance trend identification
- Strategic planning support
- Investment decision support

## 🔮 Advanced Features

### Competitive Intelligence
- **Competitive Index**: Real-time team strength rating
- **Market Positioning**: Division and league comparative analysis
- **Trend Analysis**: Performance trajectory modeling
- **Strategic Insights**: Strengths, weaknesses, and recommendations

### Legacy Scoring
- Historical franchise value assessment
- Market presence and brand strength
- Performance consistency over time
- Cultural and regional impact factors

### Projection Modeling
- Win/loss projections based on talent
- Playoff probability calculations
- Player development trajectories
- Contract value optimization

## 🛠️ Development

### Requirements
- Node.js 14+
- Optional: @aws-sdk/client-s3 for R2 storage

### Testing
```bash
# Run setup validation
node mlb-agent-setup.js setup

# Test single team ingestion
node mlb-agent-runner.js test

# Check all storage systems
node mlb-agent-runner.js health
```

### Extending the System
1. **Custom Metrics**: Add evaluation functions to `calculatePlayerGrades()`
2. **New Data Sources**: Extend API integrations in the ingestion agent
3. **Storage Backends**: Implement new storage adapters
4. **Validation Rules**: Add checks in the validation system

## 📞 Support

For questions, issues, or feature requests:

1. Check the validation logs in `./logs/mlb-agent.log`
2. Run health checks to identify storage issues
3. Verify API connectivity with test commands
4. Review configuration files for setup errors

## 🏆 Success Metrics

### Data Quality Targets
- ✅ 95%+ validation pass rate
- ✅ <5% missing player data
- ✅ <24 hour data freshness
- ✅ 100% team coverage (30/30)

### Performance Targets
- ✅ Complete ingestion in <10 minutes
- ✅ 99%+ API success rate
- ✅ Triple-redundant storage
- ✅ <2 second query response time

---

Built by **Blaze Intelligence** for professional sports analytics and competitive intelligence.