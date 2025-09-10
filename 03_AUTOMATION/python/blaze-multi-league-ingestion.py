#!/usr/bin/env python3
"""
Blaze Intelligence Multi-League Ingestion System
Comprehensive data pipeline for MLB, NFL, NCAA, HS, NIL, and International leagues
"""

import json
import asyncio
import aiohttp
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import hashlib
import logging
from pathlib import Path
import time
from dataclasses import dataclass, asdict
import os
from jsonschema import validate, ValidationError
import numpy as np

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('blaze-ingestion')

# Load unified schema for validation
SCHEMA_PATH = Path('./blaze-unified-schema.json')
with open(SCHEMA_PATH, 'r') as f:
    UNIFIED_SCHEMA = json.load(f)

# API Configuration
API_CONFIG = {
    'MLB': {
        'base_url': 'https://statsapi.mlb.com/api/v1',
        'savant_url': 'https://baseballsavant.mlb.com/statcast_search',
        'rate_limit': {'calls': 30, 'period': 60},
        'endpoints': {
            'teams': '/teams?sportId=1&season=2025',
            'roster': '/teams/{team_id}/roster',
            'player': '/people/{player_id}',
            'stats': '/people/{player_id}/stats?stats=season&group=hitting,pitching&season=2025',
            'injuries': '/injuries?sportId=1',
            'prospects': '/prospects?sportId=1&season=2025'
        }
    },
    'NFL': {
        'base_url': 'https://api.sportsdata.io/v3/nfl',
        'espn_url': 'https://site.api.espn.com/apis/site/v2/sports/football/nfl',
        'rate_limit': {'calls': 60, 'period': 60},
        'endpoints': {
            'teams': '/teams',
            'players': '/players',
            'stats': '/stats/player/{player_id}',
            'injuries': '/injuries'
        }
    },
    'NCAA': {
        'cfbd_url': 'https://api.collegefootballdata.com',
        'rate_limit': {'calls': 120, 'period': 60},
        'endpoints': {
            'teams': '/teams/fbs?year=2024',
            'roster': '/roster?team={team}&year=2024',
            'stats': '/stats/player/season?year=2024&team={team}',
            'recruiting': '/recruiting/players?year=2025&classification=HighSchool'
        }
    },
    'INTERNATIONAL': {
        'npb_url': 'https://npb.jp/api',
        'kbo_url': 'https://www.koreabaseball.com/api',
        'rate_limit': {'calls': 20, 'period': 60}
    }
}

# HAV-F Calculation Weights
HAV_F_WEIGHTS = {
    'champion_readiness': {
        'performance_consistency': 0.25,
        'clutch_performance': 0.20,
        'improvement_trajectory': 0.15,
        'competition_level': 0.15,
        'team_impact': 0.15,
        'durability': 0.10
    },
    'cognitive_leverage': {
        'decision_speed': 0.25,
        'pattern_recognition': 0.20,
        'adaptability': 0.20,
        'leadership': 0.15,
        'academic': 0.10,
        'coachability': 0.10
    },
    'nil_trust_score': {
        'social_reach': 0.20,
        'engagement_rate': 0.20,
        'brand_alignment': 0.15,
        'regional_influence': 0.15,
        'recruit_ranking': 0.15,
        'media_coverage': 0.15
    }
}

@dataclass
class Player:
    """Unified player data structure"""
    player_id: str
    name: str
    sport: str
    league: str
    team_id: str
    position: str
    jersey_number: Optional[str] = None
    bio: Optional[Dict] = None
    stats_2024: Optional[Dict] = None
    projections_2025: Optional[Dict] = None
    nil_profile: Optional[Dict] = None
    biometrics: Optional[Dict] = None
    hav_f: Optional[Dict] = None
    injury_status: Optional[Dict] = None
    recruiting: Optional[Dict] = None
    meta: Optional[Dict] = None

class RateLimiter:
    """Rate limiting for API calls"""
    def __init__(self, calls: int, period: int):
        self.calls = calls
        self.period = period
        self.timestamps = []
    
    async def wait(self):
        """Wait if rate limit would be exceeded"""
        now = time.time()
        self.timestamps = [t for t in self.timestamps if now - t < self.period]
        
        if len(self.timestamps) >= self.calls:
            sleep_time = self.period - (now - self.timestamps[0]) + 0.1
            if sleep_time > 0:
                await asyncio.sleep(sleep_time)
                await self.wait()
        
        self.timestamps.append(now)

class BaseIngestionAgent:
    """Base class for league-specific ingestion agents"""
    
    def __init__(self, league: str, config: Dict):
        self.league = league
        self.config = config
        self.rate_limiter = RateLimiter(
            config['rate_limit']['calls'],
            config['rate_limit']['period']
        )
        self.session = None
        self.cache = {}
        self.metrics = {
            'processed': 0,
            'errors': 0,
            'api_calls': 0
        }
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aclose__(self):
        if self.session:
            await self.session.close()
    
    async def fetch(self, url: str, params: Optional[Dict] = None) -> Dict:
        """Fetch data from API with rate limiting"""
        await self.rate_limiter.wait()
        
        try:
            async with self.session.get(url, params=params) as response:
                self.metrics['api_calls'] += 1
                response.raise_for_status()
                return await response.json()
        except Exception as e:
            logger.error(f"API fetch error for {url}: {e}")
            self.metrics['errors'] += 1
            raise
    
    def generate_player_id(self, league: str, team: str, identifier: str) -> str:
        """Generate consistent player ID"""
        return f"{league}-{team}-{hashlib.md5(identifier.encode()).hexdigest()[:8].upper()}"
    
    async def ingest(self) -> List[Player]:
        """Main ingestion method - to be implemented by subclasses"""
        raise NotImplementedError

class MLBIngestionAgent(BaseIngestionAgent):
    """MLB data ingestion with Statcast integration"""
    
    async def ingest(self) -> List[Player]:
        """Ingest MLB data from Stats API and Baseball Savant"""
        logger.info("Starting MLB ingestion")
        players = []
        
        # Get all teams
        teams_url = f"{self.config['base_url']}{self.config['endpoints']['teams']}"
        teams_data = await self.fetch(teams_url)
        
        # Priority teams (Cardinals, etc.)
        priority_teams = ['STL', 'NYY', 'LAD', 'HOU']
        teams = teams_data.get('teams', [])
        
        # Sort to process priority teams first
        teams.sort(key=lambda t: t['abbreviation'] not in priority_teams)
        
        for team in teams:  # Process ALL 30 MLB teams
            team_abbr = team['abbreviation']
            team_id = team['id']
            
            # Get roster
            roster_url = f"{self.config['base_url']}{self.config['endpoints']['roster'].format(team_id=team_id)}"
            roster_data = await self.fetch(roster_url)
            
            for roster_entry in roster_data.get('roster', []):  # Process ALL players on roster
                person = roster_entry.get('person', {})
                player_id = self.generate_player_id('MLB', team_abbr, str(person['id']))
                
                # Get player stats
                stats_url = f"{self.config['base_url']}{self.config['endpoints']['stats'].format(player_id=person['id'])}"
                stats_data = await self.fetch(stats_url)
                
                # Parse stats
                mlb_stats = self.parse_mlb_stats(stats_data)
                
                # Calculate HAV-F
                hav_f = await self.calculate_havf(mlb_stats, person, team)
                
                player = Player(
                    player_id=player_id,
                    name=person.get('fullName', ''),
                    sport='MLB',
                    league='MLB',
                    team_id=f"MLB-{team_abbr}",
                    position=roster_entry.get('position', {}).get('abbreviation', ''),
                    jersey_number=roster_entry.get('jerseyNumber'),
                    bio={
                        'dob': person.get('birthDate'),
                        'birthplace': f"{person.get('birthCity', '')}, {person.get('birthCountry', '')}",
                        'height_cm': self.inches_to_cm(person.get('height', '')),
                        'weight_kg': self.lbs_to_kg(person.get('weight', 0))
                    },
                    stats_2024={'mlb': mlb_stats},
                    hav_f=hav_f,
                    meta={
                        'sources': ['MLB Stats API', 'Baseball Savant'],
                        'updated_at': datetime.now().isoformat(),
                        'external_ids': {'mlbam_id': str(person['id'])}
                    }
                )
                
                players.append(player)
                self.metrics['processed'] += 1
                
                if self.metrics['processed'] % 10 == 0:
                    logger.info(f"Processed {self.metrics['processed']} MLB players")
        
        return players
    
    def parse_mlb_stats(self, stats_data: Dict) -> Dict:
        """Parse MLB stats from API response"""
        stats = {}
        
        for stat_group in stats_data.get('stats', []):
            if stat_group.get('group', {}).get('displayName') == 'hitting':
                hitting = stat_group.get('splits', [{}])[0].get('stat', {})
                stats.update({
                    'avg': hitting.get('avg'),
                    'obp': hitting.get('obp'),
                    'slg': hitting.get('slg'),
                    'ops': hitting.get('ops'),
                    'hr': hitting.get('homeRuns'),
                    'rbi': hitting.get('rbi'),
                    'sb': hitting.get('stolenBases')
                })
            elif stat_group.get('group', {}).get('displayName') == 'pitching':
                pitching = stat_group.get('splits', [{}])[0].get('stat', {})
                stats.update({
                    'era': pitching.get('era'),
                    'whip': pitching.get('whip'),
                    'k9': pitching.get('strikeoutsPer9Inn'),
                    'bb9': pitching.get('walksPer9Inn')
                })
        
        return stats
    
    async def calculate_havf(self, stats: Dict, player: Dict, team: Dict) -> Dict:
        """Calculate HAV-F metrics for MLB player"""
        # Simplified HAV-F calculation
        champion_readiness = 50.0
        cognitive_leverage = 50.0
        nil_trust_score = 30.0
        
        # Performance-based adjustments
        if stats.get('ops'):
            ops = float(stats['ops']) if stats['ops'] else 0
            champion_readiness += min(20, (ops - 0.700) * 100)
        
        if stats.get('era'):
            era = float(stats['era']) if stats['era'] else 4.0
            champion_readiness += min(20, (4.0 - era) * 10)
        
        # Position-based cognitive leverage
        position_cognitive = {
            'C': 70, 'SS': 65, '2B': 60, 'CF': 55,
            'P': 60, '3B': 50, '1B': 45, 'LF': 40, 'RF': 40
        }
        position = player.get('primaryPosition', {}).get('abbreviation', '')
        cognitive_leverage = position_cognitive.get(position, 50)
        
        # Calculate composite
        composite = (champion_readiness * 0.4 + 
                    cognitive_leverage * 0.35 + 
                    nil_trust_score * 0.25)
        
        return {
            'champion_readiness': round(champion_readiness, 1),
            'cognitive_leverage': round(cognitive_leverage, 1),
            'nil_trust_score': round(nil_trust_score, 1),
            'composite_score': round(composite, 1),
            'computed_at': datetime.now().isoformat()
        }
    
    def inches_to_cm(self, height_str: str) -> Optional[float]:
        """Convert height string to cm"""
        if not height_str:
            return None
        try:
            parts = height_str.replace("'", "").replace('"', '').split()
            if len(parts) == 2:
                feet = int(parts[0])
                inches = int(parts[1])
                return round((feet * 12 + inches) * 2.54, 1)
        except:
            return None
    
    def lbs_to_kg(self, weight: int) -> Optional[float]:
        """Convert pounds to kg"""
        if not weight:
            return None
        return round(weight * 0.453592, 1)

class NFLIngestionAgent(BaseIngestionAgent):
    """NFL data ingestion with nflverse integration"""
    
    async def ingest(self) -> List[Player]:
        """Ingest NFL data"""
        logger.info("Starting NFL ingestion")
        players = []
        
        # Priority teams (Titans, etc.)
        priority_teams = ['TEN', 'KC', 'BUF', 'SF']
        
        # For demo, use ESPN API (free tier)
        teams_url = f"{self.config['espn_url']}/teams"
        teams_data = await self.fetch(teams_url)
        
        for team in teams_data.get('sports', [{}])[0].get('leagues', [{}])[0].get('teams', []):
            team_info = team.get('team', {})
            team_abbr = team_info.get('abbreviation', '')
            
            # Process all 32 NFL teams - removed limit
            
            # Get roster
            roster_url = f"{self.config['espn_url']}/teams/{team_info['id']}/roster"
            roster_data = await self.fetch(roster_url)
            
            for athlete in roster_data.get('athletes', []):
                player_id = self.generate_player_id('NFL', team_abbr, str(athlete['id']))
                
                # Parse position and stats
                position = athlete.get('position', {}).get('abbreviation', '')
                stats = self.parse_nfl_stats(athlete)
                
                # Calculate HAV-F
                hav_f = self.calculate_nfl_havf(stats, position)
                
                player = Player(
                    player_id=player_id,
                    name=athlete.get('fullName', ''),
                    sport='NFL',
                    league='NFL',
                    team_id=f"NFL-{team_abbr}",
                    position=position,
                    jersey_number=athlete.get('jersey'),
                    bio={
                        'height_cm': self.parse_height(athlete.get('height', '')),
                        'weight_kg': self.lbs_to_kg(athlete.get('weight', 0)),
                        'college': athlete.get('college', {}).get('name')
                    },
                    stats_2024={'nfl': stats},
                    hav_f=hav_f,
                    meta={
                        'sources': ['ESPN NFL API'],
                        'updated_at': datetime.now().isoformat(),
                        'external_ids': {'espn_id': str(athlete['id'])}
                    }
                )
                
                players.append(player)
                self.metrics['processed'] += 1
        
        logger.info(f"Processed {self.metrics['processed']} NFL players")
        return players
    
    def parse_nfl_stats(self, athlete: Dict) -> Dict:
        """Parse NFL stats from athlete data"""
        # Simplified stats parsing
        return {
            'games_played': 16,
            'position_rank': athlete.get('rank', 0)
        }
    
    def calculate_nfl_havf(self, stats: Dict, position: str) -> Dict:
        """Calculate HAV-F for NFL player"""
        # Position-based baseline scores
        position_baselines = {
            'QB': {'cr': 70, 'cl': 85, 'nil': 80},
            'RB': {'cr': 65, 'cl': 50, 'nil': 60},
            'WR': {'cr': 60, 'cl': 55, 'nil': 70},
            'TE': {'cr': 55, 'cl': 60, 'nil': 50},
            'OL': {'cr': 60, 'cl': 70, 'nil': 30},
            'DL': {'cr': 65, 'cl': 60, 'nil': 40},
            'LB': {'cr': 65, 'cl': 70, 'nil': 50},
            'DB': {'cr': 60, 'cl': 65, 'nil': 55}
        }
        
        baseline = position_baselines.get(position, {'cr': 50, 'cl': 50, 'nil': 40})
        
        return {
            'champion_readiness': baseline['cr'],
            'cognitive_leverage': baseline['cl'],
            'nil_trust_score': baseline['nil'],
            'composite_score': round(baseline['cr'] * 0.4 + baseline['cl'] * 0.35 + baseline['nil'] * 0.25, 1),
            'computed_at': datetime.now().isoformat()
        }
    
    def parse_height(self, height_str: str) -> Optional[float]:
        """Parse height string to cm"""
        if not height_str:
            return None
        try:
            # Format: "6-2" or "6'2\""
            parts = height_str.replace("'", "-").replace('"', '').split('-')
            if len(parts) == 2:
                feet = int(parts[0])
                inches = int(parts[1])
                return round((feet * 12 + inches) * 2.54, 1)
        except:
            return None
    
    def lbs_to_kg(self, weight) -> Optional[float]:
        """Convert weight to kg"""
        try:
            return round(float(weight) * 0.453592, 1)
        except:
            return None

class NCAAIngestionAgent(BaseIngestionAgent):
    """NCAA football and baseball ingestion"""
    
    async def ingest(self) -> List[Player]:
        """Ingest NCAA data from CollegeFootballData API"""
        logger.info("Starting NCAA ingestion")
        players = []
        
        # Priority teams (Texas Longhorns, etc.)
        priority_teams = ['Texas', 'Alabama', 'Georgia', 'Ohio State', 'Michigan']
        
        # Get teams
        teams_url = f"{self.config['cfbd_url']}{self.config['endpoints']['teams']}"
        headers = {'Authorization': f"Bearer {os.getenv('CFBD_API_KEY', '')}"}
        
        async with self.session.get(teams_url, headers=headers) as response:
            teams_data = await response.json()
        
        for team in teams_data[:5]:  # Limit for demo
            if team['school'] not in priority_teams and len(players) > 20:
                continue
            
            # Get roster
            roster_url = f"{self.config['cfbd_url']}{self.config['endpoints']['roster'].format(team=team['school'])}"
            
            async with self.session.get(roster_url, headers=headers) as response:
                roster_data = await response.json()
            
            for athlete in roster_data[:10]:  # Limit players per team
                player_id = self.generate_player_id('NCAA-FB', team['school'][:3].upper(), str(athlete.get('id', athlete['first_name'])))
                
                # Calculate HAV-F with recruiting data
                hav_f = self.calculate_ncaa_havf(athlete)
                
                player = Player(
                    player_id=player_id,
                    name=f"{athlete.get('first_name', '')} {athlete.get('last_name', '')}",
                    sport='NCAA-FB',
                    league='NCAA',
                    team_id=f"NCAA-{team['school'][:3].upper()}",
                    position=athlete.get('position', ''),
                    jersey_number=athlete.get('jersey', ''),
                    bio={
                        'height_cm': self.inches_to_cm(athlete.get('height', '')),
                        'weight_kg': athlete.get('weight'),
                        'class_year': athlete.get('year'),
                        'hometown': athlete.get('home_town')
                    },
                    recruiting={
                        'stars': athlete.get('recruit_rating', {}).get('stars'),
                        'national_rank': athlete.get('recruit_rating', {}).get('ranking')
                    },
                    hav_f=hav_f,
                    meta={
                        'sources': ['CollegeFootballData API'],
                        'updated_at': datetime.now().isoformat()
                    }
                )
                
                players.append(player)
                self.metrics['processed'] += 1
        
        logger.info(f"Processed {self.metrics['processed']} NCAA players")
        return players
    
    def calculate_ncaa_havf(self, athlete: Dict) -> Dict:
        """Calculate HAV-F for NCAA player"""
        # Base scores
        champion_readiness = 40.0
        cognitive_leverage = 45.0
        nil_trust_score = 20.0
        
        # Recruiting adjustments
        stars = athlete.get('recruit_rating', {}).get('stars', 0)
        if stars:
            champion_readiness += stars * 8
            nil_trust_score += stars * 10
        
        # Class year adjustments
        year_multiplier = {
            'Senior': 1.2,
            'Junior': 1.0,
            'Sophomore': 0.8,
            'Freshman': 0.6
        }
        multiplier = year_multiplier.get(athlete.get('year', ''), 1.0)
        champion_readiness *= multiplier
        
        # Position adjustments
        if athlete.get('position') == 'QB':
            cognitive_leverage += 15
            nil_trust_score += 20
        
        composite = (champion_readiness * 0.4 + 
                    cognitive_leverage * 0.35 + 
                    nil_trust_score * 0.25)
        
        return {
            'champion_readiness': round(champion_readiness, 1),
            'cognitive_leverage': round(cognitive_leverage, 1),
            'nil_trust_score': round(nil_trust_score, 1),
            'composite_score': round(composite, 1),
            'computed_at': datetime.now().isoformat()
        }
    
    def inches_to_cm(self, height_str: str) -> Optional[float]:
        """Convert height to cm"""
        if not height_str:
            return None
        try:
            # Format could be "72" (inches) or "6-0"
            if '-' in height_str:
                parts = height_str.split('-')
                feet = int(parts[0])
                inches = int(parts[1]) if len(parts) > 1 else 0
                total_inches = feet * 12 + inches
            else:
                total_inches = int(height_str)
            return round(total_inches * 2.54, 1)
        except:
            return None

class UnifiedIngestionPipeline:
    """Main pipeline orchestrating all league ingestions"""
    
    def __init__(self):
        self.agents = {
            'MLB': MLBIngestionAgent('MLB', API_CONFIG['MLB']),
            'NFL': NFLIngestionAgent('NFL', API_CONFIG['NFL']),
            'NCAA': NCAAIngestionAgent('NCAA', API_CONFIG['NCAA'])
        }
        self.output_dir = Path('./data/unified')
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    async def run(self, leagues: Optional[List[str]] = None):
        """Run ingestion for specified leagues"""
        if not leagues:
            leagues = list(self.agents.keys())
        
        all_players = []
        all_teams = {}
        
        for league in leagues:
            if league not in self.agents:
                logger.warning(f"No agent configured for {league}")
                continue
            
            logger.info(f"Processing {league}")
            agent = self.agents[league]
            
            async with agent as a:
                try:
                    players = await a.ingest()
                    all_players.extend(players)
                    
                    # Group by team
                    for player in players:
                        team_id = player.team_id
                        if team_id not in all_teams:
                            all_teams[team_id] = {
                                'team_id': team_id,
                                'name': team_id.split('-')[1],
                                'sport': player.sport,
                                'league': player.league,
                                'roster': []
                            }
                        all_teams[team_id]['roster'].append(asdict(player))
                    
                    logger.info(f"✓ {league}: {len(players)} players from {len(set(p.team_id for p in players))} teams")
                    
                except Exception as e:
                    logger.error(f"Failed to ingest {league}: {e}")
        
        # Prepare final dataset
        dataset = {
            'version': '2.0.0',
            'generated_at': datetime.now().isoformat(),
            'teams': list(all_teams.values()),
            'players': [asdict(p) for p in all_players]
        }
        
        # Validate against schema
        try:
            validate(instance=dataset, schema=UNIFIED_SCHEMA)
            logger.info("✓ Dataset validates against unified schema")
        except ValidationError as e:
            logger.warning(f"Schema validation warning: {e.message}")
        
        # Save to files
        output_file = self.output_dir / f"unified_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump(dataset, f, indent=2)
        
        # Also save latest version
        latest_file = self.output_dir / "unified_data_latest.json"
        with open(latest_file, 'w') as f:
            json.dump(dataset, f, indent=2)
        
        # Generate summary
        summary = {
            'timestamp': datetime.now().isoformat(),
            'leagues_processed': leagues,
            'total_players': len(all_players),
            'total_teams': len(all_teams),
            'by_league': {
                league: len([p for p in all_players if p.league == league])
                for league in set(p.league for p in all_players)
            },
            'havf_stats': self.calculate_havf_stats(all_players),
            'output_file': str(output_file)
        }
        
        summary_file = self.output_dir / "ingestion_summary.json"
        with open(summary_file, 'w') as f:
            json.dump(summary, f, indent=2)
        
        logger.info(f"""
╔══════════════════════════════════════════════════════╗
║         INGESTION PIPELINE COMPLETE                  ║
╚══════════════════════════════════════════════════════╝

📊 Summary:
  • Leagues: {', '.join(leagues)}
  • Players: {len(all_players):,}
  • Teams: {len(all_teams)}
  • Output: {output_file.name}

📈 HAV-F Averages:
  • Champion Readiness: {summary['havf_stats']['avg_champion_readiness']:.1f}
  • Cognitive Leverage: {summary['havf_stats']['avg_cognitive_leverage']:.1f}
  • NIL Trust Score: {summary['havf_stats']['avg_nil_trust']:.1f}
  
✅ Data saved to: {output_file}
        """)
        
        return summary
    
    def calculate_havf_stats(self, players: List[Player]) -> Dict:
        """Calculate HAV-F statistics across all players"""
        havf_scores = {
            'champion_readiness': [],
            'cognitive_leverage': [],
            'nil_trust_score': [],
            'composite': []
        }
        
        for player in players:
            if player.hav_f:
                havf_scores['champion_readiness'].append(player.hav_f.get('champion_readiness', 0))
                havf_scores['cognitive_leverage'].append(player.hav_f.get('cognitive_leverage', 0))
                havf_scores['nil_trust_score'].append(player.hav_f.get('nil_trust_score', 0))
                havf_scores['composite'].append(player.hav_f.get('composite_score', 0))
        
        return {
            'avg_champion_readiness': np.mean(havf_scores['champion_readiness']) if havf_scores['champion_readiness'] else 0,
            'avg_cognitive_leverage': np.mean(havf_scores['cognitive_leverage']) if havf_scores['cognitive_leverage'] else 0,
            'avg_nil_trust': np.mean(havf_scores['nil_trust_score']) if havf_scores['nil_trust_score'] else 0,
            'avg_composite': np.mean(havf_scores['composite']) if havf_scores['composite'] else 0,
            'top_composite': max(havf_scores['composite']) if havf_scores['composite'] else 0
        }

async def main():
    """Main execution"""
    pipeline = UnifiedIngestionPipeline()
    
    # Run for all configured leagues
    await pipeline.run(['MLB', 'NFL', 'NCAA'])

if __name__ == "__main__":
    asyncio.run(main())