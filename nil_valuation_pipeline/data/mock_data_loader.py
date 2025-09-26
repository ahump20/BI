#!/usr/bin/env python3
"""
Mock Data Loader for NIL Valuation Pipeline
Seeds database with 5 athletes across 2 sports for testing and demonstration
"""

import json
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Any
import pandas as pd
import numpy as np

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.database import DatabaseManager, Athlete, PerformanceData, SocialMetrics, NILValuation, SchoolContext


class MockDataLoader:
    """Loads mock data for NIL valuation pipeline testing"""
    
    def __init__(self, db_manager: DatabaseManager = None):
        self.db_manager = db_manager
        self.athletes_data = self._create_mock_athletes()
        self.schools_data = self._create_mock_schools()
    
    def _create_mock_athletes(self) -> List[Dict[str, Any]]:
        """Create mock athlete data for 5 athletes across 2 sports"""
        
        return [
            {
                "id": "NIL-WILLIAMS-LSU",
                "name": "Jayden Daniels", 
                "sport": "Football",
                "position": "QB",
                "school": "LSU",
                "class_year": "Senior",
                "height_cm": 191,
                "weight_kg": 88,
                "date_of_birth": datetime(2000, 12, 18),
                "base_nil_value": 3800000,
                "performance_profile": {
                    "consistency": 0.85,
                    "peak_performance": 0.95,
                    "clutch_factor": 0.88
                },
                "social_profile": {
                    "base_followers": 645000,
                    "engagement_rate": 0.067,
                    "growth_rate": 0.15,
                    "viral_potential": 0.78
                }
            },
            {
                "id": "NIL-CLARK-IOWA",
                "name": "Caitlin Clark",
                "sport": "Basketball", 
                "position": "PG",
                "school": "Iowa",
                "class_year": "Senior",
                "height_cm": 183,
                "weight_kg": 70,
                "date_of_birth": datetime(2002, 1, 22),
                "base_nil_value": 4500000,
                "performance_profile": {
                    "consistency": 0.92,
                    "peak_performance": 0.99,
                    "clutch_factor": 0.95
                },
                "social_profile": {
                    "base_followers": 1250000,
                    "engagement_rate": 0.095,
                    "growth_rate": 0.25,
                    "viral_potential": 0.95
                }
            },
            {
                "id": "NIL-MANNING-TEX", 
                "name": "Arch Manning",
                "sport": "Football",
                "position": "QB", 
                "school": "Texas",
                "class_year": "Sophomore",
                "height_cm": 196,
                "weight_kg": 95,
                "date_of_birth": datetime(2005, 6, 27),
                "base_nil_value": 3100000,
                "performance_profile": {
                    "consistency": 0.68,
                    "peak_performance": 0.85,
                    "clutch_factor": 0.72
                },
                "social_profile": {
                    "base_followers": 770000,
                    "engagement_rate": 0.078,
                    "growth_rate": 0.18,
                    "viral_potential": 0.85
                }
            },
            {
                "id": "NIL-REESE-LSU",
                "name": "Angel Reese",
                "sport": "Basketball",
                "position": "PF",
                "school": "LSU", 
                "class_year": "Senior",
                "height_cm": 191,
                "weight_kg": 84,
                "date_of_birth": datetime(2002, 5, 6),
                "base_nil_value": 2400000,
                "performance_profile": {
                    "consistency": 0.78,
                    "peak_performance": 0.88,
                    "clutch_factor": 0.82
                },
                "social_profile": {
                    "base_followers": 520000,
                    "engagement_rate": 0.089,
                    "growth_rate": 0.22,
                    "viral_potential": 0.88
                }
            },
            {
                "id": "NIL-ROCKER-VANDY",
                "name": "Kumar Rocker",
                "sport": "Baseball",
                "position": "RHP",
                "school": "Vanderbilt",
                "class_year": "Junior", 
                "height_cm": 196,
                "weight_kg": 102,
                "date_of_birth": datetime(1999, 11, 22),
                "base_nil_value": 650000,
                "performance_profile": {
                    "consistency": 0.82,
                    "peak_performance": 0.91,
                    "clutch_factor": 0.85
                },
                "social_profile": {
                    "base_followers": 125000,
                    "engagement_rate": 0.042,
                    "growth_rate": 0.08,
                    "viral_potential": 0.45
                }
            }
        ]
    
    def _create_mock_schools(self) -> List[Dict[str, Any]]:
        """Create mock school context data"""
        
        return [
            {
                "school_name": "LSU",
                "conference": "SEC",
                "market_size_tier": 1,
                "tv_exposure_score": 88.0,
                "recruiting_budget_tier": 1,
                "nil_collective_strength": 0.85,
                "local_media_reach": 850000,
                "alumni_network_size": 275000
            },
            {
                "school_name": "Iowa", 
                "conference": "Big Ten",
                "market_size_tier": 2,
                "tv_exposure_score": 75.0,
                "recruiting_budget_tier": 2,
                "nil_collective_strength": 0.68,
                "local_media_reach": 420000,
                "alumni_network_size": 185000
            },
            {
                "school_name": "Texas",
                "conference": "SEC",
                "market_size_tier": 1, 
                "tv_exposure_score": 95.0,
                "recruiting_budget_tier": 1,
                "nil_collective_strength": 0.92,
                "local_media_reach": 1200000,
                "alumni_network_size": 420000
            },
            {
                "school_name": "Vanderbilt",
                "conference": "SEC",
                "market_size_tier": 2,
                "tv_exposure_score": 65.0,
                "recruiting_budget_tier": 2,
                "nil_collective_strength": 0.55,
                "local_media_reach": 320000,
                "alumni_network_size": 125000
            }
        ]
    
    def generate_historical_performance(self, athlete: Dict[str, Any], days_back: int = 90) -> List[Dict[str, Any]]:
        """Generate historical performance data for an athlete"""
        
        np.random.seed(hash(athlete["id"]) % 2**32)  # Consistent random data per athlete
        
        performance_data = []
        sport = athlete["sport"]
        profile = athlete["performance_profile"]
        
        # Generate game data based on sport
        if sport == "Football":
            # Football: ~12 games per season
            game_dates = [datetime.now() - timedelta(days=i*7) for i in range(12)]
            
            for i, game_date in enumerate(game_dates):
                # Base performance with some variance
                base_perf = profile["consistency"] + np.random.normal(0, 0.1)
                
                # Add clutch bonus for important games (every 3rd game)
                if i % 3 == 0:
                    base_perf += profile["clutch_factor"] * 0.2
                
                performance_index = np.clip(base_perf, 0.0, 1.0)
                
                # Sport-specific stats
                if athlete["position"] == "QB":
                    stats = {
                        "pass_yards": int(250 + performance_index * 200 + np.random.normal(0, 50)),
                        "pass_td": int(2 + performance_index * 3 + np.random.poisson(1)),
                        "int": max(0, int(np.random.poisson(0.8 * (1 - performance_index)))),
                        "rush_yards": int(50 + performance_index * 100 + np.random.normal(0, 25)),
                        "rush_td": int(performance_index * 2 + np.random.poisson(0.5)),
                        "qbr": round(60 + performance_index * 35 + np.random.normal(0, 5), 1)
                    }
                else:
                    stats = {"general_performance": performance_index}
                
                performance_data.append({
                    "athlete_id": athlete["id"],
                    "game_date": game_date,
                    "opponent": f"Opponent_{i+1}",
                    "sport_specific_stats": stats,
                    "performance_index": round(performance_index, 3),
                    "game_impact_score": round(performance_index + np.random.normal(0, 0.05), 3)
                })
        
        elif sport == "Basketball":
            # Basketball: ~30 games per season
            game_dates = [datetime.now() - timedelta(days=i*3) for i in range(30)]
            
            for i, game_date in enumerate(game_dates):
                base_perf = profile["consistency"] + np.random.normal(0, 0.12)
                
                if i % 5 == 0:  # Big games
                    base_perf += profile["clutch_factor"] * 0.15
                
                performance_index = np.clip(base_perf, 0.0, 1.0)
                
                if athlete["position"] == "PG":
                    stats = {
                        "points": int(15 + performance_index * 25 + np.random.normal(0, 5)),
                        "rebounds": int(4 + performance_index * 8 + np.random.poisson(2)),
                        "assists": int(6 + performance_index * 10 + np.random.poisson(2)),
                        "fg_pct": round(0.35 + performance_index * 0.25 + np.random.normal(0, 0.05), 3),
                        "three_pt_pct": round(0.25 + performance_index * 0.20 + np.random.normal(0, 0.08), 3)
                    }
                elif athlete["position"] == "PF":
                    stats = {
                        "points": int(12 + performance_index * 20 + np.random.normal(0, 4)),
                        "rebounds": int(8 + performance_index * 12 + np.random.poisson(3)),
                        "assists": int(2 + performance_index * 4 + np.random.poisson(1)),
                        "blocks": int(1 + performance_index * 3 + np.random.poisson(1)),
                        "fg_pct": round(0.45 + performance_index * 0.20 + np.random.normal(0, 0.04), 3)
                    }
                else:
                    stats = {"general_performance": performance_index}
                
                performance_data.append({
                    "athlete_id": athlete["id"],
                    "game_date": game_date,
                    "opponent": f"Opponent_{i+1}",
                    "sport_specific_stats": stats,
                    "performance_index": round(performance_index, 3),
                    "game_impact_score": round(performance_index + np.random.normal(0, 0.08), 3)
                })
        
        elif sport == "Baseball":
            # Baseball: ~50 games per season
            game_dates = [datetime.now() - timedelta(days=i*2) for i in range(50)]
            
            for i, game_date in enumerate(game_dates):
                base_perf = profile["consistency"] + np.random.normal(0, 0.15)
                performance_index = np.clip(base_perf, 0.0, 1.0)
                
                if athlete["position"] == "RHP":
                    # Pitcher stats
                    innings = round(5 + performance_index * 4 + np.random.normal(0, 1), 1)
                    stats = {
                        "innings_pitched": max(1.0, innings),
                        "hits_allowed": int(3 + (1 - performance_index) * 8 + np.random.poisson(2)),
                        "earned_runs": int((1 - performance_index) * 5 + np.random.poisson(1)),
                        "strikeouts": int(4 + performance_index * 12 + np.random.poisson(2)),
                        "walks": int((1 - performance_index) * 4 + np.random.poisson(1)),
                        "era": round(2.0 + (1 - performance_index) * 6 + np.random.normal(0, 0.5), 2)
                    }
                else:
                    stats = {"general_performance": performance_index}
                
                performance_data.append({
                    "athlete_id": athlete["id"],
                    "game_date": game_date,
                    "opponent": f"Opponent_{i+1}",
                    "sport_specific_stats": stats,
                    "performance_index": round(performance_index, 3),
                    "game_impact_score": round(performance_index + np.random.normal(0, 0.1), 3)
                })
        
        return performance_data
    
    def generate_historical_social_metrics(self, athlete: Dict[str, Any], days_back: int = 90) -> List[Dict[str, Any]]:
        """Generate historical social media metrics"""
        
        np.random.seed(hash(athlete["id"] + "social") % 2**32)
        
        social_data = []
        profile = athlete["social_profile"]
        base_followers = profile["base_followers"]
        
        # Generate daily social metrics
        for i in range(days_back):
            measurement_date = datetime.now() - timedelta(days=i)
            
            # Simulate follower growth
            growth_factor = 1 + (profile["growth_rate"] / 365) * (days_back - i)
            current_followers = int(base_followers * growth_factor + np.random.normal(0, base_followers * 0.01))
            
            # Distribute across platforms
            twitter_followers = int(current_followers * 0.25 + np.random.normal(0, current_followers * 0.02))
            instagram_followers = int(current_followers * 0.55 + np.random.normal(0, current_followers * 0.03))
            tiktok_followers = int(current_followers * 0.20 + np.random.normal(0, current_followers * 0.02))
            
            # Engagement metrics with some volatility
            base_engagement = profile["engagement_rate"]
            daily_engagement = base_engagement + np.random.normal(0, base_engagement * 0.3)
            daily_engagement = max(0.001, daily_engagement)
            
            # Search metrics correlated with performance and social activity
            search_volume = int(1000 + current_followers / 100 + np.random.lognormal(6, 0.5))
            trends_score = min(100, max(10, 
                50 + (current_followers / 10000) + np.random.normal(0, 15)
            ))
            
            social_data.append({
                "athlete_id": athlete["id"],
                "measurement_date": measurement_date,
                "twitter_followers": twitter_followers,
                "instagram_followers": instagram_followers, 
                "tiktok_followers": tiktok_followers,
                "total_followers": twitter_followers + instagram_followers + tiktok_followers,
                "avg_engagement_rate": round(daily_engagement, 4),
                "weekly_engagement_growth": round(np.random.normal(0.02, 0.05), 4),
                "monthly_engagement_growth": round(profile["growth_rate"] / 12 + np.random.normal(0, 0.03), 4),
                "google_search_volume": search_volume,
                "google_trends_score": round(trends_score, 1),
                "local_search_popularity": round(trends_score * 0.8 + np.random.normal(0, 10), 1),
                "attention_score": None,  # Will be computed later
                "viral_coefficient": round(profile["viral_potential"] + np.random.normal(0, 0.1), 3)
            })
        
        return social_data
    
    def generate_nil_valuations(self, athlete: Dict[str, Any], days_back: int = 30) -> List[Dict[str, Any]]:
        """Generate historical NIL valuations"""
        
        np.random.seed(hash(athlete["id"] + "nil") % 2**32)
        
        valuations = []
        base_value = athlete["base_nil_value"]
        
        for i in range(0, days_back, 7):  # Weekly valuations
            valuation_date = datetime.now() - timedelta(days=i)
            
            # Add some variation to base value
            current_value = base_value + np.random.normal(0, base_value * 0.15)
            current_value = max(10000, current_value)  # Minimum $10k
            
            # Confidence intervals (wider for less established athletes)
            confidence_width = current_value * (0.2 + (1 - athlete["performance_profile"]["consistency"]) * 0.3)
            
            valuations.append({
                "athlete_id": athlete["id"],
                "valuation_date": valuation_date,
                "predicted_value_usd": round(current_value, 2),
                "confidence_interval_lower": round(current_value - confidence_width/2, 2),
                "confidence_interval_upper": round(current_value + confidence_width/2, 2),
                "prediction_confidence": round(athlete["performance_profile"]["consistency"], 2),
                "performance_contribution": round(current_value * 0.4, 2),
                "attention_contribution": round(current_value * 0.4, 2),
                "market_context_contribution": round(current_value * 0.2, 2),
                "model_version": "v1.0",
                "feature_importance": {
                    "attention_score": 0.25,
                    "performance_index": 0.30,
                    "market_advantage_score": 0.15,
                    "total_followers": 0.12,
                    "engagement_rate": 0.10,
                    "consistency_score": 0.08
                },
                "actual_deal_value_usd": None,  # Would be filled with real deal data
                "deal_count_90d": int(np.random.poisson(2 + current_value / 1000000)),
                "total_deal_value_90d": round(current_value * 0.3 + np.random.normal(0, current_value * 0.1), 2)
            })
        
        return valuations
    
    def save_mock_data_files(self, output_dir: str = "./data/mock_s3"):
        """Save all mock data to JSON files"""
        
        os.makedirs(output_dir, exist_ok=True)
        
        all_data = {
            "athletes": self.athletes_data,
            "schools": self.schools_data,
            "performance_data": [],
            "social_metrics": [],
            "nil_valuations": []
        }
        
        # Generate time series data for each athlete
        for athlete in self.athletes_data:
            all_data["performance_data"].extend(
                self.generate_historical_performance(athlete)
            )
            all_data["social_metrics"].extend(
                self.generate_historical_social_metrics(athlete)
            )
            all_data["nil_valuations"].extend(
                self.generate_nil_valuations(athlete)
            )
        
        # Save complete dataset
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        with open(os.path.join(output_dir, f"complete_mock_dataset_{timestamp}.json"), 'w') as f:
            json.dump(all_data, f, indent=2, default=str)
        
        # Save individual files
        for data_type, data in all_data.items():
            with open(os.path.join(output_dir, f"{data_type}_{timestamp}.json"), 'w') as f:
                json.dump(data, f, indent=2, default=str)
        
        print(f"Mock data files saved to {output_dir}")
        return output_dir
    
    def load_to_database(self):
        """Load mock data into database (if available)"""
        
        if not self.db_manager:
            print("No database manager available, skipping database load")
            return
        
        try:
            session = self.db_manager.get_session()
            
            # Load schools first
            for school_data in self.schools_data:
                school = SchoolContext(**school_data)
                session.merge(school)
            
            # Load athletes
            for athlete_data in self.athletes_data:
                athlete = Athlete(
                    id=athlete_data["id"],
                    name=athlete_data["name"],
                    sport=athlete_data["sport"],
                    position=athlete_data["position"],
                    school=athlete_data["school"],
                    class_year=athlete_data["class_year"],
                    height_cm=athlete_data["height_cm"],
                    weight_kg=athlete_data["weight_kg"],
                    date_of_birth=athlete_data["date_of_birth"]
                )
                session.merge(athlete)
                
                # Load performance data
                perf_data = self.generate_historical_performance(athlete_data)
                for perf in perf_data:
                    performance = PerformanceData(
                        athlete_id=perf["athlete_id"],
                        game_date=perf["game_date"],
                        opponent=perf["opponent"],
                        sport_specific_stats=perf["sport_specific_stats"],
                        performance_index=perf["performance_index"],
                        game_impact_score=perf["game_impact_score"]
                    )
                    session.add(performance)
                
                # Load social metrics
                social_data = self.generate_historical_social_metrics(athlete_data)
                for social in social_data:
                    social_metric = SocialMetrics(
                        athlete_id=social["athlete_id"],
                        measurement_date=social["measurement_date"],
                        twitter_followers=social["twitter_followers"],
                        instagram_followers=social["instagram_followers"],
                        tiktok_followers=social["tiktok_followers"],
                        total_followers=social["total_followers"],
                        avg_engagement_rate=social["avg_engagement_rate"],
                        weekly_engagement_growth=social["weekly_engagement_growth"],
                        monthly_engagement_growth=social["monthly_engagement_growth"],
                        google_search_volume=social["google_search_volume"],
                        google_trends_score=social["google_trends_score"],
                        local_search_popularity=social["local_search_popularity"],
                        viral_coefficient=social["viral_coefficient"]
                    )
                    session.add(social_metric)
                
                # Load NIL valuations
                nil_data = self.generate_nil_valuations(athlete_data)
                for nil_val in nil_data:
                    valuation = NILValuation(
                        athlete_id=nil_val["athlete_id"],
                        valuation_date=nil_val["valuation_date"],
                        predicted_value_usd=nil_val["predicted_value_usd"],
                        confidence_interval_lower=nil_val["confidence_interval_lower"],
                        confidence_interval_upper=nil_val["confidence_interval_upper"],
                        prediction_confidence=nil_val["prediction_confidence"],
                        performance_contribution=nil_val["performance_contribution"],
                        attention_contribution=nil_val["attention_contribution"],
                        market_context_contribution=nil_val["market_context_contribution"],
                        model_version=nil_val["model_version"],
                        feature_importance=nil_val["feature_importance"],
                        deal_count_90d=nil_val["deal_count_90d"],
                        total_deal_value_90d=nil_val["total_deal_value_90d"]
                    )
                    session.add(valuation)
            
            session.commit()
            session.close()
            
            print("Mock data loaded to database successfully")
            
        except Exception as e:
            print(f"Failed to load data to database: {e}")
            if session:
                session.rollback()
                session.close()
    
    def create_summary_report(self) -> Dict[str, Any]:
        """Create summary report of mock data"""
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "athletes": {
                "total_count": len(self.athletes_data),
                "by_sport": {}
            },
            "schools": {
                "total_count": len(self.schools_data),
                "by_conference": {}
            },
            "athlete_details": []
        }
        
        # Athlete summary
        for athlete in self.athletes_data:
            sport = athlete["sport"]
            if sport not in report["athletes"]["by_sport"]:
                report["athletes"]["by_sport"][sport] = 0
            report["athletes"]["by_sport"][sport] += 1
            
            report["athlete_details"].append({
                "id": athlete["id"],
                "name": athlete["name"],
                "sport": athlete["sport"],
                "school": athlete["school"],
                "nil_value_usd": athlete["base_nil_value"],
                "performance_data_points": 12 if athlete["sport"] == "Football" else 30 if athlete["sport"] == "Basketball" else 50,
                "social_data_points": 90,  # Daily for 90 days
                "valuation_data_points": 5  # Weekly for 30 days
            })
        
        # School summary
        for school in self.schools_data:
            conf = school["conference"]
            if conf not in report["schools"]["by_conference"]:
                report["schools"]["by_conference"][conf] = 0
            report["schools"]["by_conference"][conf] += 1
        
        return report


def main():
    """Main function to run mock data loading"""
    
    print("NIL Valuation Pipeline - Mock Data Loader")
    print("=" * 50)
    
    # Initialize loader
    loader = MockDataLoader()
    
    # Save data files
    print("\n1. Saving mock data files...")
    output_dir = loader.save_mock_data_files()
    
    # Create summary report
    print("\n2. Generating summary report...")
    report = loader.create_summary_report()
    
    with open(os.path.join(output_dir, "mock_data_summary.json"), 'w') as f:
        json.dump(report, f, indent=2, default=str)
    
    print("\nMock Data Summary:")
    print(f"  Athletes: {report['athletes']['total_count']}")
    for sport, count in report['athletes']['by_sport'].items():
        print(f"    {sport}: {count}")
    
    print(f"  Schools: {report['schools']['total_count']}")
    for conf, count in report['schools']['by_conference'].items():
        print(f"    {conf}: {count}")
    
    print(f"\nDetailed athlete information:")
    for athlete in report['athlete_details']:
        print(f"  {athlete['name']} ({athlete['sport']}, {athlete['school']})")
        print(f"    NIL Value: ${athlete['nil_value_usd']:,}")
        print(f"    Data Points: {athlete['performance_data_points']} perf, {athlete['social_data_points']} social, {athlete['valuation_data_points']} valuations")
    
    print(f"\n✓ Mock data generated successfully!")
    print(f"  Files saved to: {output_dir}")
    print(f"  Summary report: {os.path.join(output_dir, 'mock_data_summary.json')}")
    
    # Optionally load to database
    try:
        # Uncomment to load to database if configured
        # db_manager = DatabaseManager("sqlite:///nil_valuation_test.db")
        # db_manager.create_tables()
        # loader.db_manager = db_manager
        # loader.load_to_database()
        pass
    except Exception as e:
        print(f"\nNote: Database loading skipped ({e})")
    
    return output_dir, report


if __name__ == "__main__":
    main()