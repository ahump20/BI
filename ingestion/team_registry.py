#!/usr/bin/env python3
"""
Team Registry for Blaze Intelligence
Comprehensive team data for all major leagues
"""

from typing import Dict, List, Any

# MLB Teams (30 teams)
MLB_TEAMS = {
    # American League East
    "BAL": {"name": "Baltimore Orioles", "division": "AL East", "market": "Baltimore", "priority": 3},
    "BOS": {"name": "Boston Red Sox", "division": "AL East", "market": "Boston", "priority": 2},
    "NYY": {"name": "New York Yankees", "division": "AL East", "market": "New York", "priority": 1},
    "TB": {"name": "Tampa Bay Rays", "division": "AL East", "market": "Tampa Bay", "priority": 3},
    "TOR": {"name": "Toronto Blue Jays", "division": "AL East", "market": "Toronto", "priority": 3},
    
    # American League Central
    "CWS": {"name": "Chicago White Sox", "division": "AL Central", "market": "Chicago", "priority": 2},
    "CLE": {"name": "Cleveland Guardians", "division": "AL Central", "market": "Cleveland", "priority": 2},
    "DET": {"name": "Detroit Tigers", "division": "AL Central", "market": "Detroit", "priority": 3},
    "KC": {"name": "Kansas City Royals", "division": "AL Central", "market": "Kansas City", "priority": 3},
    "MIN": {"name": "Minnesota Twins", "division": "AL Central", "market": "Minneapolis", "priority": 2},
    
    # American League West
    "HOU": {"name": "Houston Astros", "division": "AL West", "market": "Houston", "priority": 1},
    "LAA": {"name": "Los Angeles Angels", "division": "AL West", "market": "Los Angeles", "priority": 2},
    "OAK": {"name": "Oakland Athletics", "division": "AL West", "market": "Oakland", "priority": 3},
    "SEA": {"name": "Seattle Mariners", "division": "AL West", "market": "Seattle", "priority": 2},
    "TEX": {"name": "Texas Rangers", "division": "AL West", "market": "Dallas", "priority": 2},
    
    # National League East
    "ATL": {"name": "Atlanta Braves", "division": "NL East", "market": "Atlanta", "priority": 1},
    "MIA": {"name": "Miami Marlins", "division": "NL East", "market": "Miami", "priority": 3},
    "NYM": {"name": "New York Mets", "division": "NL East", "market": "New York", "priority": 1},
    "PHI": {"name": "Philadelphia Phillies", "division": "NL East", "market": "Philadelphia", "priority": 1},
    "WSH": {"name": "Washington Nationals", "division": "NL East", "market": "Washington", "priority": 2},
    
    # National League Central
    "CHC": {"name": "Chicago Cubs", "division": "NL Central", "market": "Chicago", "priority": 1},
    "CIN": {"name": "Cincinnati Reds", "division": "NL Central", "market": "Cincinnati", "priority": 3},
    "MIL": {"name": "Milwaukee Brewers", "division": "NL Central", "market": "Milwaukee", "priority": 2},
    "PIT": {"name": "Pittsburgh Pirates", "division": "NL Central", "market": "Pittsburgh", "priority": 3},
    "STL": {"name": "St. Louis Cardinals", "division": "NL Central", "market": "St. Louis", "priority": 0},  # PRIMARY FOCUS
    
    # National League West
    "ARI": {"name": "Arizona Diamondbacks", "division": "NL West", "market": "Phoenix", "priority": 2},
    "COL": {"name": "Colorado Rockies", "division": "NL West", "market": "Denver", "priority": 3},
    "LAD": {"name": "Los Angeles Dodgers", "division": "NL West", "market": "Los Angeles", "priority": 1},
    "SD": {"name": "San Diego Padres", "division": "NL West", "market": "San Diego", "priority": 1},
    "SF": {"name": "San Francisco Giants", "division": "NL West", "market": "San Francisco", "priority": 2}
}

# NFL Teams (32 teams)  
NFL_TEAMS = {
    # AFC East
    "BUF": {"name": "Buffalo Bills", "division": "AFC East", "market": "Buffalo", "priority": 2},
    "MIA": {"name": "Miami Dolphins", "division": "AFC East", "market": "Miami", "priority": 2},
    "NE": {"name": "New England Patriots", "division": "AFC East", "market": "Boston", "priority": 1},
    "NYJ": {"name": "New York Jets", "division": "AFC East", "market": "New York", "priority": 2},
    
    # AFC North
    "BAL": {"name": "Baltimore Ravens", "division": "AFC North", "market": "Baltimore", "priority": 1},
    "CIN": {"name": "Cincinnati Bengals", "division": "AFC North", "market": "Cincinnati", "priority": 2},
    "CLE": {"name": "Cleveland Browns", "division": "AFC North", "market": "Cleveland", "priority": 2},
    "PIT": {"name": "Pittsburgh Steelers", "division": "AFC North", "market": "Pittsburgh", "priority": 1},
    
    # AFC South
    "HOU": {"name": "Houston Texans", "division": "AFC South", "market": "Houston", "priority": 2},
    "IND": {"name": "Indianapolis Colts", "division": "AFC South", "market": "Indianapolis", "priority": 2},
    "JAX": {"name": "Jacksonville Jaguars", "division": "AFC South", "market": "Jacksonville", "priority": 3},
    "TEN": {"name": "Tennessee Titans", "division": "AFC South", "market": "Nashville", "priority": 0},  # PRIMARY FOCUS
    
    # AFC West
    "DEN": {"name": "Denver Broncos", "division": "AFC West", "market": "Denver", "priority": 2},
    "KC": {"name": "Kansas City Chiefs", "division": "AFC West", "market": "Kansas City", "priority": 1},
    "LV": {"name": "Las Vegas Raiders", "division": "AFC West", "market": "Las Vegas", "priority": 3},
    "LAC": {"name": "Los Angeles Chargers", "division": "AFC West", "market": "Los Angeles", "priority": 2},
    
    # NFC East
    "DAL": {"name": "Dallas Cowboys", "division": "NFC East", "market": "Dallas", "priority": 1},
    "NYG": {"name": "New York Giants", "division": "NFC East", "market": "New York", "priority": 2},
    "PHI": {"name": "Philadelphia Eagles", "division": "NFC East", "market": "Philadelphia", "priority": 1},
    "WSH": {"name": "Washington Commanders", "division": "NFC East", "market": "Washington", "priority": 2},
    
    # NFC North
    "CHI": {"name": "Chicago Bears", "division": "NFC North", "market": "Chicago", "priority": 2},
    "DET": {"name": "Detroit Lions", "division": "NFC North", "market": "Detroit", "priority": 2},
    "GB": {"name": "Green Bay Packers", "division": "NFC North", "market": "Green Bay", "priority": 1},
    "MIN": {"name": "Minnesota Vikings", "division": "NFC North", "market": "Minneapolis", "priority": 2},
    
    # NFC South
    "ATL": {"name": "Atlanta Falcons", "division": "NFC South", "market": "Atlanta", "priority": 2},
    "CAR": {"name": "Carolina Panthers", "division": "NFC South", "market": "Charlotte", "priority": 3},
    "NO": {"name": "New Orleans Saints", "division": "NFC South", "market": "New Orleans", "priority": 2},
    "TB": {"name": "Tampa Bay Buccaneers", "division": "NFC South", "market": "Tampa Bay", "priority": 2},
    
    # NFC West
    "ARI": {"name": "Arizona Cardinals", "division": "NFC West", "market": "Phoenix", "priority": 3},
    "LAR": {"name": "Los Angeles Rams", "division": "NFC West", "market": "Los Angeles", "priority": 1},
    "SEA": {"name": "Seattle Seahawks", "division": "NFC West", "market": "Seattle", "priority": 2},
    "SF": {"name": "San Francisco 49ers", "division": "NFC West", "market": "San Francisco", "priority": 1}
}

# NBA Teams (30 teams) - Grizzlies focus
NBA_TEAMS = {
    # Eastern Conference - Atlantic
    "BOS": {"name": "Boston Celtics", "division": "Atlantic", "conference": "Eastern", "priority": 1},
    "BKN": {"name": "Brooklyn Nets", "division": "Atlantic", "conference": "Eastern", "priority": 2},
    "NYK": {"name": "New York Knicks", "division": "Atlantic", "conference": "Eastern", "priority": 1},
    "PHI": {"name": "Philadelphia 76ers", "division": "Atlantic", "conference": "Eastern", "priority": 1},
    "TOR": {"name": "Toronto Raptors", "division": "Atlantic", "conference": "Eastern", "priority": 2},
    
    # Eastern Conference - Central
    "CHI": {"name": "Chicago Bulls", "division": "Central", "conference": "Eastern", "priority": 2},
    "CLE": {"name": "Cleveland Cavaliers", "division": "Central", "conference": "Eastern", "priority": 2},
    "DET": {"name": "Detroit Pistons", "division": "Central", "conference": "Eastern", "priority": 3},
    "IND": {"name": "Indiana Pacers", "division": "Central", "conference": "Eastern", "priority": 2},
    "MIL": {"name": "Milwaukee Bucks", "division": "Central", "conference": "Eastern", "priority": 1},
    
    # Eastern Conference - Southeast
    "ATL": {"name": "Atlanta Hawks", "division": "Southeast", "conference": "Eastern", "priority": 2},
    "CHA": {"name": "Charlotte Hornets", "division": "Southeast", "conference": "Eastern", "priority": 3},
    "MIA": {"name": "Miami Heat", "division": "Southeast", "conference": "Eastern", "priority": 1},
    "ORL": {"name": "Orlando Magic", "division": "Southeast", "conference": "Eastern", "priority": 2},
    "WAS": {"name": "Washington Wizards", "division": "Southeast", "conference": "Eastern", "priority": 3},
    
    # Western Conference - Northwest
    "DEN": {"name": "Denver Nuggets", "division": "Northwest", "conference": "Western", "priority": 1},
    "MIN": {"name": "Minnesota Timberwolves", "division": "Northwest", "conference": "Western", "priority": 2},
    "OKC": {"name": "Oklahoma City Thunder", "division": "Northwest", "conference": "Western", "priority": 2},
    "POR": {"name": "Portland Trail Blazers", "division": "Northwest", "conference": "Western", "priority": 3},
    "UTA": {"name": "Utah Jazz", "division": "Northwest", "conference": "Western", "priority": 3},
    
    # Western Conference - Pacific
    "GSW": {"name": "Golden State Warriors", "division": "Pacific", "conference": "Western", "priority": 1},
    "LAC": {"name": "Los Angeles Clippers", "division": "Pacific", "conference": "Western", "priority": 1},
    "LAL": {"name": "Los Angeles Lakers", "division": "Pacific", "conference": "Western", "priority": 1},
    "PHX": {"name": "Phoenix Suns", "division": "Pacific", "conference": "Western", "priority": 1},
    "SAC": {"name": "Sacramento Kings", "division": "Pacific", "conference": "Western", "priority": 2},
    
    # Western Conference - Southwest  
    "DAL": {"name": "Dallas Mavericks", "division": "Southwest", "conference": "Western", "priority": 1},
    "HOU": {"name": "Houston Rockets", "division": "Southwest", "conference": "Western", "priority": 2},
    "MEM": {"name": "Memphis Grizzlies", "division": "Southwest", "conference": "Western", "priority": 0},  # PRIMARY FOCUS
    "NO": {"name": "New Orleans Pelicans", "division": "Southwest", "conference": "Western", "priority": 2},
    "SA": {"name": "San Antonio Spurs", "division": "Southwest", "conference": "Western", "priority": 2}
}

# NCAA Teams - Focus on major programs
NCAA_TEAMS = {
    "TEX": {"name": "Texas Longhorns", "conference": "SEC", "market": "Austin", "priority": 0},  # PRIMARY FOCUS
    "OU": {"name": "Oklahoma Sooners", "conference": "SEC", "market": "Norman", "priority": 1},
    "ALA": {"name": "Alabama Crimson Tide", "conference": "SEC", "market": "Tuscaloosa", "priority": 1},
    "UGA": {"name": "Georgia Bulldogs", "conference": "SEC", "market": "Athens", "priority": 1},
    "LSU": {"name": "LSU Tigers", "conference": "SEC", "market": "Baton Rouge", "priority": 1},
    "OSU": {"name": "Ohio State Buckeyes", "conference": "Big Ten", "market": "Columbus", "priority": 1},
    "MICH": {"name": "Michigan Wolverines", "conference": "Big Ten", "market": "Ann Arbor", "priority": 1},
    "USC": {"name": "USC Trojans", "conference": "Big Ten", "market": "Los Angeles", "priority": 1},
    "ND": {"name": "Notre Dame Fighting Irish", "conference": "Independent", "market": "South Bend", "priority": 1},
    "CLEM": {"name": "Clemson Tigers", "conference": "ACC", "market": "Clemson", "priority": 1}
}


class TeamRegistry:
    """Central registry for all team data"""
    
    def __init__(self):
        self.mlb_teams = MLB_TEAMS
        self.nfl_teams = NFL_TEAMS  
        self.nba_teams = NBA_TEAMS
        self.ncaa_teams = NCAA_TEAMS
    
    def get_teams_by_priority(self, league: str, max_priority: int = 1) -> List[str]:
        """Get teams by priority level (0=primary focus, 1=high, 2=medium, 3=low)"""
        teams_dict = getattr(self, f"{league.lower()}_teams", {})
        return [code for code, data in teams_dict.items() if data["priority"] <= max_priority]
    
    def get_focus_teams(self) -> Dict[str, str]:
        """Get primary focus teams for each league"""
        return {
            "MLB": "STL",  # Cardinals
            "NFL": "TEN",  # Titans  
            "NBA": "MEM",  # Grizzlies
            "NCAA": "TEX"  # Longhorns
        }
    
    def get_expansion_plan(self) -> Dict[str, List[str]]:
        """Get phased expansion plan"""
        return {
            "phase_1": {  # Focus teams only
                "MLB": ["STL"],
                "NFL": ["TEN"], 
                "NBA": ["MEM"],
                "NCAA": ["TEX"]
            },
            "phase_2": {  # Add priority 1 teams
                "MLB": self.get_teams_by_priority("MLB", 1),
                "NFL": self.get_teams_by_priority("NFL", 1),
                "NBA": self.get_teams_by_priority("NBA", 1), 
                "NCAA": self.get_teams_by_priority("NCAA", 1)
            },
            "phase_3": {  # Add priority 2 teams  
                "MLB": self.get_teams_by_priority("MLB", 2),
                "NFL": self.get_teams_by_priority("NFL", 2),
                "NBA": self.get_teams_by_priority("NBA", 2),
                "NCAA": self.get_teams_by_priority("NCAA", 2)
            },
            "phase_4": {  # Full coverage
                "MLB": list(self.mlb_teams.keys()),
                "NFL": list(self.nfl_teams.keys()),
                "NBA": list(self.nba_teams.keys()),
                "NCAA": list(self.ncaa_teams.keys())
            }
        }
    
    def get_team_info(self, league: str, team_code: str) -> Dict[str, Any]:
        """Get detailed team information"""
        teams_dict = getattr(self, f"{league.lower()}_teams", {})
        team_data = teams_dict.get(team_code, {})
        
        return {
            "code": team_code,
            "name": team_data.get("name", "Unknown"),
            "league": league,
            "market": team_data.get("market", "Unknown"),
            "division": team_data.get("division", "Unknown"),
            "priority": team_data.get("priority", 3),
            "team_id": f"{league}-{team_code}"
        }


# Export registry instance
registry = TeamRegistry()


def main():
    """CLI for team registry operations"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Team Registry Operations")
    parser.add_argument("--expansion-plan", action="store_true", help="Show expansion plan")
    parser.add_argument("--focus-teams", action="store_true", help="Show focus teams")
    parser.add_argument("--league", help="Show teams for specific league")
    parser.add_argument("--priority", type=int, default=3, help="Maximum priority level")
    
    args = parser.parse_args()
    
    if args.expansion_plan:
        print("🎯 BLAZE INTELLIGENCE EXPANSION PLAN")
        print("="*50)
        plan = registry.get_expansion_plan()
        
        for phase, leagues in plan.items():
            print(f"\n📈 {phase.upper().replace('_', ' ')}")
            for league, teams in leagues.items():
                print(f"  {league}: {len(teams)} teams - {', '.join(teams[:5])}{'...' if len(teams) > 5 else ''}")
    
    elif args.focus_teams:
        print("🎯 PRIMARY FOCUS TEAMS")
        print("="*30)
        focus = registry.get_focus_teams()
        for league, team_code in focus.items():
            team_info = registry.get_team_info(league, team_code)
            print(f"🏆 {league}: {team_info['name']} ({team_code})")
    
    elif args.league:
        teams = registry.get_teams_by_priority(args.league.upper(), args.priority)
        print(f"🏈 {args.league.upper()} TEAMS (Priority ≤ {args.priority})")
        print("="*40)
        
        for team_code in teams:
            team_info = registry.get_team_info(args.league.upper(), team_code)
            print(f"  {team_code}: {team_info['name']} (Priority: {team_info['priority']})")
    
    else:
        print("🏟️  BLAZE INTELLIGENCE TEAM REGISTRY")
        print("="*40)
        print("Total teams available:")
        print(f"  MLB: {len(registry.mlb_teams)} teams")
        print(f"  NFL: {len(registry.nfl_teams)} teams") 
        print(f"  NBA: {len(registry.nba_teams)} teams")
        print(f"  NCAA: {len(registry.ncaa_teams)} teams")
        print(f"  TOTAL: {len(registry.mlb_teams) + len(registry.nfl_teams) + len(registry.nba_teams) + len(registry.ncaa_teams)} teams")


if __name__ == "__main__":
    main()
