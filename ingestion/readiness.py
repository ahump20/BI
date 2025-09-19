#!/usr/bin/env python3
"""
Readiness Board for Blaze Intelligence
Computes team and player readiness from HAV-F metrics
"""

import json
import os
import sys
import argparse
from typing import Dict, List, Any, Optional
from statistics import mean

from ingestion.time_utils import utc_now_isoformat


def load_league_data() -> Dict[str, Any]:
    """Load all league data files"""
    leagues_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'site', 'src', 'data', 'leagues')
    all_data = {}
    
    for filename in os.listdir(leagues_dir):
        if not filename.endswith('.json'):
            continue
            
        league_name = filename.replace('.json', '')
        filepath = os.path.join(leagues_dir, filename)
        
        try:
            with open(filepath, 'r') as f:
                league_data = json.load(f)
                all_data[league_name] = league_data
        except (json.JSONDecodeError, FileNotFoundError) as e:
            print(f"Warning: Could not load {filename}: {e}")
            continue
    
    return all_data


def compute_team_readiness(players: List[Dict[str, Any]]) -> float:
    """Compute average team readiness from player HAV-F scores"""
    readiness_scores = []
    
    for player in players:
        hav_f = player.get('hav_f', {})
        champion_readiness = hav_f.get('champion_readiness')
        
        if champion_readiness is not None:
            readiness_scores.append(champion_readiness)
    
    if not readiness_scores:
        return 0.0
    
    return round(mean(readiness_scores), 1)


def categorize_player_status(readiness_score: Optional[float]) -> str:
    """Categorize player based on readiness score"""
    if readiness_score is None:
        return "unknown"
    elif readiness_score >= 80:
        return "ready"
    elif readiness_score >= 60:
        return "monitor" 
    else:
        return "caution"


def generate_readiness_report(all_data: Dict[str, Any], focus_teams: List[str] = None) -> Dict[str, Any]:
    """Generate comprehensive readiness report"""
    now_iso = utc_now_isoformat()
    
    teams_data = []
    players_data = []
    
    # Process all leagues
    for league_name, league_data in all_data.items():
        league_players = league_data.get('players', [])
        
        # Group players by team
        teams_in_league = {}
        for player in league_players:
            team_id = player.get('team_id', 'unknown')
            if team_id not in teams_in_league:
                teams_in_league[team_id] = []
            teams_in_league[team_id].append(player)
        
        # Process each team
        for team_id, team_players in teams_in_league.items():
            team_readiness = compute_team_readiness(team_players)
            
            team_entry = {
                "team_id": team_id,
                "league": league_name.upper(),
                "players_count": len(team_players),
                "avg_readiness": team_readiness,
                "last_updated": now_iso
            }
            teams_data.append(team_entry)
            
            # Process individual players for focused teams
            if focus_teams and team_id in focus_teams:
                for player in team_players:
                    hav_f = player.get('hav_f', {})
                    readiness_score = hav_f.get('champion_readiness')
                    
                    player_entry = {
                        "player_id": player.get('player_id'),
                        "name": player.get('name'),
                        "team_id": team_id,
                        "league": league_name.upper(),
                        "position": player.get('position'),
                        "champion_readiness": readiness_score,
                        "cognitive_leverage": hav_f.get('cognitive_leverage'),
                        "nil_trust_score": hav_f.get('nil_trust_score'),
                        "status": categorize_player_status(readiness_score),
                        "last_computed": hav_f.get('last_computed_at')
                    }
                    players_data.append(player_entry)
    
    # Sort teams by readiness (descending)
    teams_data.sort(key=lambda x: x['avg_readiness'], reverse=True)
    
    # Sort players by readiness (descending, with None values last)
    players_data.sort(key=lambda x: x['champion_readiness'] or -1, reverse=True)
    
    return {
        "generated_at": now_iso,
        "teams": teams_data,
        "players": players_data,
        "summary": {
            "total_teams": len(teams_data),
            "total_players": sum(t['players_count'] for t in teams_data),
            "ready_players": len([p for p in players_data if p['status'] == 'ready']),
            "monitor_players": len([p for p in players_data if p['status'] == 'monitor']),
            "caution_players": len([p for p in players_data if p['status'] == 'caution']),
            "focus_teams": focus_teams or []
        }
    }


def save_readiness_report(report: Dict[str, Any], output_path: str) -> None:
    """Save readiness report to file"""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"Readiness report saved to: {output_path}")


def print_readiness_summary(report: Dict[str, Any]) -> None:
    """Print human-readable summary"""
    summary = report['summary']
    teams = report['teams']
    
    print("\n" + "="*50)
    print("BLAZE INTELLIGENCE READINESS BOARD")
    print("="*50)
    print(f"Generated: {report['generated_at']}")
    print(f"Total Teams: {summary['total_teams']}")
    print(f"Total Players: {summary['total_players']}")
    print()
    
    # Player status breakdown
    print("PLAYER STATUS BREAKDOWN:")
    print(f"  Ready (≥80):   {summary['ready_players']:>3}")
    print(f"  Monitor (60-79): {summary['monitor_players']:>3}")
    print(f"  Caution (<60): {summary['caution_players']:>3}")
    print()
    
    # Top teams
    print("TOP TEAMS BY READINESS:")
    for i, team in enumerate(teams[:10]):  # Top 10
        print(f"  {i+1:>2}. {team['team_id']:<12} {team['avg_readiness']:>5.1f} ({team['players_count']} players)")
    
    # Focus team details
    if summary['focus_teams']:
        print(f"\nFOCUS TEAMS ({', '.join(summary['focus_teams'])}):")
        players = report['players']
        
        for team_id in summary['focus_teams']:
            team_players = [p for p in players if p['team_id'] == team_id]
            if team_players:
                print(f"\n  {team_id}:")
                for player in team_players[:5]:  # Top 5 per team
                    status_icon = {"ready": "🟢", "monitor": "🟡", "caution": "🔴"}.get(player['status'], "⚪")
                    readiness = player['champion_readiness']
                    readiness_str = f"{readiness:.1f}" if readiness is not None else "N/A"
                    print(f"    {status_icon} {player['name']:<20} {player['position']:<5} {readiness_str:>5}")


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(description='Generate Blaze Intelligence Readiness Board')
    parser.add_argument('--focus', 
                       help='Comma-separated list of team IDs to focus on (e.g., MLB-STL,NFL-TEN,NCAA-TEX)',
                       default='MLB-STL,NFL-TEN,NCAA-TEX')
    parser.add_argument('--output', '-o',
                       help='Output file path',
                       default='site/src/data/readiness.json')
    parser.add_argument('--quiet', '-q',
                       action='store_true',
                       help='Suppress console output')
    
    args = parser.parse_args()
    
    # Parse focus teams
    focus_teams = [team.strip() for team in args.focus.split(',') if team.strip()] if args.focus else None
    
    # Load all league data
    if not args.quiet:
        print("Loading league data...")
    
    all_data = load_league_data()
    
    if not all_data:
        print("No league data found. Run ingestion agents first.")
        sys.exit(1)
    
    if not args.quiet:
        print(f"Loaded {len(all_data)} leagues")
    
    # Generate report
    if not args.quiet:
        print("Computing readiness metrics...")
    
    report = generate_readiness_report(all_data, focus_teams)
    
    # Save report
    save_readiness_report(report, args.output)
    
    # Print summary
    if not args.quiet:
        print_readiness_summary(report)
    
    print(f"\nReadiness board complete. Report saved to: {args.output}")


if __name__ == '__main__':
    main()
