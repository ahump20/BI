#!/usr/bin/env python3
"""
HAV-F computation tests for Blaze Intelligence
"""

import unittest
import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ingestion.havf import (
    compute_champion_readiness,
    compute_cognitive_leverage, 
    compute_nil_trust,
    compute_all
)


class TestHAVF(unittest.TestCase):
    """Test HAV-F computation functions"""
    
    def test_champion_readiness_mlb_player(self):
        """Test champion readiness for MLB player"""
        player = {
            'sport': 'MLB',
            'stats': {
                'season': '2024',
                'perfs': {
                    'war': 2.5,
                    'wpa': 1.8,
                    'avg': 0.285
                }
            },
            'biometrics': {
                'hrv_rmssd_ms': 60.0,
                'reaction_ms': 160.0,
                'sleep_hours': 8.0
            },
            'bio': {
                'dob': '1995-06-15'  # ~29 years old
            }
        }
        
        score = compute_champion_readiness(player)
        self.assertIsNotNone(score)
        self.assertGreaterEqual(score, 0)
        self.assertLessEqual(score, 100)
        self.assertGreater(score, 50)  # Should be above average
    
    def test_champion_readiness_nfl_player(self):
        """Test champion readiness for NFL player"""
        player = {
            'sport': 'NFL',
            'stats': {
                'season': '2024',
                'perfs': {
                    'epa': 25.5,
                    'total_yards': 1200,
                    'total_tds': 12
                }
            },
            'biometrics': {
                'hrv_rmssd_ms': 55.0,
                'reaction_ms': 145.0,
                'sleep_hours': 8.5
            }
        }
        
        score = compute_champion_readiness(player)
        self.assertIsNotNone(score)
        self.assertGreaterEqual(score, 0)
        self.assertLessEqual(score, 100)
    
    def test_champion_readiness_no_biometrics(self):
        """Test champion readiness defaults when biometrics missing"""
        player = {
            'sport': 'MLB',
            'stats': {
                'season': '2024', 
                'perfs': {
                    'war': 1.5,
                    'wpa': 0.8
                }
            }
        }
        
        score = compute_champion_readiness(player)
        self.assertIsNotNone(score)
        # Should still compute with default physical score
    
    def test_cognitive_leverage_with_biometrics(self):
        """Test cognitive leverage computation"""
        player = {
            'biometrics': {
                'hrv_rmssd_ms': 65.0,  # High HRV (good)
                'reaction_ms': 140.0,  # Low reaction time (good)
                'gsr_microsiemens': 2.5  # Low GSR (good)
            }
        }
        
        score = compute_cognitive_leverage(player)
        self.assertIsNotNone(score)
        self.assertGreaterEqual(score, 0)
        self.assertLessEqual(score, 100)
        self.assertGreater(score, 60)  # Should be high with good metrics
    
    def test_cognitive_leverage_no_biometrics(self):
        """Test cognitive leverage returns default when no biometrics"""
        player = {
            'sport': 'MLB',
            'name': 'Test Player'
        }
        
        score = compute_cognitive_leverage(player)
        # Should return default score of 25.0 based on updated havf.py
        self.assertEqual(score, 25.0)
    
    def test_nil_trust_with_profile(self):
        """Test NIL trust score computation"""
        player = {
            'nil_profile': {
                'valuation_usd': 500000,
                'engagement_rate': 0.045,  # 4.5% engagement
                'followers_total': 150000,
                'deals_last_90d': 8,
                'deal_value_90d_usd': 75000,
                'search_index': 72.0,
                'local_popularity_index': 85.0
            }
        }
        
        score = compute_nil_trust(player)
        self.assertIsNotNone(score)
        self.assertGreaterEqual(score, 0)
        self.assertLessEqual(score, 100)
        self.assertGreater(score, 30)  # Should be above default (15.0)
    
    def test_nil_trust_no_profile(self):
        """Test NIL trust returns default when no profile"""
        player = {
            'sport': 'MLB',
            'name': 'Test Player'
        }
        
        score = compute_nil_trust(player)
        # Should return default score of 15.0 based on updated havf.py
        self.assertEqual(score, 15.0)
    
    def test_compute_all_integration(self):
        """Test compute_all function"""
        players = [
            {
                'player_id': 'TEST-001',
                'name': 'Test Player 1',
                'sport': 'MLB',
                'team_id': 'MLB-STL',
                'position': '1B',
                'stats': {
                    'season': '2024',
                    'perfs': {'war': 2.0, 'wpa': 1.2}
                },
                'biometrics': {
                    'hrv_rmssd_ms': 58.0,
                    'reaction_ms': 155.0
                },
                'hav_f': {},
                'meta': {}
            },
            {
                'player_id': 'TEST-002', 
                'name': 'Test Player 2',
                'sport': 'NFL',
                'team_id': 'NFL-TEN',
                'position': 'RB',
                'stats': {
                    'season': '2024',
                    'perfs': {'epa': 15.5, 'total_yards': 950, 'total_tds': 8}
                },
                'nil_profile': {
                    'valuation_usd': 250000,
                    'engagement_rate': 0.035
                },
                'hav_f': {},
                'meta': {}
            }
        ]
        
        # Run compute_all
        compute_all(players)
        
        # Check that HAV-F was computed
        for player in players:
            self.assertIn('hav_f', player)
            hav_f = player['hav_f']
            
            # Check that scores are in valid range
            for metric in ['champion_readiness', 'cognitive_leverage', 'nil_trust_score']:
                if metric in hav_f and hav_f[metric] is not None:
                    self.assertGreaterEqual(hav_f[metric], 0)
                    self.assertLessEqual(hav_f[metric], 100)
            
            # Check timestamp was added
            self.assertIn('last_computed_at', hav_f)
            self.assertIsNotNone(hav_f['last_computed_at'])
    
    def test_score_ordering(self):
        """Test that better metrics produce higher scores"""
        # High performance player
        high_player = {
            'sport': 'MLB',
            'stats': {'season': '2024', 'perfs': {'war': 5.0, 'wpa': 3.5}},
            'biometrics': {
                'hrv_rmssd_ms': 70.0,
                'reaction_ms': 130.0,
                'sleep_hours': 8.5
            }
        }
        
        # Average performance player  
        avg_player = {
            'sport': 'MLB', 
            'stats': {'season': '2024', 'perfs': {'war': 1.0, 'wpa': 0.5}},
            'biometrics': {
                'hrv_rmssd_ms': 45.0,
                'reaction_ms': 180.0,
                'sleep_hours': 6.5
            }
        }
        
        high_score = compute_champion_readiness(high_player)
        avg_score = compute_champion_readiness(avg_player)
        
        self.assertIsNotNone(high_score)
        self.assertIsNotNone(avg_score) 
        self.assertGreater(high_score, avg_score)


if __name__ == '__main__':
    unittest.main()
