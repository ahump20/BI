#!/usr/bin/env python3
"""
Prefect DAG for NIL Valuation Pipeline ETL
Nightly orchestration of data ingestion, feature engineering, and model training
"""

import os
import sys
import yaml
from datetime import datetime, timedelta
from typing import Dict, Any
import pandas as pd
from prefect import flow, task, get_run_logger
from prefect.blocks.system import Secret
from prefect.task_runners import SequentialTaskRunner

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from etl.data_ingestion import nil_data_ingestion_flow
from etl.feature_engineering import feature_engineering_flow
from models.nil_models import NILValuationPipeline
from models.database import DatabaseManager, get_database_url


@task(name="load_config")
def load_config(config_path: str = "./config/config.yaml") -> Dict[str, Any]:
    """Load pipeline configuration"""
    logger = get_run_logger()
    
    try:
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)
        
        # Replace environment variables
        config_str = yaml.dump(config)
        for env_var in os.environ:
            config_str = config_str.replace(f"${{{env_var}}}", os.environ[env_var])
        
        config = yaml.safe_load(config_str)
        logger.info("Configuration loaded successfully")
        return config
        
    except Exception as e:
        logger.error(f"Failed to load config: {e}")
        # Return minimal default config
        return {
            "etl": {"batch_size": 1000},
            "models": {"attention_predictor": {}, "nil_value_predictor": {}},
            "storage": {"local_path": "./data/mock_s3"}
        }


@task(name="validate_data_quality")
def validate_data_quality(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate data quality and completeness"""
    logger = get_run_logger()
    
    validation_results = {
        "status": "passed",
        "issues": [],
        "metrics": {}
    }
    
    try:
        # Check ingestion results
        records = data.get("records_processed", {})
        
        # Minimum record thresholds
        min_thresholds = {
            "box_scores": 5,
            "social_metrics": 5,
            "trends_data": 5
        }
        
        for data_type, min_count in min_thresholds.items():
            actual_count = records.get(data_type, 0)
            validation_results["metrics"][data_type] = actual_count
            
            if actual_count < min_count:
                validation_results["issues"].append(
                    f"Insufficient {data_type}: {actual_count} < {min_count}"
                )
                validation_results["status"] = "warning"
        
        # Check for data freshness
        timestamp = data.get("timestamp")
        if timestamp:
            data_age = datetime.now() - datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            if data_age > timedelta(hours=25):  # Should be daily
                validation_results["issues"].append(
                    f"Data is stale: {data_age.total_seconds()/3600:.1f} hours old"
                )
                validation_results["status"] = "warning"
        
        logger.info("Data quality validation completed", results=validation_results)
        return validation_results
        
    except Exception as e:
        logger.error(f"Data validation failed: {e}")
        return {
            "status": "failed",
            "issues": [f"Validation error: {str(e)}"],
            "metrics": {}
        }


@task(name="store_processed_data")
def store_processed_data(
    enriched_data: Dict[str, Any], 
    config: Dict[str, Any]
) -> str:
    """Store processed data in database and file system"""
    logger = get_run_logger()
    
    try:
        storage_config = config.get("storage", {})
        
        # Store in local file system (mock S3)
        output_dir = storage_config.get("local_path", "./data/mock_s3/processed")
        os.makedirs(output_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = os.path.join(output_dir, f"enriched_features_{timestamp}.json")
        
        import json
        with open(output_file, 'w') as f:
            json.dump(enriched_data, f, indent=2, default=str)
        
        logger.info(f"Processed data stored: {output_file}")
        
        # TODO: Store in PostgreSQL database
        # This would be implemented in production with proper database connection
        
        return output_file
        
    except Exception as e:
        logger.error(f"Failed to store processed data: {e}")
        raise


@task(name="retrain_models")
def retrain_models(
    training_data_path: str, 
    config: Dict[str, Any]
) -> Dict[str, Any]:
    """Retrain NIL valuation models with fresh data"""
    logger = get_run_logger()
    
    try:
        # Load training data
        import json
        with open(training_data_path, 'r') as f:
            data = json.load(f)
        
        # Convert to DataFrame
        training_df = pd.DataFrame(data.get("enriched_data", []))
        
        if len(training_df) < 10:
            logger.warning("Insufficient training data, skipping model retraining")
            return {"status": "skipped", "reason": "insufficient_data"}
        
        # Add mock NIL values for training (in production, would come from real data)
        import numpy as np
        np.random.seed(42)
        
        if 'nil_value_usd' not in training_df.columns:
            # Generate realistic NIL values based on features
            training_df['nil_value_usd'] = (
                500000 * (
                    0.3 * training_df.get('attention_score', 0.5) +
                    0.3 * training_df.get('performance_index', 0.5) +
                    0.2 * training_df.get('market_advantage_score', 0.5) +
                    0.2 * np.log10(training_df.get('total_followers', 10000) / 1000)
                ) * training_df.get('exposure_multiplier', 1.0) +
                np.random.normal(0, 100000, len(training_df))
            )
            training_df['nil_value_usd'] = np.maximum(training_df['nil_value_usd'], 10000)
        
        # Initialize and train pipeline
        pipeline = NILValuationPipeline(config.get("models", {}))
        training_metrics = pipeline.train(training_df)
        
        # Save trained model
        model_dir = "./models"
        os.makedirs(model_dir, exist_ok=True)
        model_path = os.path.join(model_dir, "nil_pipeline")
        
        pipeline.save_pipeline(model_path)
        
        result = {
            "status": "success",
            "training_metrics": training_metrics,
            "model_path": model_path,
            "training_samples": len(training_df),
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info("Model retraining completed", result=result)
        return result
        
    except Exception as e:
        logger.error(f"Model retraining failed: {e}")
        return {
            "status": "failed",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }


@task(name="run_backtests")
def run_backtests(model_path: str, config: Dict[str, Any]) -> Dict[str, Any]:
    """Run backtesting against mock NIL deal data"""
    logger = get_run_logger()
    
    try:
        # Load trained model
        pipeline = NILValuationPipeline()
        pipeline.load_pipeline(model_path)
        
        # Generate mock historical deal data for backtesting
        import numpy as np
        np.random.seed(123)  # Different seed for test data
        
        n_test = 20
        test_data = pd.DataFrame({
            'athlete_id': [f'backtest_athlete_{i}' for i in range(n_test)],
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
        
        # Generate "actual" deal values (what we're testing against)
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
        
        # Make predictions
        predictions = pipeline.predict_nil_value(test_data, confidence_level=0.9)
        predicted_values = [p["predicted_nil_value_usd"] for p in predictions]
        
        # Calculate backtest metrics
        from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
        
        mae = mean_absolute_error(actual_values, predicted_values)
        rmse = np.sqrt(mean_squared_error(actual_values, predicted_values))
        r2 = r2_score(actual_values, predicted_values)
        
        # Calculate percentage within confidence intervals
        within_ci = 0
        for i, pred in enumerate(predictions):
            if (pred["confidence_interval_lower"] <= actual_values[i] <= 
                pred["confidence_interval_upper"]):
                within_ci += 1
        
        ci_coverage = within_ci / len(predictions)
        
        backtest_results = {
            "status": "success",
            "test_samples": n_test,
            "mae": float(mae),
            "rmse": float(rmse),
            "r2_score": float(r2),
            "mape": float(np.mean(np.abs((actual_values - predicted_values) / actual_values)) * 100),
            "confidence_interval_coverage": float(ci_coverage),
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info("Backtesting completed", results=backtest_results)
        return backtest_results
        
    except Exception as e:
        logger.error(f"Backtesting failed: {e}")
        return {
            "status": "failed",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }


@task(name="send_pipeline_summary")
def send_pipeline_summary(
    ingestion_result: Dict[str, Any],
    validation_result: Dict[str, Any],
    training_result: Dict[str, Any],
    backtest_result: Dict[str, Any]
) -> Dict[str, Any]:
    """Send pipeline execution summary"""
    logger = get_run_logger()
    
    summary = {
        "pipeline_run": {
            "timestamp": datetime.now().isoformat(),
            "status": "completed",
            "duration_minutes": None  # Would calculate actual duration
        },
        "data_ingestion": {
            "status": ingestion_result.get("status", "unknown"),
            "records_processed": ingestion_result.get("records_processed", {}),
            "athletes_processed": ingestion_result.get("athletes_processed", 0)
        },
        "data_validation": {
            "status": validation_result.get("status", "unknown"),
            "issues_count": len(validation_result.get("issues", [])),
            "issues": validation_result.get("issues", [])
        },
        "model_training": {
            "status": training_result.get("status", "unknown"),
            "training_samples": training_result.get("training_samples", 0),
            "metrics": training_result.get("training_metrics", {})
        },
        "backtesting": {
            "status": backtest_result.get("status", "unknown"),
            "mae": backtest_result.get("mae"),
            "r2_score": backtest_result.get("r2_score"),
            "ci_coverage": backtest_result.get("confidence_interval_coverage")
        }
    }
    
    # In production, would send to Slack, email, or monitoring system
    logger.info("Pipeline summary", summary=summary)
    
    # Save summary to file
    summary_dir = "./logs"
    os.makedirs(summary_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    summary_file = os.path.join(summary_dir, f"pipeline_summary_{timestamp}.json")
    
    import json
    with open(summary_file, 'w') as f:
        json.dump(summary, f, indent=2, default=str)
    
    return summary


@flow(
    name="nil_valuation_etl_pipeline",
    description="Nightly NIL Valuation Pipeline ETL",
    task_runner=SequentialTaskRunner(),
    flow_run_name="nil-etl-{flow_name}-{date}",
    retries=1,
    retry_delay_seconds=300
)
def nil_valuation_etl_pipeline(
    config_path: str = "./config/config.yaml",
    sports: list = None,
    retrain_models: bool = True,
    run_backtests: bool = True
) -> Dict[str, Any]:
    """
    Main NIL Valuation ETL Pipeline Flow
    
    Args:
        config_path: Path to configuration file
        sports: List of sports to process (default: ["football", "basketball"])
        retrain_models: Whether to retrain models with fresh data
        run_backtests: Whether to run backtesting
    
    Returns:
        Pipeline execution summary
    """
    logger = get_run_logger()
    logger.info("Starting NIL Valuation ETL Pipeline")
    
    if sports is None:
        sports = ["football", "basketball"]
    
    # Step 1: Load configuration
    config = load_config(config_path)
    
    # Step 2: Data ingestion
    logger.info("Step 2: Data Ingestion")
    ingestion_result = nil_data_ingestion_flow(sports=sports)
    
    # Step 3: Data quality validation
    logger.info("Step 3: Data Quality Validation")
    validation_result = validate_data_quality(ingestion_result)
    
    if validation_result["status"] == "failed":
        logger.error("Data validation failed, stopping pipeline")
        raise Exception(f"Data validation failed: {validation_result['issues']}")
    
    # Step 4: Load and process raw data for feature engineering
    logger.info("Step 4: Feature Engineering")
    
    # Mock loading the stored data (in production would load from storage paths)
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
        }
    ]
    
    mock_social_data = [
        {
            "athlete_id": "NIL-WILLIAMS-LSU",
            "measurement_date": datetime.now().isoformat(),
            "total_followers": 645000,
            "avg_engagement_rate": 0.067,
            "monthly_engagement_growth": 0.15
        },
        {
            "athlete_id": "NIL-CLARK-IOWA",
            "measurement_date": datetime.now().isoformat(),
            "total_followers": 1250000,
            "avg_engagement_rate": 0.095,
            "monthly_engagement_growth": 0.25
        }
    ]
    
    mock_trends_data = [
        {
            "athlete_name": "Jayden Daniels",
            "google_search_volume": 5500,
            "google_trends_score": 85.2,
            "local_search_popularity": 92.1
        },
        {
            "athlete_name": "Caitlin Clark",
            "google_search_volume": 8500,
            "google_trends_score": 95.8,
            "local_search_popularity": 96.5
        }
    ]
    
    # Run feature engineering
    feature_result = feature_engineering_flow(
        mock_box_scores, 
        mock_social_data, 
        mock_trends_data
    )
    
    # Step 5: Store processed data
    logger.info("Step 5: Store Processed Data")
    processed_data_path = store_processed_data(feature_result, config)
    
    # Step 6: Model training (if enabled)
    training_result = {"status": "skipped", "reason": "disabled"}
    if retrain_models:
        logger.info("Step 6: Model Training")
        training_result = retrain_models(processed_data_path, config)
    
    # Step 7: Backtesting (if enabled and model training succeeded)
    backtest_result = {"status": "skipped", "reason": "disabled"}
    if (run_backtests and 
        training_result.get("status") == "success" and 
        training_result.get("model_path")):
        
        logger.info("Step 7: Backtesting")
        backtest_result = run_backtests(training_result["model_path"], config)
    
    # Step 8: Send summary
    logger.info("Step 8: Pipeline Summary")
    summary = send_pipeline_summary(
        ingestion_result,
        validation_result, 
        training_result,
        backtest_result
    )
    
    logger.info("NIL Valuation ETL Pipeline completed successfully")
    return summary


# Deployment function for production scheduling
def deploy_nil_etl_schedule():
    """Deploy the NIL ETL pipeline with nightly schedule"""
    from prefect.deployments import Deployment
    from prefect.server.schemas.schedules import CronSchedule
    
    deployment = Deployment.build_from_flow(
        flow=nil_valuation_etl_pipeline,
        name="nil-etl-nightly",
        schedule=CronSchedule(cron="0 2 * * *", timezone="America/Chicago"),  # 2 AM CT daily
        parameters={
            "sports": ["football", "basketball", "baseball"],
            "retrain_models": True,
            "run_backtests": True
        },
        work_queue_name="nil-etl",
        tags=["nil", "etl", "nightly", "production"]
    )
    
    deployment.apply()
    print("NIL ETL deployment created successfully")


if __name__ == "__main__":
    # Run the pipeline directly for testing
    result = nil_valuation_etl_pipeline()
    print("\nPipeline Result:")
    import json
    print(json.dumps(result, indent=2, default=str))