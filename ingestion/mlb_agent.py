#!/usr/bin/env python3
"""
MLB Data Ingestion Agent for Blaze Intelligence
"""

import json
import os
import sys
import argparse
from datetime import datetime
from typing import List, Dict, Any

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ingestion.havf import compute_all


class MLBAgent:
    def __init__(self):
        self.mock_path = os.path.join(os.path.dirname(__file__), 'mocks', 'mlb_mock.json')
        self.output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                                        'site', 'src', 'data', 'leagues', 'mlb.json')
    
    def fetch_raw(self, params: Dict[str, Any], live: bool = False) -> Dict[str, Any]:
        """Fetch raw MLB data"""
        if live and os.getenv('LIVE_FETCH') == '1':
            try:
                from ingestion.live_fetchers import MLBLiveFetcher
                fetcher = MLBLiveFetcher()
                team_abbr = params.get('team', 'STL')
                
                roster = fetcher.get_team_roster(team_abbr)
                players = []
                
                for player_info in roster[:5]:  # Limit to 5 players for demo
                    player_id = player_info.get('person', {}).get('id')
                    if player_id:
                        stats = fetcher.get_player_stats(str(player_id))
                        
                        # Convert live data to mock format
                        player = {
                            'id': f"MLB-{team_abbr}-{player_info.get('person', {}).get('fullName', '').replace(' ', '-').lower()}",
                            'name': player_info.get('person', {}).get('fullName', 'Unknown'),
                            'team_id': f"MLB-{team_abbr}",
                            'position': player_info.get('position', {}).get('abbreviation', 'Unknown'),
                            'stats': self._extract_live_stats(stats),
                            'biometrics': None,  # Not available from MLB API
                            'projections': {}
                        }
                        players.append(player)
                
                print(f"Fetched {len(players)} live MLB players")
                return {'players': players}
                
            except Exception as e:
                print(f"Live MLB fetch failed: {e}, falling back to mocks")
        
        # Fall back to mock data
        try:
            with open(self.mock_path, 'r') as f:
                return json.load(f)
        except:
            return {'players': []}
    
    def _extract_live_stats(self, stats_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract stats from live MLB API response"""
        stats = {}
        
        # Look for hitting/batting stats
        for stat_group in stats_data.get('stats', []):
            for split in stat_group.get('splits', []):
                stat = split.get('stat', {})
                
                if 'avg' in stat:
                    stats['avg'] = float(stat['avg'])
                if 'homeRuns' in stat:
                    stats['hr'] = int(stat['homeRuns'])
                if 'rbi' in stat:
                    stats['rbi'] = int(stat['rbi'])
                if 'era' in stat:
                    stats['era'] = float(stat['era'])
                if 'strikeOuts' in stat:
                    stats['k'] = int(stat['strikeOuts'])
        
        return stats
    
    def normalize(self, raw: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Normalize to Blaze schema"""
        players = []
        now_iso = datetime.utcnow().isoformat() + 'Z'
        
        for raw_player in raw.get('players', []):
            player = {
                'player_id': raw_player.get('id', f"MLB-{raw_player.get('name', '').replace(' ', '-')}"),
                'name': raw_player['name'],
                'sport': 'MLB',
                'league': 'MLB',
                'team_id': raw_player.get('team_id', 'MLB-STL'),
                'position': raw_player.get('position', 'Unknown'),
                'bio': {
                    'dob': raw_player.get('dob'),
                    'height_cm': raw_player.get('height_cm'),
                    'weight_kg': raw_player.get('weight_kg'),
                    'class_year': None  # MLB doesn't have class years
                },
                'stats': {
                    'season': '2024',
                    'perfs': raw_player.get('stats', {})
                },
                'projections': {
                    'season': '2025',
                    'model': None,
                    'values': raw_player.get('projections', {})
                },
                'nil_profile': raw_player.get('nil_profile'),
                'biometrics': raw_player.get('biometrics'),
                'hav_f': {},
                'meta': {
                    'sources': ['Statcast', 'Baseball Savant'],
                    'updated_at': now_iso
                }
            }
            players.append(player)
        
        return players
    
    def run(self, params: Dict[str, Any], live: bool = False) -> bool:
        """Run pipeline"""
        try:
            raw = self.fetch_raw(params, live)
            players = self.normalize(raw)
            compute_all(players)
            
            # Save
            os.makedirs(os.path.dirname(self.output_path), exist_ok=True)
            with open(self.output_path, 'w') as f:
                json.dump({
                    'league': 'MLB',
                    'generated_at': datetime.utcnow().isoformat() + 'Z',
                    'players': players
                }, f, indent=2)
            
            print(f"MLB Agent: Saved {len(players)} players")
            return True
        except Exception as e:
            print(f"MLB Agent failed: {e}")
            return False


def main():
    parser = argparse.ArgumentParser(description='MLB Data Ingestion Agent')
    parser.add_argument('--live', action='store_true')
    parser.add_argument('--mock', action='store_true')
    parser.add_argument('--team', default='STL')
    args = parser.parse_args()
    
    agent = MLBAgent()
    success = agent.run({'team': args.team}, live=args.live)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()