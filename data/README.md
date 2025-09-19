# Blaze Intelligence Data Directory

This directory contains organized data files and analytics for the Blaze Intelligence platform.

## Directory Structure

```
data/
├── analytics/          # Sports analytics by league
│   ├── mlb/           # Cardinals and MLB data
│   ├── nfl/           # Titans and NFL data  
│   ├── nba/           # Grizzlies and NBA data
│   └── ncaa/          # Longhorns and NCAA data
├── live/              # Real-time sports data feeds
├── clients/           # Client-specific data and proposals
├── youth-baseball/    # Perfect Game and youth sports data
├── international/     # Latin America, Japan, Korea pipeline data
└── cache/            # Temporary cached data
```

## Data Sources

### Primary Sports Data APIs
- **MLB Stats API**: Real-time baseball statistics
- **ESPN API**: Multi-sport coverage (NFL, NBA, NCAA)
- **Perfect Game API**: Youth baseball prospects and tournaments
- **International Sources**: Latin American and Asian baseball prospects

### Team Focus
- **Cardinals (MLB)**: Primary MLB analytics focus
- **Titans (NFL)**: NFL coverage and analysis
- **Longhorns (NCAA)**: College sports integration
- **Grizzlies (NBA)**: Professional basketball data

## Data Privacy and Security

All data processing follows strict privacy guidelines:
- No personal information stored without consent
- API keys and credentials managed via environment variables
- Automatic data retention policies
- GDPR and CCPA compliance

## Usage Guidelines

1. **Real-time Data**: Files in `live/` directory are updated automatically
2. **Historical Data**: Archived data maintained in respective league directories
3. **Client Data**: Stored securely in `clients/` with access controls
4. **Cache Management**: Temporary files cleaned automatically

## Youth Baseball Data Hub

- `youth-baseball/raw/` holds curated snapshots from Perfect Game, USSSA Select 30, and D1Baseball recruiting trackers.
- `youth-baseball/perfect-game-youth-select.json` is the merged and enriched dataset served by the public API layer.
- Regenerate the aggregate file by running `node scripts/build-perfect-game-youth-data.mjs` from the repository root after updating raw feeds.

## Data Processing Pipeline

The analytics pipeline processes data through multiple stages:

1. **Ingestion**: Raw data collection from various APIs
2. **Processing**: Data cleaning, validation, and enrichment
3. **Analysis**: Statistical analysis and insights generation
4. **Storage**: Organized storage with metadata
5. **Distribution**: API endpoints and dashboard updates

## Integration with AI Systems

Data is integrated with multiple AI platforms:
- **Claude**: Advanced reasoning and analysis
- **ChatGPT**: Content generation and insights
- **Gemini**: Data processing and pattern recognition

## Monitoring and Health Checks

- Automated data quality checks
- API health monitoring
- Performance metrics tracking
- Error logging and alerting

For technical support or data access requests, contact Austin Humphrey at ahump20@outlook.com.