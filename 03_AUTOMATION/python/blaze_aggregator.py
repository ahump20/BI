#!/usr/bin/env python3
"""
Blaze Sports Data Aggregator (2025)
Unifies team data from multiple leagues into a standardized JSON format.
"""

import json
import csv
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any, Optional

def current_utc_iso() -> str:
    """Return the current UTC timestamp in ISO 8601 format with Z suffix."""
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def generate_team_id(league: str, team_name: str) -> str:
    """Generate a consistent team_id from league and team name."""
    combined = f"{league}:{team_name}"
    return hashlib.md5(combined.encode()).hexdigest()[:12]

def extract_market_from_team(team_name: str) -> str:
    """Extract market/city from team name."""
    # Common patterns for extracting market
    if " " in team_name:
        # For teams like "St. Louis Cardinals", "New York Yankees"
        parts = team_name.split()
        if len(parts) >= 2:
            # Handle multi-word cities like "St. Louis", "New York"
            if parts[0] in ["St.", "New", "North", "South", "East", "West"]:
                return " ".join(parts[:2]) if len(parts) > 2 else parts[0]
            return parts[0]
    return team_name

def create_aliases(team_name: str, market: str) -> List[str]:
    """Generate common aliases for a team."""
    aliases = []
    
    # Add market name if different from team name
    if market not in team_name:
        aliases.append(market)
    
    # Add common abbreviations
    parts = team_name.split()
    if len(parts) > 1:
        # Last word (mascot)
        aliases.append(parts[-1])
        
        # Initials
        initials = "".join([part[0] for part in parts if part[0].isupper()])
        if len(initials) > 1:
            aliases.append(initials)
    
    return list(set(aliases))  # Remove duplicates

def process_mlb_teams(file_path: str) -> List[Dict[str, Any]]:
    """Process MLB teams JSON file."""
    with open(file_path, 'r') as f:
        teams = json.load(f)
    
    processed = []
    for team in teams:
        team_name = team['team']
        market = extract_market_from_team(team_name)
        
        processed_team = {
            "league": "MLB",
            "team_id": generate_team_id("MLB", team_name),
            "team_name": team_name,
            "level": "Professional",
            "conference": None,
            "division": None,  # Could be added later (AL/NL, divisions)
            "market": market,
            "aliases": create_aliases(team_name, market),
            "last_updated_iso": current_utc_iso()
        }
        processed.append(processed_team)
    
    return processed

def process_nfl_teams(file_path: str) -> List[Dict[str, Any]]:
    """Process NFL teams JSON file."""
    with open(file_path, 'r') as f:
        teams = json.load(f)
    
    processed = []
    for team in teams:
        team_name = team['team']
        market = extract_market_from_team(team_name)
        
        processed_team = {
            "league": "NFL",
            "team_id": generate_team_id("NFL", team_name),
            "team_name": team_name,
            "level": "Professional",
            "conference": None,
            "division": None,  # Could be added later (AFC/NFC, divisions)
            "market": market,
            "aliases": create_aliases(team_name, market),
            "last_updated_iso": current_utc_iso()
        }
        processed.append(processed_team)
    
    return processed

def process_fcs_teams(file_path: str) -> List[Dict[str, Any]]:
    """Process NCAA FCS teams JSON file."""
    with open(file_path, 'r') as f:
        teams = json.load(f)
    
    processed = []
    for team in teams:
        team_name = team['team']
        market = extract_market_from_team(team_name)
        
        processed_team = {
            "league": "NCAA FCS",
            "team_id": generate_team_id("NCAA FCS", team_name),
            "team_name": team_name,
            "level": "College",
            "conference": team['conference'],
            "division": None,
            "market": market,
            "aliases": create_aliases(team_name, market),
            "last_updated_iso": current_utc_iso()
        }
        processed.append(processed_team)
    
    return processed

def process_fbs_teams(file_path: str) -> List[Dict[str, Any]]:
    """Process NCAA FBS power conference teams JSON file."""
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    processed = []
    for team_data in data['flat']:
        team_name = team_data['team']
        market = extract_market_from_team(team_name)
        
        processed_team = {
            "league": "NCAA FBS",
            "team_id": generate_team_id("NCAA FBS", team_name),
            "team_name": team_name,
            "level": "College",
            "conference": team_data['conference'],
            "division": None,
            "market": market,
            "aliases": create_aliases(team_name, market),
            "last_updated_iso": current_utc_iso()
        }
        processed.append(processed_team)
    
    return processed

def validate_data(teams: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Validate the aggregated data and return summary statistics."""
    validation_report = {
        "total_teams": len(teams),
        "leagues": {},
        "conferences": {},
        "issues": []
    }
    
    seen_team_ids = set()
    
    for team in teams:
        # Check required fields
        required_fields = ["league", "team_id", "team_name", "level", "last_updated_iso"]
        for field in required_fields:
            if field not in team or team[field] is None:
                validation_report["issues"].append(f"Missing {field} for team: {team.get('team_name', 'UNKNOWN')}")
        
        # Check for duplicate team_ids
        team_id = team.get("team_id")
        if team_id in seen_team_ids:
            validation_report["issues"].append(f"Duplicate team_id: {team_id}")
        seen_team_ids.add(team_id)
        
        # Count by league
        league = team.get("league", "UNKNOWN")
        validation_report["leagues"][league] = validation_report["leagues"].get(league, 0) + 1
        
        # Count by conference
        conference = team.get("conference")
        if conference:
            validation_report["conferences"][conference] = validation_report["conferences"].get(conference, 0) + 1
    
    return validation_report

def deduplicate_and_sort(teams: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Remove duplicates and sort by league then team_name."""
    # Remove duplicates based on (league, team_id)
    seen = set()
    deduplicated = []
    
    for team in teams:
        key = (team["league"], team["team_id"])
        if key not in seen:
            seen.add(key)
            deduplicated.append(team)
    
    # Sort by league, then team_name
    deduplicated.sort(key=lambda x: (x["league"], x["team_name"]))
    
    return deduplicated

def main():
    """Main aggregation function."""
    print("🏟️  Blaze Sports Data Aggregator - Starting aggregation...")
    
    # Input file paths
    base_path = Path.home() / "Library/Mobile Documents/com~apple~CloudDocs/Austin Humphrey/BI"
    
    input_files = {
        "mlb": base_path / "mlb_teams.json",
        "nfl": base_path / "nfl_teams.json", 
        "fcs": base_path / "fcs_teams.json",
        "fbs": base_path / "fbs_power_conferences_2025.json"
    }
    
    # Check if all files exist
    for name, path in input_files.items():
        if not path.exists():
            print(f"❌ ERROR: {name} file not found at {path}")
            return
    
    # Process each league
    all_teams = []
    
    print("📊 Processing MLB teams...")
    all_teams.extend(process_mlb_teams(str(input_files["mlb"])))
    
    print("🏈 Processing NFL teams...")
    all_teams.extend(process_nfl_teams(str(input_files["nfl"])))
    
    print("🏆 Processing NCAA FCS teams...")
    all_teams.extend(process_fcs_teams(str(input_files["fcs"])))
    
    print("🎓 Processing NCAA FBS teams...")
    all_teams.extend(process_fbs_teams(str(input_files["fbs"])))
    
    # Deduplicate and sort
    print("🔄 Deduplicating and sorting...")
    all_teams = deduplicate_and_sort(all_teams)
    
    # Validate data
    print("✅ Validating data...")
    validation_report = validate_data(all_teams)
    
    # Output unified JSON
    output_path = Path.cwd() / "blaze-sports-data-2025.json"
    with open(output_path, 'w') as f:
        json.dump(all_teams, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Successfully created unified dataset: {output_path}")
    print(f"📈 Total teams: {validation_report['total_teams']}")
    
    # Print league breakdown
    print("\n📊 League Breakdown:")
    for league, count in validation_report['leagues'].items():
        print(f"  {league}: {count} teams")
    
    # Print conference breakdown (excluding None)
    print("\n🏆 Conference Breakdown:")
    for conference, count in sorted(validation_report['conferences'].items()):
        print(f"  {conference}: {count} teams")
    
    # Report any issues
    if validation_report['issues']:
        print("\n⚠️  Validation Issues:")
        for issue in validation_report['issues']:
            print(f"  - {issue}")
    else:
        print("\n✅ No validation issues found!")
    
    return output_path

if __name__ == "__main__":
    main()