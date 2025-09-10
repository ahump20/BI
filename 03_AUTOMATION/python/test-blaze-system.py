#!/usr/bin/env python3
"""
Test script for Blaze Intelligence comprehensive system
"""

import json
import asyncio
from datetime import datetime
from pathlib import Path
import sys

# Mock data generator
def generate_mock_data():
    """Generate mock dataset for testing"""
    
    # Mock teams
    teams = [
        {
            "team_id": "MLB-STL",
            "name": "St. Louis Cardinals",
            "full_name": "St. Louis Cardinals",
            "sport": "MLB",
            "league": "MLB",
            "division": "NL Central",
            "location": {
                "city": "St. Louis",
                "state": "Missouri",
                "country": "USA",
                "venue": "Busch Stadium",
                "timezone": "America/Chicago"
            },
            "season_2024": {
                "wins": 83,
                "losses": 79,
                "ties": 0,
                "win_pct": 0.512,
                "playoff_seed": None
            },
            "roster": [],
            "analytics": {
                "team_havf_avg": 72.4,
                "offense_rating": 98.2,
                "defense_rating": 91.7
            },
            "meta": {
                "sources": ["MLB Stats API"],
                "updated_at": datetime.now().isoformat()
            }
        },
        {
            "team_id": "NFL-TEN",
            "name": "Tennessee Titans",
            "full_name": "Tennessee Titans",
            "sport": "NFL",
            "league": "NFL",
            "division": "AFC South",
            "location": {
                "city": "Nashville",
                "state": "Tennessee",
                "country": "USA",
                "venue": "Nissan Stadium",
                "timezone": "America/Chicago"
            },
            "season_2024": {
                "wins": 3,
                "losses": 14,
                "ties": 0,
                "win_pct": 0.176
            },
            "roster": [],
            "meta": {
                "sources": ["ESPN NFL API"],
                "updated_at": datetime.now().isoformat()
            }
        },
        {
            "team_id": "NCAA-TEX",
            "name": "Texas Longhorns",
            "full_name": "University of Texas Longhorns",
            "sport": "NCAA-FB",
            "league": "NCAA",
            "division": "SEC",
            "location": {
                "city": "Austin",
                "state": "Texas",
                "country": "USA",
                "venue": "Darrell K Royal Stadium",
                "timezone": "America/Chicago"
            },
            "roster": [],
            "meta": {
                "sources": ["ESPN College API"],
                "updated_at": datetime.now().isoformat()
            }
        }
    ]
    
    # Mock players
    players = [
        {
            "player_id": "MLB-STL-0001",
            "name": "Paul Goldschmidt",
            "sport": "MLB",
            "league": "MLB",
            "team_id": "MLB-STL",
            "position": "1B",
            "jersey_number": "46",
            "bio": {
                "dob": "1987-09-10",
                "birthplace": "Wilmington, Delaware",
                "height_cm": 191,
                "weight_kg": 98,
                "handedness": "R"
            },
            "stats_2024": {
                "games_played": 154,
                "mlb": {
                    "avg": 0.245,
                    "obp": 0.302,
                    "slg": 0.414,
                    "ops": 0.716,
                    "hr": 22,
                    "rbi": 65,
                    "war": 1.8
                }
            },
            "hav_f": {
                "champion_readiness": 67.4,
                "cognitive_leverage": 71.2,
                "nil_trust_score": 45.8,
                "composite_score": 62.3,
                "percentile_rank": 72,
                "trend": "stable",
                "computed_at": datetime.now().isoformat()
            },
            "injury_status": {
                "current_status": "healthy"
            },
            "meta": {
                "sources": ["MLB Stats API", "Baseball Savant"],
                "updated_at": datetime.now().isoformat(),
                "external_ids": {
                    "mlbam_id": "502671"
                }
            }
        },
        {
            "player_id": "NFL-TEN-0001",
            "name": "Derrick Henry",
            "sport": "NFL",
            "league": "NFL",
            "team_id": "NFL-TEN",
            "position": "RB",
            "jersey_number": "22",
            "bio": {
                "dob": "1994-01-04",
                "birthplace": "Yulee, Florida",
                "height_cm": 191,
                "weight_kg": 113,
                "college": "Alabama"
            },
            "stats_2024": {
                "games_played": 17,
                "nfl": {
                    "rushing_yards": 1167,
                    "rushing_tds": 12,
                    "receiving_yards": 273,
                    "receiving_tds": 1
                }
            },
            "hav_f": {
                "champion_readiness": 89.7,
                "cognitive_leverage": 65.3,
                "nil_trust_score": 78.4,
                "composite_score": 79.1,
                "percentile_rank": 91,
                "trend": "rising",
                "computed_at": datetime.now().isoformat()
            },
            "meta": {
                "sources": ["ESPN NFL API"],
                "updated_at": datetime.now().isoformat()
            }
        },
        {
            "player_id": "NCAA-TEX-0001",
            "name": "Quinn Ewers",
            "sport": "NCAA-FB",
            "league": "NCAA",
            "team_id": "NCAA-TEX",
            "position": "QB",
            "jersey_number": "3",
            "bio": {
                "dob": "2003-05-15",
                "birthplace": "Southlake, Texas",
                "height_cm": 191,
                "weight_kg": 93,
                "class_year": "Junior"
            },
            "stats_2024": {
                "games_played": 11,
                "ncaa": {
                    "passing_yards": 2665,
                    "passing_tds": 25,
                    "completion_pct": 65.8,
                    "passer_rating": 141.3
                }
            },
            "nil_profile": {
                "valuation_usd": 1200000,
                "valuation_source": "On3",
                "social_followers": {
                    "instagram": 287000,
                    "twitter": 94000,
                    "total": 381000
                },
                "engagement_rate": 4.2
            },
            "hav_f": {
                "champion_readiness": 75.8,
                "cognitive_leverage": 82.4,
                "nil_trust_score": 91.2,
                "composite_score": 81.9,
                "percentile_rank": 94,
                "trend": "rising",
                "computed_at": datetime.now().isoformat()
            },
            "recruiting": {
                "stars": 5,
                "national_rank": 1,
                "position_rank": 1
            },
            "meta": {
                "sources": ["ESPN College API", "On3"],
                "updated_at": datetime.now().isoformat()
            }
        }
    ]
    
    # Add players to team rosters
    teams[0]["roster"] = [players[0]]
    teams[1]["roster"] = [players[1]]
    teams[2]["roster"] = [players[2]]
    
    dataset = {
        "version": "2.0.0",
        "generated_at": datetime.now().isoformat(),
        "teams": teams,
        "players": players
    }
    
    return dataset

def calculate_readiness_mock(team, players):
    """Mock readiness calculation"""
    base_readiness = 50
    
    # Adjust based on win percentage
    if team.get('season_2024', {}).get('win_pct'):
        win_pct = team['season_2024']['win_pct']
        base_readiness += (win_pct - 0.5) * 40
    
    # Adjust for player HAV-F scores
    if players:
        avg_havf = sum(p.get('hav_f', {}).get('composite_score', 50) for p in players) / len(players)
        base_readiness = (base_readiness + avg_havf) / 2
    
    return max(0, min(100, base_readiness))

async def main():
    """Main test execution"""
    print("🧪 Testing Blaze Intelligence Comprehensive System")
    print("=" * 60)
    
    # Step 1: Generate mock data
    print("\n📊 Step 1: Generating mock dataset")
    dataset = generate_mock_data()
    print(f"  • Teams: {len(dataset['teams'])}")
    print(f"  • Players: {len(dataset['players'])}")
    
    # Step 2: Validate schema
    print("\n✅ Step 2: Schema validation")
    from jsonschema import validate, ValidationError
    
    try:
        with open('./blaze-unified-schema.json', 'r') as f:
            schema = json.load(f)
        
        validate(instance=dataset, schema=schema)
        print("  • Schema validation: PASSED")
    except ValidationError as e:
        print(f"  • Schema validation: FAILED - {e.message}")
        return 1
    except FileNotFoundError:
        print("  • Schema file not found, skipping validation")
    
    # Step 3: Save test data
    print("\n💾 Step 3: Saving test data")
    Path('./data/unified').mkdir(parents=True, exist_ok=True)
    
    with open('./data/unified/unified_data_latest.json', 'w') as f:
        json.dump(dataset, f, indent=2)
    print("  • Saved unified dataset")
    
    # Step 4: Calculate readiness
    print("\n🎯 Step 4: Calculating readiness scores")
    readiness_data = {
        'timestamp': datetime.now().isoformat(),
        'sports': {},
        'featured': []
    }
    
    # Group by sport and calculate
    sports_teams = {}
    for team in dataset['teams']:
        sport = team['sport']
        if sport not in sports_teams:
            sports_teams[sport] = []
        sports_teams[sport].append(team)
    
    for sport, teams in sports_teams.items():
        sport_readiness = []
        
        for team in teams:
            team_players = [p for p in dataset['players'] if p['team_id'] == team['team_id']]
            readiness_score = calculate_readiness_mock(team, team_players)
            
            status = 'green' if readiness_score >= 75 else 'yellow' if readiness_score >= 50 else 'red'
            
            team_readiness = {
                'team_id': team['team_id'],
                'name': team['name'],
                'readiness_score': round(readiness_score, 1),
                'status': status,
                'players': {
                    'total': len(team_players),
                    'stars': len([p for p in team_players if p.get('hav_f', {}).get('composite_score', 0) > 80])
                }
            }
            sport_readiness.append(team_readiness)
        
        readiness_data['sports'][sport] = {
            'teams': sport_readiness,
            'averageReadiness': sum(t['readiness_score'] for t in sport_readiness) / len(sport_readiness)
        }
    
    # Step 5: Save readiness data
    print("\n📈 Step 5: Saving readiness data")
    Path('./site/src/data').mkdir(parents=True, exist_ok=True)
    
    with open('./site/src/data/readiness.json', 'w') as f:
        json.dump(readiness_data, f, indent=2)
    print("  • Saved readiness data")
    
    # Step 6: Generate summary
    print("\n📋 Step 6: System summary")
    
    # Calculate overall metrics
    all_players = dataset['players']
    havf_scores = [p.get('hav_f', {}).get('composite_score', 0) for p in all_players if p.get('hav_f')]
    
    elite_players = [p for p in all_players if p.get('hav_f', {}).get('composite_score', 0) >= 90]
    avg_havf = sum(havf_scores) / len(havf_scores) if havf_scores else 0
    
    summary = {
        'timestamp': datetime.now().isoformat(),
        'system_status': 'operational',
        'data': {
            'total_players': len(all_players),
            'total_teams': len(dataset['teams']),
            'leagues': list(set(p['league'] for p in all_players)),
            'elite_prospects': len(elite_players)
        },
        'havf': {
            'average_score': round(avg_havf, 1),
            'top_prospect': max(havf_scores) if havf_scores else 0,
            'distribution': {
                'elite': len([s for s in havf_scores if s >= 90]),
                'excellent': len([s for s in havf_scores if 80 <= s < 90]),
                'good': len([s for s in havf_scores if 70 <= s < 80]),
                'average': len([s for s in havf_scores if 60 <= s < 70]),
                'developing': len([s for s in havf_scores if s < 60])
            }
        },
        'readiness': {
            'sports_covered': len(readiness_data['sports']),
            'avg_readiness': round(sum(
                sport_data['averageReadiness'] 
                for sport_data in readiness_data['sports'].values()
            ) / len(readiness_data['sports']), 1) if readiness_data['sports'] else 0
        }
    }
    
    # Save summary
    with open('./data/system-summary.json', 'w') as f:
        json.dump(summary, f, indent=2)
    
    # Display results
    print("\n🏆 BLAZE INTELLIGENCE SYSTEM TEST RESULTS")
    print("=" * 60)
    print(f"System Status: {summary['system_status'].upper()}")
    print(f"Players: {summary['data']['total_players']:,}")
    print(f"Teams: {summary['data']['total_teams']}")
    print(f"Leagues: {', '.join(summary['data']['leagues'])}")
    print(f"Elite Prospects: {summary['data']['elite_prospects']}")
    print(f"Average HAV-F: {summary['havf']['average_score']}")
    print(f"Average Readiness: {summary['readiness']['avg_readiness']}%")
    
    print("\n📊 HAV-F Distribution:")
    dist = summary['havf']['distribution']
    print(f"  • Elite (90+): {dist['elite']}")
    print(f"  • Excellent (80-89): {dist['excellent']}")
    print(f"  • Good (70-79): {dist['good']}")
    print(f"  • Average (60-69): {dist['average']}")
    print(f"  • Developing (<60): {dist['developing']}")
    
    print("\n🎯 Team Readiness by Sport:")
    for sport, sport_data in readiness_data['sports'].items():
        print(f"\n  {sport}:")
        for team in sport_data['teams']:
            status_emoji = {'green': '🟢', 'yellow': '🟡', 'red': '🔴'}.get(team['status'], '⚪')
            print(f"    {status_emoji} {team['name']}: {team['readiness_score']}% ({team['players']['stars']} stars)")
    
    print(f"\n✅ Test completed successfully!")
    print(f"📂 Data files created:")
    print(f"  • ./data/unified/unified_data_latest.json")
    print(f"  • ./site/src/data/readiness.json")
    print(f"  • ./data/system-summary.json")
    
    return 0

if __name__ == "__main__":
    sys.exit(asyncio.run(main()))