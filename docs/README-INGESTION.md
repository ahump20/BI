# Blaze Intelligence Data Ingestion System

A comprehensive sports data ingestion and HAV-F (High-Performance Athlete Valuation Framework) computation system for MLB, NFL, NCAA, High School, NIL, and International leagues.

## Quick Start

### Prerequisites
- Python 3.11+
- Required packages: `requests`, `jsonschema`
- API keys for live data (optional, see Configuration section)

### Installation
```bash
pip install requests jsonschema
```

### Basic Usage

#### Run Individual Agents
```bash
# MLB (Cardinals by default)
python ingestion/mlb_agent.py --team STL

# NFL (Titans by default)  
python ingestion/nfl_agent.py --team TEN

# NCAA (Longhorns by default)
python ingestion/ncaa_agent.py --team TEX

# High School
python ingestion/hs_agent.py

# NIL profiles
python ingestion/nil_agent.py

# International (KBO by default)
python ingestion/intl_agent.py --league KBO
```

#### Generate Readiness Board
```bash
python ingestion/readiness.py --focus MLB-STL,NFL-TEN,NCAA-TEX
```

#### Run Tests
```bash
python run_tests.py
```

## Architecture

### Data Flow
```
Live APIs → Agents → Normalize → HAV-F Compute → Validate → Persist
```

1. **Fetch**: Agents connect to live sports APIs or use mock data
2. **Normalize**: Raw data is transformed to unified Blaze schema
3. **Compute**: HAV-F metrics are calculated for each player
4. **Validate**: Data is validated against JSON schema
5. **Persist**: Clean data is saved to `site/src/data/leagues/`

### File Structure
```
├── ingestion/
│   ├── havf.py                    # HAV-F computation engine
│   ├── live_fetchers.py           # API connection classes
│   ├── readiness.py               # Readiness board generator
│   ├── mlb_agent.py              # MLB data agent
│   ├── nfl_agent.py              # NFL data agent
│   ├── ncaa_agent.py             # NCAA data agent
│   ├── hs_agent.py               # High School data agent
│   ├── nil_agent.py              # NIL valuation agent
│   └── intl_agent.py             # International baseball agent
├── schemas/
│   └── player.schema.json        # JSON Schema for validation
├── site/src/data/
│   ├── teams.json                # Team summary rollup
│   ├── readiness.json            # Readiness board data
│   └── leagues/                  # Per-league player data
│       ├── mlb.json
│       ├── nfl.json
│       ├── ncaa.json
│       ├── hs.json
│       ├── nil.json
│       └── intl.json
├── tests/
│   ├── test_schema.py            # Schema validation tests
│   ├── test_havf.py              # HAV-F computation tests
│   └── test_normalizers.py       # Agent normalizer tests
└── .github/workflows/
    └── ingest.yml                # Automated ingestion workflow
```

## HAV-F Metrics

The High-Performance Athlete Valuation Framework computes three core metrics:

### Champion Readiness (0-100)
**Formula**: `0.5×Performance + 0.4×Physical + 0.1×Trajectory`

- **Performance**: Sport-specific dominance metrics
  - MLB: WAR (Wins Above Replacement) + WPA (Win Probability Added)
  - NFL: EPA (Expected Points Added) 
  - NCAA/HS: Total yards and touchdowns weighted
- **Physical**: Biometric indicators (when available)
  - HRV (Heart Rate Variability): Higher = better recovery
  - Reaction time: Lower = better neural efficiency  
  - GSR (Galvanic Skin Response): Lower = better composure
  - Sleep hours: 7-9 hours optimal
- **Trajectory**: Age/experience curve modeling

### Cognitive Leverage (0-100)
**Formula**: `0.6×Neural Efficiency + 0.4×Composure`

- **Neural Efficiency**: Inverted reaction time (faster = higher score)
- **Composure**: Combined HRV and GSR indicators
- Requires biometric data; returns default low score if unavailable

### NIL Trust Score (0-100)
**Formula**: `0.6×Authenticity + 0.25×Velocity + 0.15×Salience`

- **Authenticity**: Engagement rate (5% = 100 points)
- **Velocity**: Deal frequency and value in last 90 days
- **Salience**: Combined search index and local popularity
- Returns default low score if NIL profile unavailable

## Live Data Sources

### MLB
- **Primary**: MLB Stats API (`https://statsapi.mlb.com/api/v1`)
- **Secondary**: Baseball Savant Statcast data
- **Rate limit**: 1 request per second
- **Coverage**: All 30 MLB teams, complete rosters

### NFL  
- **Primary**: nflverse (`https://github.com/nflverse/nflfastR-data`)
- **Secondary**: ESPN API for roster data
- **Rate limit**: 2 requests per second
- **Coverage**: All 32 NFL teams, player stats

### NCAA
- **Primary**: College Football Data API (`https://api.collegefootballdata.com`)
- **API Key**: Required (`CFBD_API_KEY` environment variable)
- **Rate limit**: 1 request per second  
- **Coverage**: FBS teams, player stats, recruiting data

### NBA (Grizzlies focus)
- **Primary**: NBA Stats API (`https://stats.nba.com/stats`)
- **Rate limit**: 1.6 seconds between requests (strict)
- **Coverage**: All 30 NBA teams, advanced metrics

### International
- **Primary**: TheSportsDB API
- **API Key**: Optional (`THESPORTSDB_API_KEY` for higher limits)
- **Rate limit**: 1 request per second
- **Coverage**: KBO, NPB, Latin American leagues

### NIL Data
- **Sources**: On3 NIL Rankings, 247Sports, social media APIs
- **Rate limit**: 2 requests per second (conservative)
- **Coverage**: Top college athletes by valuation

## Configuration

### Environment Variables
```bash
# Enable live data fetching (default: disabled)
export LIVE_FETCH=1

# API Keys (optional but recommended)
export CFBD_API_KEY=your_key_here
export THESPORTSDB_API_KEY=your_key_here

# Rate limiting (requests per second)
export MLB_RATE_LIMIT=1.0
export NFL_RATE_LIMIT=0.5
export NCAA_RATE_LIMIT=1.0
```

### GitHub Secrets (for Actions)
Set these in your repository secrets:
- `CFBD_API_KEY`: College Football Data API key
- `THESPORTSDB_API_KEY`: TheSportsDB API key

## Usage Examples

### Fetch Live Cardinals Data
```bash
export LIVE_FETCH=1
python ingestion/mlb_agent.py --live --team STL
```

### Run All Agents with Live Data
```bash
export LIVE_FETCH=1
python ingestion/mlb_agent.py --live --team STL
python ingestion/nfl_agent.py --live --team TEN  
python ingestion/ncaa_agent.py --live --team Texas
python ingestion/hs_agent.py --live
python ingestion/nil_agent.py --live
python ingestion/intl_agent.py --live --league KBO
```

### Compute HAV-F Only (existing data)
```python
from ingestion.havf import compute_all
import json

# Load existing players
with open('site/src/data/leagues/mlb.json', 'r') as f:
    data = json.load(f)

# Recompute HAV-F
compute_all(data['players'])

# Save updated data
with open('site/src/data/leagues/mlb.json', 'w') as f:
    json.dump(data, f, indent=2)
```

### Validate Schema Compliance
```bash
python tests/test_schema.py
```

### Generate Custom Readiness Board
```bash
# Focus on specific teams
python ingestion/readiness.py --focus MLB-STL,NBA-MEM

# Save to custom location
python ingestion/readiness.py --output custom_readiness.json

# Quiet mode (no console output)
python ingestion/readiness.py --quiet
```

## GitHub Actions Integration

### Automated Schedules
- **MLB**: Daily at 5:00 AM UTC
- **NFL**: Weekly on Monday at 7:00 AM UTC
- **NCAA**: Weekly on Tuesday at 8:00 AM UTC  
- **HS**: Weekly on Saturday at 9:00 AM UTC
- **NIL**: Monthly on 1st at 10:00 AM UTC
- **International**: Weekly on Wednesday at 11:00 AM UTC

### Manual Trigger
```bash
# Trigger workflow with live data
gh workflow run ingest.yml -f live_fetch=true -f leagues=mlb,nfl

# Run specific leagues only  
gh workflow run ingest.yml -f leagues=ncaa,nil
```

### Workflow Features
- **Error resilience**: Continue on individual agent failures
- **Data validation**: Automatic schema validation
- **Auto-commit**: Commits validated data to repository
- **Summaries**: Generates ingestion reports in Actions summary

## Error Handling

### Rate Limiting
- Automatic exponential backoff on 429 responses
- Maximum 3 retry attempts per request
- Configurable delays between requests

### API Failures
- Graceful fallback to mock data when APIs unavailable
- Detailed error logging with retry information
- Continue-on-error for GitHub Actions resilience

### Validation Failures
- Schema validation catches malformed data
- HAV-F bounds checking (0-100 range enforcement)
- Missing required fields detection

## Monitoring & Observability

### Readiness Board Metrics
```bash
# Team readiness overview
python ingestion/readiness.py

# Player-level details for focus teams
python ingestion/readiness.py --focus MLB-STL,NFL-TEN,NCAA-TEX
```

### Data Freshness Checks
```bash
# Find stale data files
find site/src/data -name "*.json" -mtime +1

# Validate all schemas
python tests/test_schema.py

# Test HAV-F computations  
python tests/test_havf.py
```

### GitHub Actions Monitoring
- Check Actions tab for ingestion status
- Review commit history for data update frequency
- Monitor Actions summary for data statistics

## Development

### Adding New Leagues
1. Create agent class in `ingestion/{league}_agent.py`
2. Implement required methods: `fetch_raw()`, `normalize()`, `run()`
3. Add live fetcher class to `ingestion/live_fetchers.py`
4. Update GitHub Actions workflow
5. Add tests in `tests/test_normalizers.py`

### Extending HAV-F Metrics
1. Modify computation functions in `ingestion/havf.py`
2. Update JSON schema in `schemas/player.schema.json`
3. Add validation tests in `tests/test_havf.py`
4. Update documentation

### Testing New Features
```bash
# Run specific test categories
python -m unittest tests.test_havf
python -m unittest tests.test_schema  
python -m unittest tests.test_normalizers

# Test with verbose output
python run_tests.py -v
```

## Troubleshooting

### Common Issues

**"Live fetch failed, falling back to mocks"**
- Check internet connectivity
- Verify API keys are set correctly
- Check rate limiting (may need to wait)

**"Schema validation failed"**
- Check required fields are present in normalized data
- Verify HAV-F scores are in 0-100 range
- Ensure `updated_at` timestamps are valid ISO format

**"No league data found"**
- Run individual agents first to generate data files
- Check `site/src/data/leagues/` directory exists
- Verify agents completed successfully

### Debug Mode
```bash
# Enable verbose logging
export DEBUG=1
python ingestion/mlb_agent.py --live --team STL

# Test individual components
python -c "from ingestion.havf import compute_champion_readiness; print(compute_champion_readiness({'sport':'MLB','stats':{'season':'2024','perfs':{'war':2.1}}}))"
```

## API Rate Limits & Best Practices

### Rate Limit Guidelines
- **MLB Stats API**: 1 req/sec, burst allowed
- **nflverse**: No official limit, use 0.5 req/sec
- **CFBD**: 200 req/min with API key, use 1 req/sec  
- **NBA Stats**: Very strict, use 1.6 sec intervals
- **TheSportsDB**: 30 req/min free tier, 1 req/sec

### Best Practices
1. Always implement exponential backoff
2. Cache responses when appropriate
3. Use batch endpoints when available
4. Monitor for API changes and deprecations
5. Respect robots.txt and terms of service

## Support

For issues and feature requests:
1. Check existing GitHub issues
2. Review troubleshooting section
3. Test with mock data first
4. Provide full error logs and environment details

---

**Blaze Intelligence** - Where cognitive performance meets quarterly performance™
