"""
HAV-F (High-Performance Athlete Valuation Framework) computation module.
Computes three core metrics:
- Champion Readiness: Performance + Physical + Trajectory blend
- Cognitive Leverage: Neural efficiency + Composure under pressure
- NIL Trust Score: Authenticity + Velocity + Salience
"""

from datetime import datetime, timezone
from typing import Dict, List, Optional, Any


def normalize_value(value: float, min_val: float = 0, max_val: float = 100) -> float:
    """Clamp value to [min_val, max_val] range."""
    return round(max(min_val, min(max_val, value)), 1)


def compute_champion_readiness(player: Dict[str, Any]) -> Optional[float]:
    """
    Compute champion readiness score (0-100).
    Formula: 0.5*performance + 0.4*physical + 0.1*trajectory
    """
    # Performance score from stats
    perf_score = 50.0  # Default baseline
    
    if "stats" in player and "perfs" in player["stats"]:
        perfs = player["stats"]["perfs"]
        sport = player.get("sport", "")
        
        if sport == "MLB":
            # MLB: Combine WAR + WPA
            war = perfs.get("war", 0)
            wpa = perfs.get("wpa", 0)
            perf_score = normalize_value(30 * war + 200 * wpa + 30)
        elif sport == "NFL":
            # NFL: EPA-based
            epa = perfs.get("epa", 0)
            perf_score = normalize_value(50 + epa * 2)
        elif sport in ["NCAA-FB", "HS-FB"]:
            # Football: Yards/TD weighted
            yards = perfs.get("total_yards", 0)
            tds = perfs.get("total_tds", 0)
            perf_score = normalize_value(yards/100 + tds*5)
    
    # Physical score from biometrics
    phys_score = 50.0  # Default if missing
    
    if "biometrics" in player and player["biometrics"] is not None:
        bio = player["biometrics"]
        scores = []
        
        # HRV: Higher is better (40-80ms good range)
        if bio.get("hrv_rmssd_ms") is not None:
            hrv = bio["hrv_rmssd_ms"]
            hrv_score = normalize_value((hrv - 20) * 1.25)
            scores.append(hrv_score)
        
        # Reaction: Lower is better (150-250ms range)
        if bio.get("reaction_ms") is not None:
            reaction = bio["reaction_ms"]
            reaction_score = normalize_value(100 - (reaction - 150) * 0.5)
            scores.append(reaction_score)
        
        # GSR: Lower is better (2-10 microsiemens range)
        if bio.get("gsr_microsiemens") is not None:
            gsr = bio["gsr_microsiemens"]
            gsr_score = normalize_value(100 - (gsr - 2) * 10)
            scores.append(gsr_score)
        
        # Sleep: 7-9 hours optimal
        if bio.get("sleep_hours") is not None:
            sleep = bio["sleep_hours"]
            if 7 <= sleep <= 9:
                sleep_score = 100
            else:
                sleep_score = normalize_value(100 - abs(8 - sleep) * 20)
            scores.append(sleep_score)
        
        if scores:
            phys_score = sum(scores) / len(scores)
    
    # Trajectory score (age/experience heuristic)
    traj_score = 50.0  # Default
    
    if "bio" in player and player["bio"].get("dob"):
        try:
            dob_raw = player["bio"]["dob"]
            dob = datetime.fromisoformat(dob_raw.replace("Z", "+00:00"))
            if dob.tzinfo is None:
                dob = dob.replace(tzinfo=timezone.utc)
            now = datetime.now(timezone.utc)
            age = (now - dob).days / 365.25
            
            # Peak athletic age modeling (24-28 optimal)
            if 24 <= age <= 28:
                traj_score = 90
            elif 20 <= age < 24:
                traj_score = 70 + (age - 20) * 5
            elif 28 < age <= 35:
                traj_score = 90 - (age - 28) * 5
            else:
                traj_score = 50
        except:
            pass
    
    # Final blend
    score = 0.5 * perf_score + 0.4 * phys_score + 0.1 * traj_score
    return normalize_value(score)


def compute_cognitive_leverage(player: Dict[str, Any]) -> Optional[float]:
    """
    Compute cognitive leverage score (0-100).
    Formula: 0.6*neural_efficiency + 0.4*composure
    """
    if "biometrics" not in player or player["biometrics"] is None:
        return 25.0  # Default low score for missing data
    
    bio = player["biometrics"]
    has_data = False
    
    # Neural efficiency (from reaction time)
    neural_score = 50.0
    if bio.get("reaction_ms") is not None:
        reaction = bio["reaction_ms"]
        # Invert: Lower reaction = higher neural efficiency
        # 150ms = 100, 250ms = 0
        neural_score = normalize_value(100 - (reaction - 150))
        has_data = True
    
    # Composure (HRV high + GSR low)
    composure_score = 50.0
    composure_components = []
    
    if bio.get("hrv_rmssd_ms") is not None:
        hrv = bio["hrv_rmssd_ms"]
        # Higher HRV = better composure
        hrv_score = normalize_value((hrv - 20) * 1.25)
        composure_components.append(hrv_score)
        has_data = True
    
    if bio.get("gsr_microsiemens") is not None:
        gsr = bio["gsr_microsiemens"]
        # Lower GSR = better composure
        gsr_score = normalize_value(100 - (gsr - 2) * 10)
        composure_components.append(gsr_score)
        has_data = True
    
    if composure_components:
        composure_score = sum(composure_components) / len(composure_components)
    
    if not has_data:
        return None
    
    # Final blend
    score = 0.6 * neural_score + 0.4 * composure_score
    return normalize_value(score)


def compute_nil_trust(player: Dict[str, Any]) -> Optional[float]:
    """
    Compute NIL trust score (0-100).
    Formula: 0.6*authenticity + 0.25*velocity + 0.15*salience
    """
    if "nil_profile" not in player:
        return 15.0  # Default low score for no NIL data
    
    nil = player["nil_profile"]
    
    # Check if nil_profile is None or empty
    if nil is None:
        return 15.0
    
    # Check if all fields are null
    if all(nil.get(k) is None for k in nil.keys()):
        return 15.0  # Default low score for empty NIL data
    
    # Authenticity (engagement rate)
    authenticity_score = 50.0
    if nil.get("engagement_rate") is not None:
        engagement = nil["engagement_rate"]
        # 5% engagement = 100 score
        authenticity_score = normalize_value(engagement * 20)
    
    # Velocity (deals and value in last 90 days)
    velocity_score = 50.0
    velocity_components = []
    
    if nil.get("deals_last_90d") is not None:
        deals = nil["deals_last_90d"]
        # 10+ deals = high velocity
        deals_score = normalize_value(deals * 10)
        velocity_components.append(deals_score)
    
    if nil.get("deal_value_90d_usd") is not None:
        value = nil["deal_value_90d_usd"]
        # $100k+ = high velocity
        value_score = normalize_value(value / 1000)
        velocity_components.append(value_score)
    
    if velocity_components:
        velocity_score = sum(velocity_components) / len(velocity_components)
    
    # Salience (search and local popularity)
    salience_score = 50.0
    salience_components = []
    
    if nil.get("search_index") is not None:
        salience_components.append(normalize_value(nil["search_index"]))
    
    if nil.get("local_popularity_index") is not None:
        salience_components.append(normalize_value(nil["local_popularity_index"]))
    
    if salience_components:
        salience_score = sum(salience_components) / len(salience_components)
    
    # Final blend
    score = 0.6 * authenticity_score + 0.25 * velocity_score + 0.15 * salience_score
    return normalize_value(score)


def stamp_havf(player_dict: Dict[str, Any], now_iso: str) -> None:
    """
    Compute and stamp HAV-F scores on player dict in-place.
    Also updates meta.updated_at.
    """
    # Compute scores
    champion_readiness = compute_champion_readiness(player_dict)
    cognitive_leverage = compute_cognitive_leverage(player_dict)
    nil_trust_score = compute_nil_trust(player_dict)
    
    # Stamp HAV-F
    if "hav_f" not in player_dict:
        player_dict["hav_f"] = {}
    
    player_dict["hav_f"]["champion_readiness"] = champion_readiness
    player_dict["hav_f"]["cognitive_leverage"] = cognitive_leverage
    player_dict["hav_f"]["nil_trust_score"] = nil_trust_score
    player_dict["hav_f"]["last_computed_at"] = now_iso
    
    # Update meta
    if "meta" not in player_dict:
        player_dict["meta"] = {}
    player_dict["meta"]["updated_at"] = now_iso


def compute_all(players: List[Dict[str, Any]]) -> None:
    """
    Apply HAV-F computation to all players in-place.
    """
    now_iso = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    for player in players:
        stamp_havf(player, now_iso)
