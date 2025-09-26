#!/usr/bin/env python3
"""
Unit tests for NIL Valuation Pipeline
Tests core components: data ingestion, feature engineering, modeling, and API
"""

import pytest
import numpy as np
import pandas as pd
import json
import os
import sys
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock
import tempfile

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from etl.data_ingestion import nil_data_ingestion_flow, fetch_box_scores, fetch_social_media_stats
from etl.feature_engineering import compute_attention_score, compute_performance_index
from models.nil_models import NILValuationPipeline, AttentionScorePredictor, NILValuePredictor
from data.mock_data_loader import MockDataLoader


class TestDataIngestion:
    """Test data ingestion pipeline"""
    
    def test_fetch_box_scores_football(self):
        """Test football box scores fetching"""
        result = fetch_box_scores("football", {"start": "2024-09-01", "end": "2024-09-30"})
        
        assert isinstance(result, list)
        assert len(result) > 0
        
        # Check structure of first record
        record = result[0]
        assert "athlete_id" in record
        assert "name" in record
        assert "stats" in record
        assert "performance_index" in record
        
        # Football-specific stats
        stats = record["stats"]
        assert "pass_yards" in stats
        assert "pass_td" in stats
        assert "qbr" in stats
    
    def test_fetch_box_scores_basketball(self):
        """Test basketball box scores fetching"""
        result = fetch_box_scores("basketball", {"start": "2024-09-01", "end": "2024-09-30"})
        
        assert isinstance(result, list)
        assert len(result) > 0
        
        record = result[0]
        stats = record["stats"]
        assert "points" in stats
        assert "rebounds" in stats
        assert "assists" in stats
    
    def test_fetch_social_media_stats(self):
        """Test social media data fetching"""
        athlete_ids = ["NIL-WILLIAMS-LSU", "NIL-CLARK-IOWA"]
        result = fetch_social_media_stats(athlete_ids)
        
        assert isinstance(result, list)
        assert len(result) == len(athlete_ids)
        
        record = result[0]
        assert "athlete_id" in record
        assert "twitter_followers" in record
        assert "instagram_followers" in record
        assert "tiktok_followers" in record
        assert "avg_engagement_rate" in record
        assert record["total_followers"] > 0
    
    def test_nil_data_ingestion_flow(self):
        """Test complete data ingestion flow"""
        result = nil_data_ingestion_flow(sports=["football"])
        
        assert result["status"] == "success"
        assert "records_processed" in result
        assert "athletes_processed" in result
        assert "storage_paths" in result
        
        # Check record counts
        records = result["records_processed"]
        assert records["box_scores"] > 0
        assert records["social_metrics"] > 0
        assert records["trends_data"] > 0


class TestFeatureEngineering:
    """Test feature engineering pipeline"""
    
    def setup_method(self):
        """Set up test data"""
        self.mock_social_data = [
            {
                "athlete_id": "NIL-TEST-1",
                "measurement_date": datetime.now().isoformat(),
                "total_followers": 500000,
                "avg_engagement_rate": 0.05,
                "monthly_engagement_growth": 0.1
            }
        ]
        
        self.mock_trends_data = [
            {
                "athlete_name": "Test Athlete",
                "google_search_volume": 5000,
                "google_trends_score": 75.0,
                "local_search_popularity": 80.0
            }
        ]
        
        self.mock_box_scores = [
            {
                "athlete_id": "NIL-TEST-1",
                "game_date": "2024-09-20",
                "performance_index": 0.8,
                "game_impact_score": 0.85
            }
        ]
    
    def test_compute_attention_score(self):
        """Test attention score computation"""
        result = compute_attention_score(self.mock_social_data, self.mock_trends_data)
        
        assert isinstance(result, list)
        assert len(result) > 0
        
        score = result[0]
        assert "athlete_id" in score
        assert "social_component" in score
        assert "search_component" in score
        assert "raw_attention_score" in score
        assert "decayed_attention_score" in score
        
        # Check value ranges
        assert 0 <= score["social_component"] <= 1
        assert 0 <= score["search_component"] <= 1
        assert 0 <= score["decayed_attention_score"] <= 1
    
    def test_compute_performance_index(self):
        """Test performance index computation"""
        result = compute_performance_index(self.mock_box_scores)
        
        assert isinstance(result, list)
        assert len(result) > 0
        
        perf = result[0]
        assert "athlete_id" in perf
        assert "recency_score" in perf
        assert "consistency_score" in perf
        assert "peak_score" in perf
        assert "combined_performance_index" in perf
        
        # Check value ranges
        assert 0 <= perf["combined_performance_index"] <= 1


class TestNILModels:
    """Test NIL valuation models"""
    
    def setup_method(self):
        """Set up test data"""
        np.random.seed(42)
        self.training_data = pd.DataFrame({
            'athlete_id': [f'test_athlete_{i}' for i in range(50)],
            'attention_score': np.random.beta(2, 5, 50),
            'social_component': np.random.beta(3, 4, 50),
            'search_component': np.random.beta(2, 6, 50),
            'performance_index': np.random.beta(4, 3, 50),
            'consistency_score': np.random.beta(5, 2, 50),
            'peak_score': np.random.beta(3, 3, 50),
            'market_advantage_score': np.random.beta(2, 4, 50),
            'exposure_multiplier': 1 + np.random.exponential(0.5, 50),
            'tv_exposure_score': np.random.uniform(40, 100, 50),
            'nil_collective_strength': np.random.beta(3, 3, 50),
            'total_followers': np.random.lognormal(10, 1.5, 50).astype(int),
            'avg_engagement_rate': np.random.beta(2, 20, 50),
            'monthly_engagement_growth': np.random.normal(0.1, 0.05, 50),
            'google_search_volume': np.random.lognormal(7, 1, 50).astype(int),
            'google_trends_score': np.random.uniform(10, 100, 50),
        })
        
        # Create realistic NIL values
        self.training_data['nil_value_usd'] = (
            500000 * (
                0.3 * self.training_data['attention_score'] +
                0.3 * self.training_data['performance_index'] +
                0.2 * self.training_data['market_advantage_score'] +
                0.2 * np.log10(self.training_data['total_followers'] / 1000)
            ) * self.training_data['exposure_multiplier'] +
            np.random.normal(0, 100000, 50)
        )
        self.training_data['nil_value_usd'] = np.maximum(self.training_data['nil_value_usd'], 10000)
    
    def test_attention_predictor_train(self):
        """Test attention score predictor training"""
        predictor = AttentionScorePredictor()
        metrics = predictor.train(self.training_data)
        
        assert isinstance(metrics, dict)
        assert "mae" in metrics
        assert "rmse" in metrics
        assert "r2" in metrics
        assert predictor.is_trained
    
    def test_attention_predictor_predict(self):
        """Test attention score prediction"""
        predictor = AttentionScorePredictor()
        predictor.train(self.training_data)
        
        test_data = self.training_data.head(3)
        predictions = predictor.predict(test_data, days_ahead=7)
        
        assert len(predictions) == 3
        assert all(0 <= p <= 1 for p in predictions)
    
    def test_nil_value_predictor_train(self):
        """Test NIL value predictor training"""
        predictor = NILValuePredictor()
        metrics = predictor.train(self.training_data, 'nil_value_usd')
        
        assert isinstance(metrics, dict)
        assert "mae" in metrics
        assert "rmse" in metrics
        assert "r2" in metrics
        assert predictor.is_trained
        
        # Check feature importance
        importance = predictor.get_feature_importance()
        assert isinstance(importance, dict)
        assert len(importance) > 0
    
    def test_nil_value_predictor_predict_with_confidence(self):
        """Test NIL value prediction with confidence intervals"""
        predictor = NILValuePredictor()
        predictor.train(self.training_data, 'nil_value_usd')
        
        test_data = self.training_data.head(3)
        result = predictor.predict_with_confidence(test_data, confidence_level=0.9)
        
        assert "predictions" in result
        assert "confidence_lower" in result
        assert "confidence_upper" in result
        assert "prediction_std" in result
        
        predictions = result["predictions"]
        lower = result["confidence_lower"]
        upper = result["confidence_upper"]
        
        assert len(predictions) == 3
        assert all(p > 0 for p in predictions)
        assert all(l <= p <= u for l, p, u in zip(lower, predictions, upper))
    
    def test_nil_valuation_pipeline_train(self):
        """Test complete NIL valuation pipeline training"""
        pipeline = NILValuationPipeline()
        metrics = pipeline.train(self.training_data)
        
        assert isinstance(metrics, dict)
        assert "attention_predictor" in metrics
        assert "value_predictor" in metrics
        assert pipeline.is_trained
    
    def test_nil_valuation_pipeline_predict(self):
        """Test complete NIL valuation pipeline prediction"""
        pipeline = NILValuationPipeline()
        pipeline.train(self.training_data)
        
        test_data = self.training_data.head(2)
        predictions = pipeline.predict_nil_value(test_data, confidence_level=0.9)
        
        assert len(predictions) == 2
        
        pred = predictions[0]
        assert "athlete_id" in pred
        assert "predicted_nil_value_usd" in pred
        assert "confidence_interval_lower" in pred
        assert "confidence_interval_upper" in pred
        assert "prediction_confidence" in pred
        assert "value_drivers" in pred
        assert "disclaimer" in pred
        
        # Check value ranges
        assert pred["predicted_nil_value_usd"] > 0
        assert 0 <= pred["prediction_confidence"] <= 1
        assert pred["confidence_interval_lower"] <= pred["predicted_nil_value_usd"] <= pred["confidence_interval_upper"]
    
    def test_model_save_load(self):
        """Test model saving and loading"""
        pipeline = NILValuationPipeline()
        pipeline.train(self.training_data)
        
        with tempfile.TemporaryDirectory() as temp_dir:
            model_path = os.path.join(temp_dir, "test_pipeline")
            
            # Save model
            pipeline.save_pipeline(model_path)
            
            # Check files exist
            assert os.path.exists(f"{model_path}_attention.pkl")
            assert os.path.exists(f"{model_path}_value.pkl")
            assert os.path.exists(f"{model_path}_shrinkage.json")
            
            # Load model
            new_pipeline = NILValuationPipeline()
            new_pipeline.load_pipeline(model_path)
            
            assert new_pipeline.is_trained
            
            # Test predictions are consistent
            test_data = self.training_data.head(1)
            pred1 = pipeline.predict_nil_value(test_data)[0]
            pred2 = new_pipeline.predict_nil_value(test_data)[0]
            
            # Should be very close (allowing for small numerical differences)
            assert abs(pred1["predicted_nil_value_usd"] - pred2["predicted_nil_value_usd"]) < 1000


class TestMockDataLoader:
    """Test mock data loader"""
    
    def test_mock_data_loader_init(self):
        """Test mock data loader initialization"""
        loader = MockDataLoader()
        
        assert len(loader.athletes_data) == 5
        assert len(loader.schools_data) == 4
        
        # Check athlete structure
        athlete = loader.athletes_data[0]
        assert "id" in athlete
        assert "name" in athlete
        assert "sport" in athlete
        assert "school" in athlete
        assert "base_nil_value" in athlete
    
    def test_generate_historical_performance(self):
        """Test historical performance data generation"""
        loader = MockDataLoader()
        athlete = loader.athletes_data[0]  # Football player
        
        performance_data = loader.generate_historical_performance(athlete)
        
        assert isinstance(performance_data, list)
        assert len(performance_data) > 0
        
        perf = performance_data[0]
        assert "athlete_id" in perf
        assert "game_date" in perf
        assert "sport_specific_stats" in perf
        assert "performance_index" in perf
        
        # Check value ranges
        assert 0 <= perf["performance_index"] <= 1
    
    def test_generate_historical_social_metrics(self):
        """Test historical social metrics generation"""
        loader = MockDataLoader()
        athlete = loader.athletes_data[1]  # Basketball player
        
        social_data = loader.generate_historical_social_metrics(athlete)
        
        assert isinstance(social_data, list)
        assert len(social_data) == 90  # 90 days
        
        social = social_data[0]
        assert "athlete_id" in social
        assert "total_followers" in social
        assert "avg_engagement_rate" in social
        assert "google_search_volume" in social
        
        # Check follower counts are positive
        assert social["total_followers"] > 0
        assert social["avg_engagement_rate"] > 0
    
    def test_save_mock_data_files(self):
        """Test saving mock data to files"""
        loader = MockDataLoader()
        
        with tempfile.TemporaryDirectory() as temp_dir:
            output_dir = loader.save_mock_data_files(temp_dir)
            
            assert os.path.exists(output_dir)
            
            # Check that files were created
            files = os.listdir(output_dir)
            assert any("complete_mock_dataset" in f for f in files)
            assert any("athletes_" in f for f in files)
            assert any("performance_data_" in f for f in files)
    
    def test_create_summary_report(self):
        """Test summary report creation"""
        loader = MockDataLoader()
        report = loader.create_summary_report()
        
        assert "athletes" in report
        assert "schools" in report
        assert "athlete_details" in report
        
        assert report["athletes"]["total_count"] == 5
        assert len(report["athlete_details"]) == 5
        
        # Check sports distribution
        sports = report["athletes"]["by_sport"]
        assert "Football" in sports
        assert "Basketball" in sports


class TestAPIEndpoints:
    """Test API endpoints (mock testing without server)"""
    
    @pytest.fixture
    def mock_pipeline(self):
        """Create mock pipeline for API testing"""
        pipeline = MagicMock()
        pipeline.is_trained = True
        pipeline.predict_nil_value.return_value = [{
            "athlete_id": "NIL-TEST-1",
            "predicted_nil_value_usd": 2500000.0,
            "confidence_interval_lower": 2000000.0,
            "confidence_interval_upper": 3000000.0,
            "prediction_confidence": 0.85,
            "attention_score_predicted": 0.78,
            "value_drivers": {
                "performance_contribution": 1000000.0,
                "attention_contribution": 1000000.0,
                "market_context_contribution": 500000.0
            },
            "feature_importance": {"attention_score": 0.25},
            "model_version": "v1.0",
            "prediction_date": datetime.now().isoformat(),
            "disclaimer": "Estimated value, not contractual."
        }]
        return pipeline
    
    def test_athlete_valuation_response_structure(self, mock_pipeline):
        """Test athlete valuation response structure"""
        # This would be integration test with actual FastAPI client
        # For now, test the response structure
        
        prediction = mock_pipeline.predict_nil_value.return_value[0]
        
        # Check required fields
        required_fields = [
            "athlete_id", "predicted_nil_value_usd", "confidence_interval_lower",
            "confidence_interval_upper", "prediction_confidence", "value_drivers",
            "model_version", "disclaimer"
        ]
        
        for field in required_fields:
            assert field in prediction
        
        assert prediction["predicted_nil_value_usd"] > 0
        assert 0 <= prediction["prediction_confidence"] <= 1


def test_end_to_end_pipeline():
    """Integration test for complete pipeline"""
    
    # 1. Load mock data
    loader = MockDataLoader()
    
    # 2. Create training dataset
    training_data = []
    for athlete in loader.athletes_data:
        # Get recent performance and social data
        perf_data = loader.generate_historical_performance(athlete, days_back=30)
        social_data = loader.generate_historical_social_metrics(athlete, days_back=30)
        
        if perf_data and social_data:
            # Combine latest metrics
            latest_perf = perf_data[0]
            latest_social = social_data[0]
            
            combined_record = {
                'athlete_id': athlete['id'],
                'attention_score': 0.7,  # Mock
                'social_component': 0.6,
                'search_component': 0.8,
                'performance_index': latest_perf['performance_index'],
                'consistency_score': athlete['performance_profile']['consistency'],
                'peak_score': athlete['performance_profile']['peak_performance'],
                'market_advantage_score': 0.8,
                'exposure_multiplier': 1.3,
                'tv_exposure_score': 85.0,
                'nil_collective_strength': 0.8,
                'total_followers': latest_social['total_followers'],
                'avg_engagement_rate': latest_social['avg_engagement_rate'],
                'monthly_engagement_growth': latest_social['monthly_engagement_growth'],
                'google_search_volume': latest_social['google_search_volume'],
                'google_trends_score': latest_social['google_trends_score'],
                'nil_value_usd': athlete['base_nil_value']
            }
            training_data.append(combined_record)
    
    training_df = pd.DataFrame(training_data)
    
    # 3. Train pipeline
    pipeline = NILValuationPipeline()
    metrics = pipeline.train(training_df)
    
    assert pipeline.is_trained
    assert "attention_predictor" in metrics
    assert "value_predictor" in metrics
    
    # 4. Make predictions
    test_data = training_df.head(2)
    predictions = pipeline.predict_nil_value(test_data, confidence_level=0.9)
    
    assert len(predictions) == 2
    
    for pred in predictions:
        assert pred["predicted_nil_value_usd"] > 0
        assert pred["confidence_interval_lower"] <= pred["predicted_nil_value_usd"] <= pred["confidence_interval_upper"]
        assert 0 <= pred["prediction_confidence"] <= 1
        assert "disclaimer" in pred


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])