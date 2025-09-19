#!/usr/bin/env python3
"""
NIL (Name, Image, Likeness) Ingestion Agent for Blaze Intelligence
"""

import json
import os
import sys
import argparse
from typing import List, Dict, Any

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ingestion.havf import compute_all
from ingestion.time_utils import utc_now_isoformat


class NILAgent:
    def __init__(self):
        self.mock_path = os.path.join(os.path.dirname(__file__), 'mocks', 'nil_mock.json')
        self.output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                                        'site', 'src', 'data', 'leagues', 'nil.json')
    
    def fetch_raw(self, params: Dict[str, Any], live: bool = False) -> Dict[str, Any]:
        """Fetch raw NIL data"""
        if live and os.getenv('LIVE_FETCH') == '1':
            print("Live NIL fetching not implemented, using mocks")
        
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
                'player_id': raw_player.get('id', f"NIL-{raw_player.get('name', '').replace(' ', '-')}"),
                'name': raw_player['name'],
                'sport': raw_player.get('sport', 'NCAA-FB'),
                'league': 'NCAA',
                'team_id': raw_player.get('team_id', 'NCAA-TEX'),
                'position': raw_player.get('position', 'Unknown'),
                'bio': {
                    'dob': raw_player.get('dob'),
                    'height_cm': raw_player.get('height_cm'),
                    'weight_kg': raw_player.get('weight_kg'),
                    'class_year': raw_player.get('class_year')
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
                'nil_profile': raw_player.get('nil_profile', {}),
                'biometrics': raw_player.get('biometrics'),
                'hav_f': {},
                'meta': {
                    'sources': ['NIL Database', 'Social Media Analytics'],
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
                    'league': 'NIL',
                    'generated_at': utc_now_isoformat(),
                    'players': players
                }, f, indent=2)
            
            print(f"NIL Agent: Saved {len(players)} players")
            return True
        except Exception as e:
            print(f"NIL Agent failed: {e}")
            return False


def main():
    parser = argparse.ArgumentParser(description='NIL Data Ingestion Agent')
    parser.add_argument('--live', action='store_true')
    parser.add_argument('--mock', action='store_true')
    args = parser.parse_args()
    
    agent = NILAgent()
    success = agent.run({}, live=args.live)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
