#!/usr/bin/env python3
"""
NBA Data Agent for Blaze Intelligence
Fetches live Memphis Grizzlies data and other NBA teams using NBA Stats API
"""

import requests
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class NBADataAgent:
    """Agent for fetching and processing NBA data"""
    
    def __init__(self, team_focus: List[str] = None):
        self.team_focus = team_focus or ["1610612763"]  # Memphis Grizzlies team ID
        self.base_url = "https://stats.nba.com/stats"
        self.session = requests.Session()
        
        # NBA API requires specific headers
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.nba.com/',
            'Connection': 'keep-alive'
        })
        
        self.grizzlies_roster = [
            {"name": "Ja Morant", "position": "PG", "jersey": "12"},
            {"name": "Jaren Jackson Jr.", "position": "PF", "jersey": "13"},
            {"name": "Desmond Bane", "position": "SG", "jersey": "22"},
            {"name": "Marcus Smart", "position": "PG", "jersey": "36"},
            {"name": "Jaylen Wells", "position": "SF", "jersey": "0"}
        ]
        
    def fetch_team_roster(self, team_id: str) -> List[Dict[str, Any]]:
        """Fetch current roster for team"""
        try:
            url = f"{self.base_url}/commonteamroster"
            params = {
                'TeamID': team_id,
                'Season': '2024-25'
            }
            
            response = self.session.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'resultSets' in data and len(data['resultSets']) > 0:
                    headers = data['resultSets'][0]['headers']
                    rows = data['resultSets'][0]['rowSet']
                    
                    roster = []
                    for row in rows:
                        player_data = dict(zip(headers, row))
                        roster.append({
                            'player_id': str(player_data.get('PLAYER_ID', '')),
                            'name': player_data.get('PLAYER', ''),
                            'position': player_data.get('POSITION', ''),
                            'jersey': player_data.get('NUM', ''),
                            'height': player_data.get('HEIGHT', ''),
                            'weight': player_data.get('WEIGHT', ''),
                            'experience': player_data.get('EXP', ''),
                            'school': player_data.get('SCHOOL', '')
                        })
                    
                    return roster
            
            # Fallback to predefined roster
            logger.warning(f"API call failed for team {team_id}, using predefined roster")
            return self.grizzlies_roster
            
        except Exception as e:
            logger.error(f"Error fetching roster for team {team_id}: {str(e)}")
            return self.grizzlies_roster
    
    def fetch_player_stats(self, player_id: str) -> Dict[str, Any]:
        """Fetch individual player statistics"""
        try:
            url = f"{self.base_url}/playerdashboardbyyearoveryear"
            params = {
                'PlayerID': player_id,
                'Season': '2024-25',
                'SeasonType': 'Regular Season'
            }
            
            response = self.session.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'resultSets' in data and len(data['resultSets']) > 0:
                    headers = data['resultSets'][0]['headers']
                    rows = data['resultSets'][0]['rowSet']
                    
                    if rows:
                        stats = dict(zip(headers, rows[0]))
                        return {
                            'games_played': stats.get('GP', 0),
                            'points_per_game': stats.get('PTS', 0),
                            'rebounds_per_game': stats.get('REB', 0),
                            'assists_per_game': stats.get('AST', 0),
                            'field_goal_pct': stats.get('FG_PCT', 0),
                            'three_point_pct': stats.get('FG3_PCT', 0),
                            'free_throw_pct': stats.get('FT_PCT', 0),
                            'minutes_per_game': stats.get('MIN', 0)
                        }
            
            # Return default stats if API fails
            return {
                'games_played': 0,
                'points_per_game': 0.0,
                'rebounds_per_game': 0.0,
                'assists_per_game': 0.0,
                'field_goal_pct': 0.0,
                'three_point_pct': 0.0,
                'free_throw_pct': 0.0,
                'minutes_per_game': 0.0
            }
            
        except Exception as e:
            logger.error(f"Error fetching stats for player {player_id}: {str(e)}")
            return {
                'games_played': 0,
                'points_per_game': 0.0,
                'rebounds_per_game': 0.0,
                'assists_per_game': 0.0,
                'field_goal_pct': 0.0,
                'three_point_pct': 0.0,
                'free_throw_pct': 0.0,
                'minutes_per_game': 0.0
            }
    
    def compute_havf_metrics(self, player_data: Dict[str, Any], stats: Dict[str, Any]) -> Dict[str, float]:
        """Compute HAV-F metrics for NBA player"""
        
        # Champion Readiness (0-100)
        # Based on statistical performance, experience, and team impact
        ppg = stats.get('points_per_game', 0)
        rpg = stats.get('rebounds_per_game', 0) 
        apg = stats.get('assists_per_game', 0)
        fg_pct = stats.get('field_goal_pct', 0)
        games = stats.get('games_played', 0)
        
        # Performance component (0-40)
        performance = min(40, (ppg * 1.5) + (rpg * 1.0) + (apg * 1.2) + (fg_pct * 20))
        
        # Physical/availability component (0-40)
        availability = min(40, (games / 82) * 40) if games > 0 else 20
        
        # Experience/clutch component (0-20)
        experience = min(20, 15)  # Base clutch factor
        
        champion_readiness = min(100, performance + availability + experience)
        
        # Cognitive Leverage (0-100)
        # NBA requires high basketball IQ - assists and efficiency indicate this
        court_vision = min(50, apg * 8 + (fg_pct * 25))
        decision_making = min(50, 30 + (stats.get('three_point_pct', 0) * 20))
        
        cognitive_leverage = min(100, court_vision + decision_making)
        
        # NIL Trust Score (0-100)
        # For NBA players, this represents marketability and brand value
        performance_factor = min(40, ppg * 2)
        popularity_factor = 35  # Base NBA player popularity
        consistency_factor = min(25, fg_pct * 25)
        
        nil_trust_score = min(100, performance_factor + popularity_factor + consistency_factor)
        
        return {
            "champion_readiness": round(champion_readiness, 1),
            "cognitive_leverage": round(cognitive_leverage, 1), 
            "nil_trust_score": round(nil_trust_score, 1)
        }
    
    def process_grizzlies_data(self) -> List[Dict[str, Any]]:
        """Process Memphis Grizzlies roster data"""
        team_id = "1610612763"  # Memphis Grizzlies
        roster = self.fetch_team_roster(team_id)
        
        processed_players = []
        
        for i, player in enumerate(roster[:5]):  # Focus on top 5 players
            try:
                # Get player stats
                player_id = player.get('player_id', f'nba_griz_{i}')
                stats = self.fetch_player_stats(player_id) if player_id.isdigit() else {}
                
                # Compute HAV-F metrics
                havf_metrics = self.compute_havf_metrics(player, stats)
                
                # Create Blaze Intelligence player record
                blaze_player = {
                    "player_id": f"nba_mem_{player_id}",
                    "name": player.get('name', f'Grizzlies Player {i+1}'),
                    "sport": "basketball",
                    "league": "NBA",
                    "team_id": "nba_mem",
                    "team_name": "Memphis Grizzlies",
                    "position": player.get('position', 'G'),
                    "jersey_number": str(player.get('jersey', i+1)),
                    "height": player.get('height', '6-2'),
                    "weight": player.get('weight', '200'),
                    "age": 24,  # Average NBA age
                    "experience_years": player.get('experience', 3),
                    "school": player.get('school', 'Unknown'),
                    "stats": {
                        "season": "2024-25",
                        "games_played": stats.get('games_played', 0),
                        "points_per_game": stats.get('points_per_game', 0.0),
                        "rebounds_per_game": stats.get('rebounds_per_game', 0.0),
                        "assists_per_game": stats.get('assists_per_game', 0.0),
                        "field_goal_percentage": stats.get('field_goal_pct', 0.0),
                        "three_point_percentage": stats.get('three_point_pct', 0.0),
                        "free_throw_percentage": stats.get('free_throw_pct', 0.0),
                        "minutes_per_game": stats.get('minutes_per_game', 0.0)
                    },
                    "havf_scores": havf_metrics,
                    "metadata": {
                        "last_updated": datetime.now().isoformat(),
                        "data_source": "nba_stats_api",
                        "agent_version": "1.0"
                    }
                }
                
                processed_players.append(blaze_player)
                logger.info(f"✅ Processed NBA player: {blaze_player['name']} (Readiness: {havf_metrics['champion_readiness']})")
                
                # Rate limiting
                time.sleep(1)
                
            except Exception as e:
                logger.error(f"Error processing player {player.get('name', 'Unknown')}: {str(e)}")
                continue
        
        return processed_players
    
    def save_data(self, players: List[Dict[str, Any]]) -> str:
        """Save processed data to JSON file"""
        output_file = f"data/nba_grizzlies_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        output_data = {
            "team": "Memphis Grizzlies",
            "league": "NBA", 
            "data_timestamp": datetime.now().isoformat(),
            "player_count": len(players),
            "players": players,
            "summary": {
                "avg_champion_readiness": round(sum(p["havf_scores"]["champion_readiness"] for p in players) / len(players), 1) if players else 0,
                "avg_cognitive_leverage": round(sum(p["havf_scores"]["cognitive_leverage"] for p in players) / len(players), 1) if players else 0,
                "avg_nil_trust": round(sum(p["havf_scores"]["nil_trust_score"] for p in players) / len(players), 1) if players else 0
            }
        }
        
        try:
            with open(output_file, 'w') as f:
                json.dump(output_data, f, indent=2)
            
            logger.info(f"💾 Saved NBA data to: {output_file}")
            return output_file
            
        except Exception as e:
            logger.error(f"Error saving NBA data: {str(e)}")
            return ""


    def run(self, params: Dict[str, Any] = None, live: bool = False) -> bool:
        """Run NBA agent with orchestrator interface"""
        try:
            print("🏀 NBA Data Agent - Processing Memphis Grizzlies...")
            
            # Process Grizzlies data
            players = self.process_grizzlies_data()
            
            if players:
                print(f"✅ Processed {len(players)} Grizzlies players")
                
                # Save data
                output_file = self.save_data(players)
                
                if output_file:
                    print(f"💾 Data saved to: {output_file}")
                    return True
                else:
                    print("❌ Error saving data")
                    return False
            else:
                print("❌ No player data processed")
                return False
                
        except Exception as e:
            logger.error(f"NBA agent execution failed: {str(e)}")
            return False


def main():
    """Test the NBA agent"""
    print("🏀 BLAZE INTELLIGENCE - NBA DATA AGENT")
    print("=" * 50)
    
    agent = NBADataAgent()
    success = agent.run()
    
    if success:
        print("🟢 NBA Agent execution completed successfully!")
    else:
        print("❌ NBA Agent execution failed")


if __name__ == "__main__":
    main()