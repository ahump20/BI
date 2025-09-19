#!/usr/bin/env python3
"""
International Baseball Ingestion Agent for Blaze Intelligence
Covers KBO (Korea), NPB (Japan), and Latin American prospects
"""

import json
import os
import sys
import argparse
from typing import List, Dict, Any

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ingestion.havf import compute_all
from ingestion.time_utils import utc_now_isoformat


class InternationalAgent:
    def __init__(self):
        self.mock_path = os.path.join(os.path.dirname(__file__), 'mocks', 'intl_mock.json')
        self.output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                                        'site', 'src', 'data', 'leagues', 'intl.json')
    
    def fetch_raw(self, params: Dict[str, Any], live: bool = False) -> Dict[str, Any]:
        """Fetch raw International data"""
        if live and os.getenv('LIVE_FETCH') == '1':
            print("Live International fetching not implemented, using mocks")
        
        try:
            with open(self.mock_path, 'r') as f:
                return json.load(f)
        except:
            return {'players': []}
    
    def normalize(self, raw: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Normalize to Blaze schema"""
        players = []
        now_iso = utc_now_isoformat()
        
        for raw_player in raw.get('players', []):
            player = {
                'player_id': raw_player.get('id', f"INTL-{raw_player.get('name', '').replace(' ', '-')}"),
                'name': raw_player['name'],
                'sport': 'Baseball',
                'league': raw_player.get('league', 'KBO'),
                'team_id': raw_player.get('team_id', 'KBO-KIA'),
                'position': raw_player.get('position', 'Unknown'),
                'bio': {
                    'dob': raw_player.get('dob'),
                    'height_cm': raw_player.get('height_cm'),
                    'weight_kg': raw_player.get('weight_kg'),
                    'class_year': None  # Professional leagues
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
                    'sources': ['KBO', 'NPB', 'Latin American Scouts'],
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
                    'league': 'International',
                    'generated_at': utc_now_isoformat(),
                    'players': players
                }, f, indent=2)
            
            print(f"International Agent: Saved {len(players)} players")
            return True
        except Exception as e:
            print(f"International Agent failed: {e}")
            return False


def main():
    parser = argparse.ArgumentParser(description='International Data Ingestion Agent')
    parser.add_argument('--live', action='store_true')
    parser.add_argument('--mock', action='store_true')
    parser.add_argument('--league', default='KBO', choices=['KBO', 'NPB', 'LIDOM'])
    args = parser.parse_args()
    
    agent = InternationalAgent()
    success = agent.run({'league': args.league}, live=args.live)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
