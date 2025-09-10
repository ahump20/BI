#!/usr/bin/env python3
"""
Schema validation tests for Blaze Intelligence
"""

import json
import os
import sys
import unittest
from typing import Dict, Any

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    import jsonschema
except ImportError:
    print("jsonschema not available, using basic validation")
    jsonschema = None


class TestSchemaValidation(unittest.TestCase):
    """Test that all generated players conform to schema"""
    
    def setUp(self):
        self.schema_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'schemas', 'player.schema.json')
        self.leagues_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'site', 'src', 'data', 'leagues')
        
        # Load schema
        with open(self.schema_path, 'r') as f:
            self.schema = json.load(f)
    
    def test_schema_loads(self):
        """Test that schema file loads correctly"""
        self.assertIsInstance(self.schema, dict)
        self.assertIn('properties', self.schema)
        self.assertIn('required', self.schema)
    
    def test_required_fields_present(self):
        """Test that required fields are defined in schema"""
        required = self.schema['required']
        expected = ['player_id', 'name', 'sport', 'team_id', 'position']
        
        for field in expected:
            self.assertIn(field, required)
    
    def test_hav_f_bounds(self):
        """Test that HAV-F metrics have proper bounds"""
        hav_f_props = self.schema['properties']['hav_f']['properties']
        
        for metric in ['champion_readiness', 'cognitive_leverage', 'nil_trust_score']:
            self.assertIn(metric, hav_f_props)
            if 'minimum' in hav_f_props[metric]:
                self.assertEqual(hav_f_props[metric]['minimum'], 0)
            if 'maximum' in hav_f_props[metric]:
                self.assertEqual(hav_f_props[metric]['maximum'], 100)
    
    def validate_player(self, player: Dict[str, Any]) -> bool:
        """Validate a single player against schema"""
        if jsonschema is None:
            # Basic validation without jsonschema
            required_fields = self.schema['required']
            for field in required_fields:
                if field not in player:
                    return False
            
            # Check HAV-F bounds
            if 'hav_f' in player and player['hav_f']:
                for metric in ['champion_readiness', 'cognitive_leverage', 'nil_trust_score']:
                    value = player['hav_f'].get(metric)
                    if value is not None:
                        if not (0 <= value <= 100):
                            return False
            return True
        else:
            try:
                jsonschema.validate(player, self.schema)
                return True
            except jsonschema.ValidationError:
                return False
    
    def test_league_files_exist(self):
        """Test that league files can be found"""
        if not os.path.exists(self.leagues_dir):
            self.skipTest("Leagues directory not found - run agents first")
        
        league_files = [f for f in os.listdir(self.leagues_dir) if f.endswith('.json')]
        self.assertGreater(len(league_files), 0, "No league files found")
    
    def test_all_players_validate(self):
        """Test that all players in league files validate against schema"""
        if not os.path.exists(self.leagues_dir):
            self.skipTest("Leagues directory not found - run agents first")
        
        total_players = 0
        invalid_players = 0
        
        for filename in os.listdir(self.leagues_dir):
            if not filename.endswith('.json'):
                continue
                
            filepath = os.path.join(self.leagues_dir, filename)
            
            try:
                with open(filepath, 'r') as f:
                    league_data = json.load(f)
                
                players = league_data.get('players', [])
                
                for i, player in enumerate(players):
                    total_players += 1
                    if not self.validate_player(player):
                        invalid_players += 1
                        print(f"Invalid player in {filename}: {player.get('name', f'index_{i}')}")
                        
            except (json.JSONDecodeError, FileNotFoundError) as e:
                self.fail(f"Could not load {filename}: {e}")
        
        print(f"Validated {total_players} players, {invalid_players} invalid")
        self.assertEqual(invalid_players, 0, f"{invalid_players} players failed validation")


if __name__ == '__main__':
    unittest.main()
