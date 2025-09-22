#!/usr/bin/env python3
"""
NCAA Data Ingestion Agent for Blaze Intelligence
Focus: Texas Longhorns and top college programs
"""

import json
import os
import sys
import argparse
from datetime import datetime, timezone
from typing import List, Dict, Any

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ingestion.havf import compute_all


class NCAAAgent:
    def __init__(self):
        self.mock_path = os.path.join(os.path.dirname(__file__), 'mocks', 'ncaa_mock.json')
        self.output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                                        'site', 'src', 'data', 'leagues', 'ncaa.json')
    
    def fetch_raw(self, params: Dict[str, Any], live: bool = False) -> Dict[str, Any]:
        """Fetch raw NCAA data"""
        if live and os.getenv('LIVE_FETCH') == '1':
            # Would fetch from CollegeFootballData API
            print("Live NCAA fetching not implemented, using mocks")
        
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
                'player_id': raw_player.get('id', f"NCAA-{raw_player.get('name', '').replace(' ', '-')}"),
                'name': raw_player['name'],
                'sport': raw_player.get('sport', 'Football'),
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
                    'model': 'draft',
                    'values': raw_player.get('projections', {})
                },
                'nil_profile': raw_player.get('nil_profile'),
                'biometrics': raw_player.get('biometrics'),
                'hav_f': {},
                'meta': {
                    'sources': ['CollegeFootballData', 'NCAA'],
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
                    'league': 'NCAA',
                    'generated_at': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
                    'players': players
                }, f, indent=2)
            
            print(f"NCAA Agent: Saved {len(players)} players")
            return True
        except Exception as e:
            print(f"NCAA Agent failed: {e}")
            return False


def main():
    parser = argparse.ArgumentParser(description='NCAA Data Ingestion Agent')
    parser.add_argument('--live', action='store_true')
    parser.add_argument('--mock', action='store_true')
    parser.add_argument('--team', default='TEX')
    args = parser.parse_args()
    
    agent = NCAAAgent()
    success = agent.run({'team': args.team}, live=args.live)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()