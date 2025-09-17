#!/usr/bin/env python3
"""
Update Readiness Board Script for Blaze Intelligence
Runs after data ingestion to update team readiness metrics
"""

import os
import sys
import subprocess
from datetime import datetime, timezone

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def run_readiness_update():
    """Run the readiness board update"""
    print("🏆 Updating Blaze Intelligence Readiness Board")
    print(f"Timestamp: {datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')}")
    print("-" * 60)
    
    try:
        # Run readiness calculation
        from ingestion.readiness import ReadinessCalculator
        
        calculator = ReadinessCalculator()
        success = calculator.generate_readiness_board()
        
        if success:
            print("✅ Readiness board updated successfully")
            
            # Also generate teams.json summary
            generate_teams_summary()
            
            return True
        else:
            print("❌ Readiness board update failed")
            return False
            
    except Exception as e:
        print(f"❌ Error updating readiness board: {e}")
        return False


def generate_teams_summary():
    """Generate teams.json summary file"""
    try:
        print("📊 Generating teams summary...")
        
        leagues_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)),
                                   'site', 'src', 'data', 'leagues')
        teams_path = os.path.join(os.path.dirname(os.path.dirname(__file__)),
                                  'site', 'src', 'data', 'teams.json')
        
        teams = []
        leagues = []
        total_players = 0
        
        # Process each league file
        for filename in os.listdir(leagues_dir):
            if filename.endswith('.json'):
                league = filename.replace('.json', '').upper()
                file_path = os.path.join(leagues_dir, filename)
                
                try:
                    import json
                    with open(file_path, 'r') as f:
                        data = json.load(f)
                        players = data.get('players', [])
                        
                        # Extract unique teams
                        league_teams = {}
                        for player in players:
                            team_id = player.get('team_id', 'UNKNOWN')
                            if team_id not in league_teams:
                                league_teams[team_id] = []
                            league_teams[team_id].append(player)
                        
                        # Add teams with player counts
                        for team_id, team_players in league_teams.items():
                            teams.append({
                                'team_id': team_id,
                                'league': league,
                                'players_count': len(team_players),
                                'avg_readiness': calculate_team_avg_readiness(team_players)
                            })
                        
                        leagues.append({
                            'league': league,
                            'teams_count': len(league_teams),
                            'players_count': len(players)
                        })
                        
                        total_players += len(players)
                        
                except Exception as e:
                    print(f"Error processing {filename}: {e}")
                    continue
        
        # Generate teams.json
        teams_data = {
            'generated_at': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
            'teams': teams,
            'analytics': {
                'totalTeams': len(teams),
                'totalPlayers': total_players,
                'totalLeagues': len(leagues),
                'leagueBreakdown': leagues
            }
        }
        
        os.makedirs(os.path.dirname(teams_path), exist_ok=True)
        import json
        with open(teams_path, 'w') as f:
            json.dump(teams_data, f, indent=2)
            
        print(f"✅ Teams summary generated: {len(teams)} teams, {total_players} players")
        
    except Exception as e:
        print(f"⚠️  Error generating teams summary: {e}")


def calculate_team_avg_readiness(players):
    """Calculate average readiness for a team"""
    try:
        readiness_scores = []
        for player in players:
            hav_f = player.get('hav_f', {})
            readiness = hav_f.get('champion_readiness')
            if readiness is not None:
                readiness_scores.append(readiness)
        
        if readiness_scores:
            return round(sum(readiness_scores) / len(readiness_scores), 1)
        else:
            return 0.0
    except:
        return 0.0


if __name__ == "__main__":
    success = run_readiness_update()
    sys.exit(0 if success else 1)
