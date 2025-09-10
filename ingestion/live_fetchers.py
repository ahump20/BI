#!/usr/bin/env python3
"""
Live data fetchers for Blaze Intelligence
Connects to real sports APIs to get live player data
"""

import requests
import time
import csv
from io import StringIO
from typing import Dict, List, Any, Optional
import os
import json


class BaseLiveFetcher:
    """Base class for live data fetching with rate limiting"""
    
    def __init__(self, rate_limit: float = 0.5):
        self.rate_limit = rate_limit  # seconds between requests
        self.last_request = 0
    
    def _throttle(self):
        """Ensure rate limiting between requests"""
        elapsed = time.time() - self.last_request
        if elapsed < self.rate_limit:
            time.sleep(self.rate_limit - elapsed)
        self.last_request = time.time()
    
    def _retry_request(self, url: str, headers: Optional[Dict] = None, params: Optional[Dict] = None, max_retries: int = 3) -> requests.Response:
        """Make HTTP request with exponential backoff retry"""
        for attempt in range(max_retries):
            try:
                self._throttle()
                response = requests.get(url, headers=headers, params=params, timeout=30)
                
                if response.status_code == 429:  # Rate limited
                    wait_time = 2 ** attempt
                    print(f"Rate limited, waiting {wait_time}s before retry {attempt + 1}/{max_retries}")
                    time.sleep(wait_time)
                    continue
                
                response.raise_for_status()
                return response
                
            except requests.RequestException as e:
                if attempt == max_retries - 1:
                    raise e
                wait_time = 2 ** attempt
                print(f"Request failed (attempt {attempt + 1}/{max_retries}): {e}")
                print(f"Retrying in {wait_time}s...")
                time.sleep(wait_time)
        
        raise requests.RequestException("Max retries exceeded")


class MLBLiveFetcher(BaseLiveFetcher):
    """Fetch live MLB data from Baseball Savant/Statcast"""
    
    def __init__(self):
        super().__init__(rate_limit=1.0)  # 1 second between requests
        self.base_url = "https://baseballsavant.mlb.com"
        self.api_url = "https://statsapi.mlb.com/api/v1"
    
    def get_team_roster(self, team_abbr: str = "STL") -> List[Dict[str, Any]]:
        """Get current roster for a team"""
        # First get team ID
        teams_response = self._retry_request(f"{self.api_url}/teams")
        teams_data = teams_response.json()
        
        team_id = None
        for team in teams_data.get("teams", []):
            if team.get("abbreviation") == team_abbr:
                team_id = team.get("id")
                break
        
        if not team_id:
            raise ValueError(f"Team {team_abbr} not found")
        
        # Get roster
        roster_response = self._retry_request(f"{self.api_url}/teams/{team_id}/roster/Active")
        roster_data = roster_response.json()
        
        return roster_data.get("roster", [])
    
    def get_player_stats(self, player_id: str, season: str = "2024") -> Dict[str, Any]:
        """Get player stats from MLB Stats API"""
        stats_response = self._retry_request(
            f"{self.api_url}/people/{player_id}/stats",
            params={"stats": "season", "season": season}
        )
        return stats_response.json()
    
    def get_statcast_data(self, team_abbr: str = "STL", season: str = "2024", player_type: str = "batter") -> List[Dict[str, Any]]:
        """Get Statcast data from Baseball Savant"""
        url = f"{self.base_url}/statcast_search/csv"
        params = {
            "year": season,
            "player_type": player_type,
            "team": team_abbr
        }
        
        response = self._retry_request(url, params=params)
        
        # Parse CSV response
        csv_data = StringIO(response.text)
        reader = csv.DictReader(csv_data)
        return list(reader)


class NFLLiveFetcher(BaseLiveFetcher):
    """Fetch live NFL data from nflverse and ESPN"""
    
    def __init__(self):
        super().__init__(rate_limit=0.5)
        self.nflverse_base = "https://raw.githubusercontent.com/nflverse/nflfastR-data/master/data"
        self.espn_base = "https://site.api.espn.com/apis/site/v2/sports/football/nfl"
    
    def get_player_stats(self, season: str = "2024", team_abbr: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get player stats from nflverse"""
        url = f"{self.nflverse_base}/player_stats_{season}.json"
        
        response = self._retry_request(url)
        data = response.json()
        
        if team_abbr:
            # Filter by team
            data = [p for p in data if p.get("recent_team") == team_abbr]
        
        return data
    
    def get_team_roster(self, team_abbr: str = "TEN") -> List[Dict[str, Any]]:
        """Get team roster from ESPN API"""
        # Map team abbreviations to ESPN team IDs
        team_map = {
            "TEN": "10",  # Tennessee Titans
            "STL": "29",  # Los Angeles Rams (formerly St. Louis)
            "LAR": "29",  # Los Angeles Rams
        }
        
        team_id = team_map.get(team_abbr, "10")
        url = f"{self.espn_base}/teams/{team_id}/roster"
        
        response = self._retry_request(url)
        return response.json()


class NCAALiveFetcher(BaseLiveFetcher):
    """Fetch live NCAA data from College Football Data API"""
    
    def __init__(self, api_key: Optional[str] = None):
        super().__init__(rate_limit=1.0)
        self.api_key = api_key or os.getenv("CFBD_API_KEY")
        self.base_url = "https://api.collegefootballdata.com"
        
        if not self.api_key:
            raise ValueError("CFBD_API_KEY environment variable required")
    
    def get_headers(self) -> Dict[str, str]:
        return {"Authorization": f"Bearer {self.api_key}"}
    
    def get_player_stats(self, year: str = "2024", team: str = "Texas") -> List[Dict[str, Any]]:
        """Get player season stats"""
        url = f"{self.base_url}/stats/player/season"
        params = {"year": year, "team": team}
        
        response = self._retry_request(url, headers=self.get_headers(), params=params)
        return response.json()
    
    def get_team_roster(self, team: str = "Texas", year: str = "2024") -> List[Dict[str, Any]]:
        """Get team roster"""
        url = f"{self.base_url}/roster"
        params = {"team": team, "year": year}
        
        response = self._retry_request(url, headers=self.get_headers(), params=params)
        return response.json()
    
    def get_recruiting_data(self, year: str = "2025", team: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get recruiting/transfer data"""
        url = f"{self.base_url}/recruiting/players"
        params = {"year": year}
        if team:
            params["team"] = team
        
        response = self._retry_request(url, headers=self.get_headers(), params=params)
        return response.json()


class NBALiveFetcher(BaseLiveFetcher):
    """Fetch live NBA data from NBA Stats API"""
    
    def __init__(self):
        super().__init__(rate_limit=0.6)  # NBA API is strict
        self.base_url = "https://stats.nba.com/stats"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    def get_team_roster(self, team_abbr: str = "MEM") -> List[Dict[str, Any]]:
        """Get team roster from NBA API"""
        # Get team info first
        url = f"{self.base_url}/leaguedashteamstats"
        params = {
            "Season": "2024-25",
            "SeasonType": "Regular Season"
        }
        
        response = self._retry_request(url, headers=self.headers, params=params)
        data = response.json()
        
        # Find team ID
        team_id = None
        for team in data.get("resultSets", [{}])[0].get("rowSet", []):
            if team[1] == team_abbr:  # Team abbreviation is usually at index 1
                team_id = team[0]
                break
        
        if not team_id:
            raise ValueError(f"Team {team_abbr} not found")
        
        # Get roster
        roster_url = f"{self.base_url}/commonteamroster"
        roster_params = {
            "TeamID": team_id,
            "Season": "2024-25"
        }
        
        roster_response = self._retry_request(roster_url, headers=self.headers, params=roster_params)
        return roster_response.json()
    
    def get_player_stats(self, player_id: str, season: str = "2024-25") -> Dict[str, Any]:
        """Get player stats"""
        url = f"{self.base_url}/playerdashboardbygeneralsplits"
        params = {
            "PlayerID": player_id,
            "Season": season,
            "SeasonType": "Regular Season"
        }
        
        response = self._retry_request(url, headers=self.headers, params=params)
        return response.json()


class InternationalLiveFetcher(BaseLiveFetcher):
    """Fetch international baseball data (KBO, NPB, etc.)"""
    
    def __init__(self, api_key: Optional[str] = None):
        super().__init__(rate_limit=1.0)
        self.api_key = api_key or os.getenv("THESPORTSDB_API_KEY")
        self.base_url = "https://www.thesportsdb.com/api/v1/json"
        
        if self.api_key:
            self.base_url += f"/{self.api_key}"
        else:
            self.base_url += "/3"  # Free tier
    
    def search_players(self, team_name: str) -> List[Dict[str, Any]]:
        """Search for players by team name"""
        url = f"{self.base_url}/searchplayers.php"
        params = {"t": team_name}
        
        response = self._retry_request(url, params=params)
        data = response.json()
        return data.get("player", []) if data.get("player") else []
    
    def get_kbo_teams(self) -> List[Dict[str, Any]]:
        """Get KBO teams"""
        # Common KBO teams
        kbo_teams = [
            "Kia Tigers", "Samsung Lions", "LG Twins", "Doosan Bears",
            "KT Wiz", "SSG Landers", "Lotte Giants", "Hanwha Eagles",
            "NC Dinos", "Kiwoom Heroes"
        ]
        
        all_players = []
        for team in kbo_teams[:3]:  # Limit to prevent API overuse
            try:
                players = self.search_players(team)
                all_players.extend(players)
            except Exception as e:
                print(f"Failed to get data for {team}: {e}")
                continue
        
        return all_players


class NILLiveFetcher(BaseLiveFetcher):
    """Fetch NIL (Name, Image, Likeness) data"""
    
    def __init__(self):
        super().__init__(rate_limit=2.0)  # Be conservative with social APIs
    
    def get_nil_rankings(self) -> List[Dict[str, Any]]:
        """Get NIL valuation data - would connect to On3, 247Sports, etc."""
        # This would typically connect to NIL databases like On3 NIL Rankings
        # For now, return structured placeholder that matches schema
        return [
            {
                "name": "Arch Manning",
                "sport": "Football",
                "team": "Texas",
                "valuation_usd": 3100000,
                "engagement_rate": 0.067,
                "followers_total": 450000,
                "deals_last_90d": 8,
                "deal_value_90d_usd": 285000,
                "search_index": 95.2,
                "local_popularity_index": 98.5
            },
            {
                "name": "Quinn Ewers",
                "sport": "Football", 
                "team": "Texas",
                "valuation_usd": 1250000,
                "engagement_rate": 0.048,
                "followers_total": 285000,
                "deals_last_90d": 12,
                "deal_value_90d_usd": 185000,
                "search_index": 78.5,
                "local_popularity_index": 92.1
            }
        ]


# Export all fetchers
__all__ = [
    'MLBLiveFetcher',
    'NFLLiveFetcher', 
    'NCAALiveFetcher',
    'NBALiveFetcher',
    'InternationalLiveFetcher',
    'NILLiveFetcher'
]
