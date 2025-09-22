#!/usr/bin/env python3
"""
NFL Data Ingestion Agent for Blaze Intelligence
"""

import json
import os
import sys
import argparse
from datetime import datetime, timezone
from typing import List, Dict, Any

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ingestion.havf import compute_all


class NFLAgent:
    def __init__(self):
        self.mock_path = os.path.join(os.path.dirname(__file__), 'mocks', 'nfl_mock.json')
        self.output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                                        'site', 'src', 'data', 'leagues', 'nfl.json')
    
    def fetch_raw(self, params: Dict[str, Any], live: bool = False) -> Dict[str, Any]:
        """Fetch raw NFL data"""
        if live and os.getenv('LIVE_FETCH') == '1':
            try:
                from ingestion.live_fetchers import NFLLiveFetcher
                fetcher = NFLLiveFetcher()
                team_abbr = params.get('team', 'TEN')
                
                stats = fetcher.get_player_stats("2024", team_abbr)
                print(f"Fetched {len(stats)} live NFL player stats")
                return {'players': stats}
                
            except Exception as e:
                print(f"Live NFL fetch failed: {e}, falling back to mocks")
        
        # Fall back to mock data
        try:
            with open(self.mock_path, 'r') as f:
                return json.load(f)
        except:
            return {'players': []}
    
    def normalize(self, raw: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Normalize to Blaze schema"""
        players = []
        now_iso = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
        
        for raw_player in raw.get('players', []):
            player = {
                'player_id': raw_player.get('id', f"NFL-{raw_player.get('name', '').replace(' ', '-')}"),
                'name': raw_player['name'],
                'sport': 'NFL',
                'league': 'NFL',
                'team_id': raw_player.get('team_id', 'NFL-TEN'),
                'position': raw_player.get('position', 'Unknown'),
                'bio': raw_player.get('bio', {}),
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
                    'sources': ['nflverse', 'nflfastR'],
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
                    'league': 'NFL',
                    'generated_at': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
                    'players': players
                }, f, indent=2)
            
            print(f"NFL Agent: Saved {len(players)} players")
            return True
        except Exception as e:
            print(f"NFL Agent failed: {e}")
            return False


def main():
    parser = argparse.ArgumentParser(description='NFL Data Ingestion Agent')
    parser.add_argument('--live', action='store_true')
    parser.add_argument('--mock', action='store_true')
    parser.add_argument('--team', default='TEN')
    args = parser.parse_args()
    
    agent = NFLAgent()
    success = agent.run({'team': args.team}, live=args.live)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()