#!/usr/bin/env python3
"""
Normalizer tests for Blaze Intelligence agents
"""

import unittest
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ingestion.mlb_agent import MLBAgent
from ingestion.nfl_agent import NFLAgent
from ingestion.ncaa_agent import NCAAAgent
from ingestion.hs_agent import HSAgent
from ingestion.nil_agent import NILAgent
from ingestion.intl_agent import InternationalAgent


class TestNormalizers(unittest.TestCase):
    """Test agent normalizer functions"""
    
    def test_mlb_normalizer(self):
        """Test MLB agent normalizer"""
        agent = MLBAgent()
        
        # Test data mimicking MLB API structure
        raw_data = {
            'players': [
                {
                    'id': 'MLB-STL-test',
                    'name': 'Test Player',
                    'team_id': 'MLB-STL',
                    'position': '1B',
                    'stats': {
                        'avg': 0.285,
                        'hr': 25,
                        'war': 2.1
                    },
                    'biometrics': {
                        'hrv_rmssd_ms': 58.5
                    }
                }
            ]
        }
        
        players = agent.normalize(raw_data)
        
        self.assertEqual(len(players), 1)
        player = players[0]
        
        # Check required fields
        self.assertIn('player_id', player)
        self.assertIn('name', player)
        self.assertIn('sport', player)
        self.assertIn('team_id', player)
        self.assertIn('position', player)
        
        # Check MLB-specific
        self.assertEqual(player['sport'], 'MLB')
        self.assertEqual(player['league'], 'MLB')
        
        # Check stats structure
        self.assertIn('stats', player)
        self.assertEqual(player['stats']['season'], '2024')
        self.assertIn('perfs', player['stats'])
        
        # Check meta
        self.assertIn('meta', player)
        self.assertIn('sources', player['meta'])
        self.assertIn('updated_at', player['meta'])
    
    def test_nfl_normalizer(self):
        """Test NFL agent normalizer"""
        agent = NFLAgent()
        
        raw_data = {
            'players': [
                {
                    'id': 'NFL-TEN-test',
                    'name': 'Test Player',
                    'team_id': 'NFL-TEN',
                    'position': 'RB',
                    'bio': {
                        'dob': '1995-01-15',
                        'height_cm': 183,
                        'weight_kg': 95
                    },
                    'stats': {
                        'rushing_yards': 1200,
                        'rushing_tds': 8,
                        'epa': 15.5
                    }
                }
            ]
        }
        
        players = agent.normalize(raw_data)
        
        self.assertEqual(len(players), 1)
        player = players[0]
        
        self.assertEqual(player['sport'], 'NFL')
        self.assertEqual(player['league'], 'NFL')
        self.assertIn('bio', player)
        self.assertEqual(player['bio']['dob'], '1995-01-15')
    
    def test_ncaa_normalizer(self):
        """Test NCAA agent normalizer"""
        agent = NCAAAgent()
        
        raw_data = {
            'players': [
                {
                    'id': 'NCAA-TEX-test',
                    'name': 'Test Player',
                    'team_id': 'NCAA-TEX',
                    'position': 'QB',
                    'sport': 'Football',
                    'class_year': '2025',
                    'stats': {
                        'passing_yards': 3200,
                        'passing_tds': 28
                    },
                    'nil_profile': {
                        'valuation_usd': 750000,
                        'engagement_rate': 0.055
                    }
                }
            ]
        }
        
        players = agent.normalize(raw_data)
        
        self.assertEqual(len(players), 1)
        player = players[0]
        
        self.assertEqual(player['sport'], 'Football')
        self.assertEqual(player['league'], 'NCAA')
        self.assertIn('bio', player)
        self.assertEqual(player['bio']['class_year'], '2025')
        self.assertIn('nil_profile', player)
    
    def test_hs_normalizer(self):
        """Test High School agent normalizer"""
        agent = HSAgent()
        
        raw_data = {
            'players': [
                {
                    'id': 'HS-TEX-test',
                    'name': 'Test Player',
                    'team_id': 'HS-TEX-WESTLAKE',
                    'position': 'QB',
                    'class_year': '2026',
                    'stats': {
                        'passing_yards': 2400,
                        'rushing_yards': 450
                    }
                }
            ]
        }
        
        players = agent.normalize(raw_data)
        
        self.assertEqual(len(players), 1)
        player = players[0]
        
        self.assertEqual(player['sport'], 'HS-FB')
        self.assertEqual(player['league'], 'Texas High School Football')
        self.assertEqual(player['bio']['class_year'], '2026')
    
    def test_nil_normalizer(self):
        """Test NIL agent normalizer"""
        agent = NILAgent()
        
        raw_data = {
            'players': [
                {
                    'id': 'NIL-TEX-test',
                    'name': 'Test Player',
                    'team_id': 'NCAA-TEX',
                    'position': 'QB',
                    'sport': 'NCAA-FB',
                    'nil_profile': {
                        'valuation_usd': 1500000,
                        'engagement_rate': 0.067,
                        'followers_total': 400000,
                        'deals_last_90d': 12
                    }
                }
            ]
        }
        
        players = agent.normalize(raw_data)
        
        self.assertEqual(len(players), 1)
        player = players[0]
        
        self.assertEqual(player['sport'], 'NCAA-FB')
        self.assertIn('nil_profile', player)
        nil_profile = player['nil_profile']
        self.assertEqual(nil_profile['valuation_usd'], 1500000)
        self.assertGreater(nil_profile['engagement_rate'], 0.05)
    
    def test_intl_normalizer(self):
        """Test International agent normalizer"""
        agent = InternationalAgent()
        
        raw_data = {
            'players': [
                {
                    'id': 'INTL-KBO-test',
                    'name': 'Test Player',
                    'team_id': 'KBO-KIA',
                    'position': '1B',
                    'league': 'KBO',
                    'stats': {
                        'avg': 0.312,
                        'hr': 28,
                        'ops': 0.895
                    }
                }
            ]
        }
        
        players = agent.normalize(raw_data)
        
        self.assertEqual(len(players), 1)
        player = players[0]
        
        self.assertEqual(player['sport'], 'Baseball')
        self.assertEqual(player['league'], 'KBO')
        self.assertEqual(player['team_id'], 'KBO-KIA')
    
    def test_all_normalizers_have_required_fields(self):
        """Test that all normalizers produce players with required fields"""
        agents_and_data = [
            (MLBAgent(), {'players': [{'id': 'test', 'name': 'Test', 'team_id': 'MLB-STL', 'position': '1B'}]}),
            (NFLAgent(), {'players': [{'id': 'test', 'name': 'Test', 'team_id': 'NFL-TEN', 'position': 'RB'}]}),
            (NCAAAgent(), {'players': [{'id': 'test', 'name': 'Test', 'team_id': 'NCAA-TEX', 'position': 'QB'}]}),
            (HSAgent(), {'players': [{'id': 'test', 'name': 'Test', 'team_id': 'HS-TEX', 'position': 'QB'}]}),
            (NILAgent(), {'players': [{'id': 'test', 'name': 'Test', 'team_id': 'NCAA-TEX', 'position': 'QB'}]}),
            (InternationalAgent(), {'players': [{'id': 'test', 'name': 'Test', 'team_id': 'KBO-KIA', 'position': '1B'}]})
        ]
        
        required_fields = ['player_id', 'name', 'sport', 'team_id', 'position']
        
        for agent, raw_data in agents_and_data:
            with self.subTest(agent=agent.__class__.__name__):
                players = agent.normalize(raw_data)
                self.assertGreater(len(players), 0)
                
                for player in players:
                    for field in required_fields:
                        self.assertIn(field, player, f"Missing {field} in {agent.__class__.__name__}")
                    
                    # Check structure fields exist
                    self.assertIn('stats', player)
                    self.assertIn('meta', player)
                    self.assertIn('hav_f', player)


if __name__ == '__main__':
    unittest.main()
