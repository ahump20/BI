#!/usr/bin/env python3
"""
Live Data Ingestion Runner for Blaze Intelligence
Run all agents with live data fetching enabled
"""

import os
import sys
import subprocess
import argparse
from datetime import datetime
from typing import List, Dict

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def run_agent(agent_name: str, params: Dict[str, str] = None) -> bool:
    """Run a specific agent with live data"""
    agent_path = f"ingestion/{agent_name}_agent.py"
    
    if not os.path.exists(agent_path):
        print(f"Agent {agent_name} not found at {agent_path}")
        return False
    
    cmd = ["python", agent_path, "--live"]
    
    # Add agent-specific parameters
    if params:
        for key, value in params.items():
            cmd.extend([f"--{key}", value])
    
    print(f"Running {agent_name} agent with live data...")
    
    try:
        # Set environment for live fetching
        env = os.environ.copy()
        env['LIVE_FETCH'] = '1'
        
        result = subprocess.run(cmd, env=env, capture_output=True, text=True, cwd=os.getcwd())
        
        if result.returncode == 0:
            print(f"✅ {agent_name.upper()} agent completed successfully")
            if result.stdout:
                print(result.stdout)
            return True
        else:
            print(f"❌ {agent_name.upper()} agent failed")
            if result.stderr:
                print(f"Error: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error running {agent_name} agent: {e}")
        return False


def check_api_keys() -> Dict[str, bool]:
    """Check which API keys are configured"""
    keys_status = {
        'MLB': bool(os.getenv('MLB_STATS_API_KEY') or os.getenv('BASEBALL_SAVANT_TOKEN')),
        'NFL': True,  # nflverse is public
        'NCAA': bool(os.getenv('CFBD_API_KEY')),
        'HS': bool(os.getenv('PERFECT_GAME_API_KEY')),
        'NIL': bool(os.getenv('ON3_API_KEY') or os.getenv('OPENDORSE_API_KEY')),
        'International': bool(os.getenv('KBO_API_KEY') or os.getenv('NPB_API_KEY'))
    }
    
    print("API Key Status:")
    for service, has_key in keys_status.items():
        status = "✅ Configured" if has_key else "⚠️  Not configured (will use mocks)"
        print(f"  {service}: {status}")
    
    return keys_status


def run_full_pipeline(leagues: List[str] = None) -> bool:
    """Run the complete live data ingestion pipeline"""
    print("🚀 Starting Blaze Intelligence Live Data Ingestion")
    print(f"Timestamp: {datetime.utcnow().isoformat()}Z")
    print("-" * 60)
    
    # Check API keys
    api_status = check_api_keys()
    print("-" * 60)
    
    # Default to all leagues if none specified
    if not leagues:
        leagues = ['mlb', 'nfl', 'ncaa', 'hs', 'nil', 'intl']
    
    results = {}
    
    # League-specific parameters
    league_params = {
        'mlb': {'team': 'STL'},
        'nfl': {'team': 'TEN'},
        'ncaa': {'team': 'TEX'},
        'hs': {'region': 'TX'},
        'nil': {'sport': 'all'},
        'intl': {'region': 'KBO'}
    }
    
    for league in leagues:
        if league in league_params:
            results[league] = run_agent(league, league_params[league])
        else:
            print(f"⚠️  Unknown league: {league}")
            results[league] = False
    
    print("-" * 60)
    print("📊 Ingestion Summary:")
    
    success_count = sum(results.values())
    total_count = len(results)
    
    for league, success in results.items():
        status = "✅ Success" if success else "❌ Failed"
        print(f"  {league.upper()}: {status}")
    
    print(f"\nOverall: {success_count}/{total_count} leagues completed successfully")
    
    if success_count == total_count:
        print("🎉 All ingestion tasks completed successfully!")
        return True
    else:
        print(f"⚠️  {total_count - success_count} leagues failed")
        return False


def main():
    parser = argparse.ArgumentParser(description='Run live data ingestion for Blaze Intelligence')
    parser.add_argument(
        '--leagues', 
        nargs='+', 
        choices=['mlb', 'nfl', 'ncaa', 'hs', 'nil', 'intl'],
        help='Specific leagues to ingest (default: all)'
    )
    parser.add_argument(
        '--check-keys', 
        action='store_true',
        help='Only check API key status, don\'t run ingestion'
    )
    parser.add_argument(
        '--agent',
        choices=['mlb', 'nfl', 'ncaa', 'hs', 'nil', 'intl'],
        help='Run a single agent'
    )
    
    args = parser.parse_args()
    
    if args.check_keys:
        check_api_keys()
        return
    
    if args.agent:
        league_params = {
            'mlb': {'team': 'STL'},
            'nfl': {'team': 'TEN'},
            'ncaa': {'team': 'TEX'},
            'hs': {'region': 'TX'},
            'nil': {'sport': 'all'},
            'intl': {'region': 'KBO'}
        }
        success = run_agent(args.agent, league_params.get(args.agent, {}))
        sys.exit(0 if success else 1)
    
    success = run_full_pipeline(args.leagues)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()