#!/usr/bin/env python3
"""
NIL Valuation Pipeline Demo Script
Demonstrates the complete pipeline from data generation to API predictions
"""

import os
import sys
import json
import time
from datetime import datetime

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from data.mock_data_loader import MockDataLoader
from etl.data_ingestion import nil_data_ingestion_flow
from etl.feature_engineering import feature_engineering_flow
from models.nil_models import NILValuationPipeline
import pandas as pd
import numpy as np


def print_banner(text: str):
    """Print formatted banner"""
    print("\n" + "="*60)
    print(f" {text}")
    print("="*60)


def print_step(step_num: int, title: str):
    """Print step header"""
    print(f"\n🚀 Step {step_num}: {title}")
    print("-" * 50)


def main():
    """Run complete NIL Valuation Pipeline demo"""
    
    print_banner("NIL VALUATION PIPELINE - DEMO")
    print("Blaze Sports Intel - Production-Ready NIL Valuation System")
    print("Estimated values, not contractual. For informational purposes only.")
    
    # Step 1: Generate Mock Data
    print_step(1, "Generate Mock Data")
    
    loader = MockDataLoader()
    print(f"✓ Created {len(loader.athletes_data)} athletes across {len(set(a['sport'] for a in loader.athletes_data))} sports")
    
    # Save mock data files
    output_dir = loader.save_mock_data_files("./data/mock_s3")
    print(f"✓ Mock data saved to: {output_dir}")
    
    # Create summary report
    report = loader.create_summary_report()
    print(f"✓ Summary report generated")
    
    print("\n📊 Athletes in Demo:")
    for athlete in report['athlete_details']:
        print(f"  • {athlete['name']} ({athlete['sport']}, {athlete['school']}) - ${athlete['nil_value_usd']:,}")
    
    # Step 2: Run ETL Data Ingestion
    print_step(2, "Data Ingestion Pipeline")
    
    ingestion_result = nil_data_ingestion_flow(sports=["football", "basketball"])
    print(f"✓ Ingestion Status: {ingestion_result['status']}")
    print(f"✓ Records Processed:")
    for data_type, count in ingestion_result['records_processed'].items():
        print(f"    - {data_type}: {count}")
    print(f"✓ Athletes Processed: {ingestion_result['athletes_processed']}")
    
    # Step 3: Feature Engineering
    print_step(3, "Feature Engineering")
    
    # Create mock data for feature engineering demo
    mock_box_scores = [
        {
            "athlete_id": "NIL-WILLIAMS-LSU",
            "game_date": "2024-09-21",
            "performance_index": 0.85,
            "game_impact_score": 0.92
        },
        {
            "athlete_id": "NIL-CLARK-IOWA", 
            "game_date": "2024-09-20",
            "performance_index": 0.95,
            "game_impact_score": 0.98
        },
        {
            "athlete_id": "NIL-MANNING-TEX",
            "game_date": "2024-09-22",
            "performance_index": 0.72,
            "game_impact_score": 0.78
        }
    ]
    
    mock_social_data = []
    mock_trends_data = []
    
    for athlete in loader.athletes_data[:3]:  # Use first 3 athletes
        # Generate current social metrics
        social_metrics = loader.generate_historical_social_metrics(athlete, days_back=1)[0]
        mock_social_data.append(social_metrics)
        
        # Generate trends data
        mock_trends_data.append({
            "athlete_name": athlete["name"],
            "google_search_volume": social_metrics["google_search_volume"],
            "google_trends_score": social_metrics["google_trends_score"],
            "local_search_popularity": social_metrics["local_search_popularity"]
        })
    
    feature_result = feature_engineering_flow(
        mock_box_scores, 
        mock_social_data, 
        mock_trends_data
    )
    
    print(f"✓ Feature Engineering Status: {feature_result['status']}")
    print(f"✓ Features Computed:")
    for feature_type, count in feature_result['features_computed'].items():
        print(f"    - {feature_type}: {count}")
    
    # Step 4: Model Training
    print_step(4, "Model Training & Validation")
    
    # Create comprehensive training dataset
    np.random.seed(42)
    n_samples = 100
    
    print("📈 Generating training dataset...")
    training_data = pd.DataFrame({
        'athlete_id': [f'training_athlete_{i}' for i in range(n_samples)],
        'attention_score': np.random.beta(2, 5, n_samples),
        'social_component': np.random.beta(3, 4, n_samples),
        'search_component': np.random.beta(2, 6, n_samples),
        'performance_index': np.random.beta(4, 3, n_samples),
        'consistency_score': np.random.beta(5, 2, n_samples),
        'peak_score': np.random.beta(3, 3, n_samples),
        'market_advantage_score': np.random.beta(2, 4, n_samples),
        'exposure_multiplier': 1 + np.random.exponential(0.5, n_samples),
        'tv_exposure_score': np.random.uniform(40, 100, n_samples),
        'nil_collective_strength': np.random.beta(3, 3, n_samples),
        'total_followers': np.random.lognormal(10, 1.5, n_samples).astype(int),
        'avg_engagement_rate': np.random.beta(2, 20, n_samples),
        'monthly_engagement_growth': np.random.normal(0.1, 0.05, n_samples),
        'google_search_volume': np.random.lognormal(7, 1, n_samples).astype(int),
        'google_trends_score': np.random.uniform(10, 100, n_samples),
    })
    
    # Create realistic NIL values based on features
    training_data['nil_value_usd'] = (
        500000 * (
            0.3 * training_data['attention_score'] +
            0.3 * training_data['performance_index'] +
            0.2 * training_data['market_advantage_score'] +
            0.2 * np.log10(training_data['total_followers'] / 1000)
        ) * training_data['exposure_multiplier'] +
        np.random.normal(0, 100000, n_samples)
    )
    training_data['nil_value_usd'] = np.maximum(training_data['nil_value_usd'], 10000)
    
    print(f"✓ Training dataset created: {len(training_data)} samples")
    print(f"✓ NIL value range: ${training_data['nil_value_usd'].min():,.0f} - ${training_data['nil_value_usd'].max():,.0f}")
    
    # Train pipeline
    print("🤖 Training NIL Valuation Pipeline...")
    pipeline = NILValuationPipeline()
    
    start_time = time.time()
    training_metrics = pipeline.train(training_data)
    training_time = time.time() - start_time
    
    print(f"✓ Training completed in {training_time:.2f} seconds")
    print(f"✓ Model Performance:")
    
    for stage, metrics in training_metrics.items():
        if isinstance(metrics, dict) and 'mae' in metrics:
            print(f"    {stage.replace('_', ' ').title()}:")
            print(f"      - MAE: ${metrics['mae']:,.0f}")
            print(f"      - RMSE: ${metrics['rmse']:,.0f}")
            print(f"      - R²: {metrics['r2']:.3f}")
    
    # Step 5: Generate Predictions
    print_step(5, "NIL Value Predictions")
    
    # Create test data for our demo athletes
    test_athletes = []
    for athlete in loader.athletes_data:
        # Get latest performance and social data
        perf_data = loader.generate_historical_performance(athlete, days_back=1)[0]
        social_data = loader.generate_historical_social_metrics(athlete, days_back=1)[0]
        
        test_record = {
            'athlete_id': athlete['id'],
            'attention_score': 0.7,  # Will be predicted
            'social_component': min(social_data['total_followers'] / 1000000, 1.0),
            'search_component': social_data['google_trends_score'] / 100,
            'performance_index': perf_data['performance_index'],
            'consistency_score': athlete['performance_profile']['consistency'],
            'peak_score': athlete['performance_profile']['peak_performance'],
            'market_advantage_score': 0.8,
            'exposure_multiplier': 1.3,
            'tv_exposure_score': 85.0,
            'nil_collective_strength': 0.8,
            'total_followers': social_data['total_followers'],
            'avg_engagement_rate': social_data['avg_engagement_rate'],
            'monthly_engagement_growth': social_data['monthly_engagement_growth'],
            'google_search_volume': social_data['google_search_volume'],
            'google_trends_score': social_data['google_trends_score']
        }
        test_athletes.append(test_record)
    
    test_df = pd.DataFrame(test_athletes)
    
    print("🔮 Generating NIL value predictions...")
    predictions = pipeline.predict_nil_value(test_df, confidence_level=0.9)
    
    print(f"✓ Generated predictions for {len(predictions)} athletes")
    
    # Step 6: Display Results
    print_step(6, "NIL Valuation Results")
    
    print("💰 NIL VALUATION PREDICTIONS:")
    print("-" * 80)
    
    for i, (athlete_data, prediction) in enumerate(zip(loader.athletes_data, predictions)):
        name = athlete_data['name']
        sport = athlete_data['sport']
        school = athlete_data['school']
        predicted_value = prediction['predicted_nil_value_usd']
        confidence = prediction['prediction_confidence']
        lower_ci = prediction['confidence_interval_lower']
        upper_ci = prediction['confidence_interval_upper']
        
        print(f"\n{i+1}. {name} ({sport}, {school})")
        print(f"   💵 Predicted NIL Value: ${predicted_value:,.0f}")
        print(f"   📊 Confidence Level: {confidence:.1%}")
        print(f"   📈 90% Confidence Interval: ${lower_ci:,.0f} - ${upper_ci:,.0f}")
        
        # Value drivers
        drivers = prediction['value_drivers']
        print(f"   🎯 Value Drivers:")
        print(f"      Performance: ${drivers['performance_contribution']:,.0f} ({drivers['performance_contribution']/predicted_value:.1%})")
        print(f"      Attention:   ${drivers['attention_contribution']:,.0f} ({drivers['attention_contribution']/predicted_value:.1%})")
        print(f"      Market:      ${drivers['market_context_contribution']:,.0f} ({drivers['market_context_contribution']/predicted_value:.1%})")
    
    # Step 7: Model Validation & Backtesting
    print_step(7, "Model Validation & Backtesting")
    
    # Generate holdout test set
    np.random.seed(123)  # Different seed for test data
    n_test = 20
    
    test_data = pd.DataFrame({
        'athlete_id': [f'test_athlete_{i}' for i in range(n_test)],
        'attention_score': np.random.beta(2, 5, n_test),
        'social_component': np.random.beta(3, 4, n_test),
        'search_component': np.random.beta(2, 6, n_test),
        'performance_index': np.random.beta(4, 3, n_test),
        'consistency_score': np.random.beta(5, 2, n_test),
        'peak_score': np.random.beta(3, 3, n_test),
        'market_advantage_score': np.random.beta(2, 4, n_test),
        'exposure_multiplier': 1 + np.random.exponential(0.5, n_test),
        'tv_exposure_score': np.random.uniform(40, 100, n_test),
        'nil_collective_strength': np.random.beta(3, 3, n_test),
        'total_followers': np.random.lognormal(10, 1.5, n_test).astype(int),
        'avg_engagement_rate': np.random.beta(2, 20, n_test),
        'monthly_engagement_growth': np.random.normal(0.1, 0.05, n_test),
        'google_search_volume': np.random.lognormal(7, 1, n_test).astype(int),
        'google_trends_score': np.random.uniform(10, 100, n_test),
    })
    
    # Generate "actual" NIL values for comparison
    actual_values = (
        500000 * (
            0.3 * test_data['attention_score'] +
            0.3 * test_data['performance_index'] +
            0.2 * test_data['market_advantage_score'] +
            0.2 * np.log10(test_data['total_followers'] / 1000)
        ) * test_data['exposure_multiplier'] +
        np.random.normal(0, 150000, n_test)  # More noise for "actual" data
    )
    actual_values = np.maximum(actual_values, 10000)
    
    # Make predictions on test set
    test_predictions = pipeline.predict_nil_value(test_data, confidence_level=0.9)
    predicted_values = [p["predicted_nil_value_usd"] for p in test_predictions]
    
    # Calculate validation metrics
    from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
    
    mae = mean_absolute_error(actual_values, predicted_values)
    rmse = np.sqrt(mean_squared_error(actual_values, predicted_values))
    r2 = r2_score(actual_values, predicted_values)
    mape = np.mean(np.abs((actual_values - predicted_values) / actual_values)) * 100
    
    # Calculate confidence interval coverage
    within_ci = 0
    for i, pred in enumerate(test_predictions):
        if (pred["confidence_interval_lower"] <= actual_values[i] <= 
            pred["confidence_interval_upper"]):
            within_ci += 1
    
    ci_coverage = within_ci / len(test_predictions)
    
    print("📊 BACKTEST VALIDATION RESULTS:")
    print(f"   • Test Samples: {n_test}")
    print(f"   • Mean Absolute Error: ${mae:,.0f}")
    print(f"   • Root Mean Square Error: ${rmse:,.0f}")
    print(f"   • R² Score: {r2:.3f}")
    print(f"   • Mean Absolute Percentage Error: {mape:.1f}%")
    print(f"   • 90% Confidence Interval Coverage: {ci_coverage:.1%}")
    
    if ci_coverage >= 0.85:  # Close to 90%
        print("   ✅ Model calibration: GOOD")
    else:
        print("   ⚠️  Model calibration: NEEDS IMPROVEMENT")
    
    # Step 8: Save Results & Model
    print_step(8, "Save Results & Model Artifacts")
    
    # Save model
    model_dir = "./models"
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "nil_pipeline_demo")
    
    pipeline.save_pipeline(model_path)
    print(f"✓ Model saved to: {model_path}")
    
    # Save demo results
    results_dir = "./results"
    os.makedirs(results_dir, exist_ok=True)
    
    demo_results = {
        "timestamp": datetime.now().isoformat(),
        "training_metrics": training_metrics,
        "predictions": [
            {
                "athlete": {
                    "name": athlete['name'],
                    "sport": athlete['sport'],
                    "school": athlete['school']
                },
                "prediction": pred
            }
            for athlete, pred in zip(loader.athletes_data, predictions)
        ],
        "validation_metrics": {
            "mae": float(mae),
            "rmse": float(rmse),
            "r2_score": float(r2),
            "mape": float(mape),
            "ci_coverage": float(ci_coverage)
        }
    }
    
    results_file = os.path.join(results_dir, f"demo_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
    with open(results_file, 'w') as f:
        json.dump(demo_results, f, indent=2, default=str)
    
    print(f"✓ Demo results saved to: {results_file}")
    
    # Final Summary
    print_banner("DEMO COMPLETED SUCCESSFULLY")
    
    print("🎯 SUMMARY:")
    print(f"   • Athletes Analyzed: {len(loader.athletes_data)}")
    print(f"   • Sports Covered: {len(set(a['sport'] for a in loader.athletes_data))}")
    print(f"   • Training Samples: {len(training_data)}")
    print(f"   • Model Performance (R²): {r2:.3f}")
    print(f"   • Average Prediction Confidence: {np.mean([p['prediction_confidence'] for p in predictions]):.1%}")
    
    print("\n🚀 NEXT STEPS:")
    print("   1. Start the FastAPI server: python api/main.py")
    print("   2. Visit http://localhost:8000/docs for API documentation")
    print("   3. Run tests: pytest tests/ -v")
    print("   4. Configure production data sources in config/config.yaml")
    
    print("\n⚖️  DISCLAIMER:")
    print("   Estimated values, not contractual. For informational purposes only.")
    print("   This demo uses synthetic data for illustration purposes.")
    
    return demo_results


if __name__ == "__main__":
    try:
        results = main()
        print(f"\n✅ Demo completed successfully! Results available in ./results/")
    except Exception as e:
        print(f"\n❌ Demo failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)