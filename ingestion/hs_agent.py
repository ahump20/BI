#!/usr/bin/env python3
"""
High School Football Ingestion Agent for Blaze Intelligence
"""

import json
import os
import sys
import argparse
from typing import List, Dict, Any
import requests

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ingestion.havf import compute_all
from ingestion.time_utils import utc_now_isoformat


class HSAgent:
    def __init__(self):
        self.mock_path = os.path.join(os.path.dirname(__file__), 'mocks', 'hs_mock.json')
        self.output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                                        'site', 'src', 'data', 'leagues', 'hs.json')
    
    def fetch_raw(self, params: Dict[str, Any], live: bool = False) -> Dict[str, Any]:
        """Fetch raw HS data"""
        if live and os.getenv('LIVE_FETCH') == '1':
            base_url = os.getenv('HS_BASE_URL')
            api_key = os.getenv('HS_API_KEY')
            if base_url and api_key:
                try:
                    response = requests.get(
                        f"{base_url}/players",
                        params=params,
                        headers={"Authorization": f"Bearer {api_key}"},
                        timeout=30,
                    )
                    response.raise_for_status()
                    return response.json()
                except Exception as e:
                    print(f"Live HS fetch failed: {e}, falling back to mocks")
            else:
                print("HS_BASE_URL or HS_API_KEY not set, using mocks")

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
                'player_id': raw_player.get('id', f"HS-{raw_player.get('name', '').replace(' ', '-')}"),
                'name': raw_player['name'],
                'sport': 'HS-FB',
                'league': 'Texas High School Football',
                'team_id': raw_player.get('team_id', 'HS-TEX'),
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
                'nil_profile': raw_player.get('nil_profile'),
                'biometrics': raw_player.get('biometrics'),
                'hav_f': {},
                'meta': {
                    'sources': ['Texas HS Football Data'],
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
                    'league': 'HS-FB',
                    'generated_at': utc_now_isoformat(),
                    'players': players
                }, f, indent=2)
            
            print(f"HS Agent: Saved {len(players)} players")
            return True
        except Exception as e:
            print(f"HS Agent failed: {e}")
            return False


def main():
    parser = argparse.ArgumentParser(description='HS Data Ingestion Agent')
    parser.add_argument('--live', action='store_true')
    parser.add_argument('--mock', action='store_true')
    args = parser.parse_args()
    
    agent = HSAgent()
    success = agent.run({}, live=args.live)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
