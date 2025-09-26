#!/usr/bin/env python3
"""
Feature Engineering for NIL Valuation Pipeline
Computes Attention Score, Performance Index, and market context features
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple
from prefect import task, flow
from prefect.logging import get_run_logger
import structlog

logger = structlog.get_logger()


@task(name="compute_attention_score")
def compute_attention_score(
    social_data: List[Dict[str, Any]], 
    trends_data: List[Dict[str, Any]],
    weights: Dict[str, float] = None
) -> List[Dict[str, Any]]:
    """
    Compute Attention Score (weighted social + search)
    """
    if weights is None:
        weights = {"social": 0.6, "search": 0.4}
    
    logger.info("Computing attention scores")
    
    # Convert to DataFrames for easier processing
    social_df = pd.DataFrame(social_data)
    trends_df = pd.DataFrame(trends_data)
    
    attention_scores = []
    
    for _, social_row in social_df.iterrows():
        athlete_id = social_row['athlete_id']
        
        # Find corresponding trends data by athlete name
        trends_row = None
        for _, trend in trends_df.iterrows():
            # Would need better name matching in production
            if athlete_id in trend.get('athlete_name', ''):
                trends_row = trend
                break
        
        # Social component (normalized)
        social_component = compute_social_score(social_row)
        
        # Search component (normalized)
        search_component = 0.0
        if trends_row is not None:
            search_component = compute_search_score(trends_row)
        
        # Combined attention score with decay
        attention_score = (
            weights["social"] * social_component + 
            weights["search"] * search_component
        )
        
        # Apply daily decay (0.95 factor per day)
        days_since_measurement = 0  # Assume current data for now
        decayed_score = attention_score * (0.95 ** days_since_measurement)
        
        attention_scores.append({
            "athlete_id": athlete_id,
            "measurement_date": social_row['measurement_date'],
            "social_component": social_component,
            "search_component": search_component,
            "raw_attention_score": attention_score,
            "decayed_attention_score": decayed_score,
            "decay_days": days_since_measurement
        })
    
    return attention_scores


def compute_social_score(social_row: pd.Series) -> float:
    """Compute normalized social media score"""
    
    # Follower score (log-normalized to handle wide ranges)
    follower_score = np.log10(max(social_row['total_followers'], 1)) / 7.0  # Max ~10M
    
    # Engagement score
    engagement_score = min(social_row['avg_engagement_rate'] * 20, 1.0)  # Cap at 1.0
    
    # Growth score (monthly growth rate)
    growth_score = np.tanh(social_row['monthly_engagement_growth'] * 10) * 0.5 + 0.5
    
    # Weighted combination
    social_score = (
        0.4 * follower_score +
        0.4 * engagement_score +
        0.2 * growth_score
    )
    
    return min(max(social_score, 0.0), 1.0)


def compute_search_score(trends_row: pd.Series) -> float:
    """Compute normalized search interest score"""
    
    # Search volume score (log-normalized)
    volume_score = np.log10(max(trends_row['google_search_volume'], 1)) / 5.0  # Max ~100K
    
    # Trends score (already 0-100)
    trends_score = trends_row['google_trends_score'] / 100.0
    
    # Local popularity score
    local_score = trends_row['local_search_popularity'] / 100.0
    
    # Weighted combination
    search_score = (
        0.5 * volume_score +
        0.3 * trends_score +
        0.2 * local_score
    )
    
    return min(max(search_score, 0.0), 1.0)


@task(name="compute_performance_index")
def compute_performance_index(
    box_scores: List[Dict[str, Any]],
    weights: Dict[str, float] = None
) -> List[Dict[str, Any]]:
    """
    Compute Performance Index per game
    """
    if weights is None:
        weights = {"recency": 0.3, "consistency": 0.4, "peak": 0.3}
    
    logger.info("Computing performance indices")
    
    # Group by athlete
    athlete_performances = {}
    for score in box_scores:
        athlete_id = score['athlete_id']
        if athlete_id not in athlete_performances:
            athlete_performances[athlete_id] = []
        athlete_performances[athlete_id].append(score)
    
    performance_indices = []
    
    for athlete_id, performances in athlete_performances.items():
        # Sort by date
        performances.sort(key=lambda x: x['game_date'])
        
        # Extract performance indices
        perf_values = [p['performance_index'] for p in performances]
        game_impacts = [p['game_impact_score'] for p in performances]
        
        if not perf_values:
            continue
        
        # Recency component (weight recent games more)
        recency_weights = np.exp(np.linspace(-2, 0, len(perf_values)))
        recency_score = np.average(perf_values, weights=recency_weights)
        
        # Consistency component (inverse of coefficient of variation)
        consistency_score = 1.0 / (1.0 + np.std(perf_values))
        
        # Peak component (best performances)
        peak_score = np.mean(sorted(perf_values, reverse=True)[:3])  # Top 3 games
        
        # Combined performance index
        combined_index = (
            weights["recency"] * recency_score +
            weights["consistency"] * consistency_score +
            weights["peak"] * peak_score
        )
        
        performance_indices.append({
            "athlete_id": athlete_id,
            "measurement_date": datetime.now().isoformat(),
            "recency_score": recency_score,
            "consistency_score": consistency_score,
            "peak_score": peak_score,
            "combined_performance_index": combined_index,
            "games_analyzed": len(performances),
            "avg_game_impact": np.mean(game_impacts)
        })
    
    return performance_indices


@task(name="join_market_context")
def join_market_context(
    athlete_data: List[Dict[str, Any]],
    school_context: Dict[str, Dict[str, Any]] = None
) -> List[Dict[str, Any]]:
    """
    Join with context data (school market size, TV exposure)
    """
    logger.info("Joining market context data")
    
    # Default school context data
    if school_context is None:
        school_context = {
            "Texas": {
                "market_tier": 1,
                "tv_exposure_score": 95,
                "nil_collective_strength": 0.92,
                "conference": "SEC",
                "recruiting_budget_tier": 1
            },
            "LSU": {
                "market_tier": 1,
                "tv_exposure_score": 88,
                "nil_collective_strength": 0.85,
                "conference": "SEC",
                "recruiting_budget_tier": 1
            },
            "Iowa": {
                "market_tier": 2,
                "tv_exposure_score": 75,
                "nil_collective_strength": 0.68,
                "conference": "Big Ten",
                "recruiting_budget_tier": 2
            }
        }
    
    enriched_data = []
    
    for athlete in athlete_data:
        # Extract school from athlete_id or add mapping
        school = extract_school_from_id(athlete['athlete_id'])
        
        # Get context data
        context = school_context.get(school, {
            "market_tier": 3,
            "tv_exposure_score": 50,
            "nil_collective_strength": 0.5,
            "conference": "Unknown",
            "recruiting_budget_tier": 3
        })
        
        # Add context to athlete data
        enriched_athlete = athlete.copy()
        enriched_athlete.update({
            "school": school,
            "market_tier": context["market_tier"],
            "tv_exposure_score": context["tv_exposure_score"],
            "nil_collective_strength": context["nil_collective_strength"],
            "conference": context["conference"],
            "recruiting_budget_tier": context["recruiting_budget_tier"],
            # Computed market context features
            "market_advantage_score": compute_market_advantage(context),
            "exposure_multiplier": compute_exposure_multiplier(context)
        })
        
        enriched_data.append(enriched_athlete)
    
    return enriched_data


def extract_school_from_id(athlete_id: str) -> str:
    """Extract school name from athlete ID"""
    # Simple extraction - in production would have mapping table
    if "LSU" in athlete_id:
        return "LSU"
    elif "TEX" in athlete_id:
        return "Texas"
    elif "IOWA" in athlete_id:
        return "Iowa"
    else:
        return "Unknown"


def compute_market_advantage(context: Dict[str, Any]) -> float:
    """Compute overall market advantage score"""
    market_score = (4 - context["market_tier"]) / 3.0  # Invert tier (1=best)
    tv_score = context["tv_exposure_score"] / 100.0
    nil_score = context["nil_collective_strength"]
    
    advantage_score = (0.4 * market_score + 0.3 * tv_score + 0.3 * nil_score)
    return min(max(advantage_score, 0.0), 1.0)


def compute_exposure_multiplier(context: Dict[str, Any]) -> float:
    """Compute exposure multiplier for NIL value"""
    base_multiplier = 1.0
    
    # Market tier adjustment
    tier_multipliers = {1: 1.5, 2: 1.2, 3: 1.0}
    market_mult = tier_multipliers.get(context["market_tier"], 1.0)
    
    # TV exposure adjustment
    tv_mult = 1.0 + (context["tv_exposure_score"] - 50) / 100.0
    
    # NIL collective strength
    nil_mult = 1.0 + context["nil_collective_strength"] * 0.5
    
    return base_multiplier * market_mult * tv_mult * nil_mult


@flow(name="feature_engineering")
def feature_engineering_flow(
    box_scores: List[Dict[str, Any]],
    social_data: List[Dict[str, Any]],
    trends_data: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Main feature engineering flow
    """
    logger.info("Starting feature engineering flow")
    
    # Step 1: Compute attention scores
    attention_scores = compute_attention_score(social_data, trends_data)
    
    # Step 2: Compute performance indices
    performance_indices = compute_performance_index(box_scores)
    
    # Step 3: Combine features by athlete
    combined_features = combine_features(attention_scores, performance_indices)
    
    # Step 4: Join market context
    enriched_features = join_market_context(combined_features)
    
    result = {
        "status": "success",
        "timestamp": datetime.now().isoformat(),
        "features_computed": {
            "attention_scores": len(attention_scores),
            "performance_indices": len(performance_indices),
            "enriched_features": len(enriched_features)
        },
        "enriched_data": enriched_features
    }
    
    logger.info("Feature engineering completed", result=result)
    return result


def combine_features(
    attention_scores: List[Dict[str, Any]], 
    performance_indices: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """Combine attention and performance features by athlete"""
    
    # Create lookup dictionaries
    attention_lookup = {item['athlete_id']: item for item in attention_scores}
    performance_lookup = {item['athlete_id']: item for item in performance_indices}
    
    # Get all athlete IDs
    all_athlete_ids = set(attention_lookup.keys()) | set(performance_lookup.keys())
    
    combined = []
    for athlete_id in all_athlete_ids:
        feature_dict = {"athlete_id": athlete_id}
        
        # Add attention features
        if athlete_id in attention_lookup:
            attention_data = attention_lookup[athlete_id]
            feature_dict.update({
                "attention_score": attention_data["decayed_attention_score"],
                "social_component": attention_data["social_component"],
                "search_component": attention_data["search_component"]
            })
        else:
            feature_dict.update({
                "attention_score": 0.0,
                "social_component": 0.0,
                "search_component": 0.0
            })
        
        # Add performance features
        if athlete_id in performance_lookup:
            perf_data = performance_lookup[athlete_id]
            feature_dict.update({
                "performance_index": perf_data["combined_performance_index"],
                "consistency_score": perf_data["consistency_score"],
                "peak_score": perf_data["peak_score"]
            })
        else:
            feature_dict.update({
                "performance_index": 0.0,
                "consistency_score": 0.0,
                "peak_score": 0.0
            })
        
        combined.append(feature_dict)
    
    return combined


if __name__ == "__main__":
    # Example usage
    from etl.data_ingestion import nil_data_ingestion_flow
    
    # Get sample data
    ingestion_result = nil_data_ingestion_flow()
    
    # Load the stored data (simplified for demo)
    box_scores = [
        {
            "athlete_id": "NIL-WILLIAMS-LSU",
            "game_date": "2024-09-21",
            "performance_index": 0.85,
            "game_impact_score": 0.92
        }
    ]
    
    social_data = [
        {
            "athlete_id": "NIL-WILLIAMS-LSU",
            "measurement_date": datetime.now().isoformat(),
            "total_followers": 645000,
            "avg_engagement_rate": 0.067,
            "monthly_engagement_growth": 0.15
        }
    ]
    
    trends_data = [
        {
            "athlete_name": "Jayden Daniels",
            "google_search_volume": 5500,
            "google_trends_score": 85.2,
            "local_search_popularity": 92.1
        }
    ]
    
    # Run feature engineering
    result = feature_engineering_flow(box_scores, social_data, trends_data)
    print(result)