#!/usr/bin/env python3
"""
FastAPI service for NIL Valuation Pipeline
Provides endpoints for athlete valuations and leaderboards
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import pandas as pd
import redis
from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn
import structlog

# Import our models
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.nil_models import NILValuationPipeline
from models.database import DatabaseManager, get_database_url, Athlete, NILValuation


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = structlog.get_logger()

# Initialize FastAPI app
app = FastAPI(
    title="NIL Valuation Pipeline API",
    description="Blaze Sports Intel NIL Valuation API - Estimated values, not contractual",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models and cache
valuation_pipeline: Optional[NILValuationPipeline] = None
redis_client: Optional[redis.Redis] = None
db_manager: Optional[DatabaseManager] = None

# Pydantic models
class AthleteValuationResponse(BaseModel):
    athlete_id: str
    name: Optional[str] = None
    sport: Optional[str] = None
    school: Optional[str] = None
    predicted_nil_value_usd: float = Field(..., description="Predicted NIL value in USD")
    confidence_interval_lower: float = Field(..., description="90% confidence interval lower bound")
    confidence_interval_upper: float = Field(..., description="90% confidence interval upper bound")
    prediction_confidence: float = Field(..., description="Prediction confidence score (0-1)")
    attention_score: float = Field(..., description="Current attention score")
    
    value_drivers: Dict[str, float] = Field(..., description="Value driver breakdown")
    feature_importance: Optional[Dict[str, float]] = Field(None, description="Feature importance scores")
    
    model_version: str = Field(..., description="Model version used")
    prediction_date: str = Field(..., description="When prediction was made")
    last_updated: str = Field(..., description="When data was last updated")
    
    disclaimer: str = Field(
        default="Estimated value, not contractual. For informational purposes only.",
        description="Legal disclaimer"
    )

class LeaderboardEntry(BaseModel):
    rank: int
    athlete_id: str
    name: Optional[str] = None
    sport: Optional[str] = None
    school: Optional[str] = None
    predicted_nil_value_usd: float
    trend_direction: str = Field(..., description="up, down, or stable")
    trend_change_pct: float = Field(..., description="Percentage change from previous period")
    attention_score: float
    last_updated: str

class AthleteLeaderboardResponse(BaseModel):
    leaderboard: List[LeaderboardEntry]
    total_athletes: int
    generated_at: str
    timeframe: str = Field(default="current", description="Timeframe for rankings")
    disclaimer: str = Field(
        default="Estimated values, not contractual. For informational purposes only.",
        description="Legal disclaimer"
    )

class HealthCheckResponse(BaseModel):
    status: str
    timestamp: str
    services: Dict[str, str]
    model_status: Dict[str, Any]


# Dependency to get database session
def get_db():
    if db_manager:
        session = db_manager.get_session()
        try:
            yield session
        finally:
            session.close()
    else:
        yield None


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global valuation_pipeline, redis_client, db_manager
    
    logger.info("Starting NIL Valuation API...")
    
    # Initialize Redis cache (with fallback)
    try:
        redis_client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'localhost'),
            port=int(os.getenv('REDIS_PORT', 6379)),
            db=int(os.getenv('REDIS_DB', 0)),
            decode_responses=True
        )
        redis_client.ping()
        logger.info("Redis cache connected")
    except Exception as e:
        logger.warning("Redis not available, caching disabled", error=str(e))
        redis_client = None
    
    # Initialize database (with fallback)
    try:
        db_url = os.getenv('DATABASE_URL', 'sqlite:///./nil_valuation.db')
        db_manager = DatabaseManager(db_url)
        logger.info("Database connected")
    except Exception as e:
        logger.warning("Database not available", error=str(e))
        db_manager = None
    
    # Load trained model
    try:
        model_path = os.getenv('MODEL_PATH', './models/nil_pipeline')
        valuation_pipeline = NILValuationPipeline()
        
        # Check if model files exist
        if (os.path.exists(f"{model_path}_attention.pkl") and 
            os.path.exists(f"{model_path}_value.pkl")):
            valuation_pipeline.load_pipeline(model_path)
            logger.info("NIL valuation model loaded successfully")
        else:
            logger.warning("Pre-trained model not found, using untrained pipeline")
            # Initialize with mock training for demo
            await initialize_demo_model()
    
    except Exception as e:
        logger.error("Failed to load model", error=str(e))
        raise


async def initialize_demo_model():
    """Initialize model with demo data for testing"""
    global valuation_pipeline
    
    logger.info("Initializing demo model with sample data")
    
    # Create sample training data
    import numpy as np
    np.random.seed(42)
    n_samples = 50
    
    training_data = pd.DataFrame({
        'athlete_id': [f'demo_athlete_{i}' for i in range(n_samples)],
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
    
    # Create realistic NIL values
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
    
    # Train the model
    valuation_pipeline.train(training_data)
    logger.info("Demo model training completed")


@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "NIL Valuation Pipeline API",
        "version": "1.0.0",
        "disclaimer": "Estimated values, not contractual. For informational purposes only.",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint"""
    services = {}
    
    # Check Redis
    if redis_client:
        try:
            redis_client.ping()
            services["redis"] = "healthy"
        except:
            services["redis"] = "unhealthy"
    else:
        services["redis"] = "disabled"
    
    # Check Database
    if db_manager:
        try:
            session = db_manager.get_session()
            session.execute("SELECT 1")
            session.close()
            services["database"] = "healthy"
        except:
            services["database"] = "unhealthy"
    else:
        services["database"] = "disabled"
    
    # Check Model
    model_status = {
        "loaded": valuation_pipeline is not None,
        "trained": valuation_pipeline.is_trained if valuation_pipeline else False
    }
    
    overall_status = "healthy" if all(
        s in ["healthy", "disabled"] for s in services.values()
    ) else "unhealthy"
    
    return HealthCheckResponse(
        status=overall_status,
        timestamp=datetime.now().isoformat(),
        services=services,
        model_status=model_status
    )


@app.get("/athlete/{athlete_id}/value", response_model=AthleteValuationResponse)
async def get_athlete_valuation(
    athlete_id: str,
    include_features: bool = False,
    db=Depends(get_db)
):
    """
    Get NIL valuation for specific athlete
    Returns JSON with NIL valuation + drivers
    """
    if not valuation_pipeline or not valuation_pipeline.is_trained:
        raise HTTPException(
            status_code=503, 
            detail="Valuation model not available or not trained"
        )
    
    # Check cache first
    cache_key = f"athlete_valuation:{athlete_id}"
    cached_result = None
    
    if redis_client:
        try:
            cached_data = redis_client.get(cache_key)
            if cached_data:
                cached_result = json.loads(cached_data)
                logger.info("Cache hit for athlete valuation", athlete_id=athlete_id)
        except Exception as e:
            logger.warning("Cache read failed", error=str(e))
    
    if cached_result:
        return AthleteValuationResponse(**cached_result)
    
    # Get athlete data (mock for demo - in production would query database)
    athlete_data = get_athlete_features(athlete_id, db)
    
    if athlete_data is None:
        raise HTTPException(
            status_code=404,
            detail=f"Athlete {athlete_id} not found or insufficient data"
        )
    
    try:
        # Make prediction
        predictions = valuation_pipeline.predict_nil_value(
            pd.DataFrame([athlete_data]),
            confidence_level=0.9
        )
        
        if not predictions:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate valuation"
            )
        
        prediction = predictions[0]
        
        # Format response
        response_data = {
            "athlete_id": athlete_id,
            "name": athlete_data.get("name", "Unknown"),
            "sport": athlete_data.get("sport", "Unknown"),
            "school": athlete_data.get("school", "Unknown"),
            "predicted_nil_value_usd": prediction["predicted_nil_value_usd"],
            "confidence_interval_lower": prediction["confidence_interval_lower"],
            "confidence_interval_upper": prediction["confidence_interval_upper"],
            "prediction_confidence": prediction["prediction_confidence"],
            "attention_score": prediction["attention_score_predicted"],
            "value_drivers": prediction["value_drivers"],
            "model_version": prediction["model_version"],
            "prediction_date": prediction["prediction_date"],
            "last_updated": datetime.now().isoformat(),
            "disclaimer": prediction["disclaimer"]
        }
        
        # Include feature importance if requested
        if include_features:
            response_data["feature_importance"] = prediction["feature_importance"]
        
        # Cache the result
        if redis_client:
            try:
                redis_client.setex(
                    cache_key, 
                    1800,  # 30 minutes TTL
                    json.dumps(response_data, default=str)
                )
            except Exception as e:
                logger.warning("Cache write failed", error=str(e))
        
        return AthleteValuationResponse(**response_data)
    
    except Exception as e:
        logger.error("Valuation prediction failed", athlete_id=athlete_id, error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate valuation: {str(e)}"
        )


@app.get("/leaderboard", response_model=AthleteLeaderboardResponse)
async def get_leaderboard(
    limit: int = 100,
    sport: Optional[str] = None,
    timeframe: str = "current"
):
    """
    Get top 100 athletes today with rank & trend
    """
    if not valuation_pipeline or not valuation_pipeline.is_trained:
        raise HTTPException(
            status_code=503,
            detail="Valuation model not available or not trained"
        )
    
    # Check cache
    cache_key = f"leaderboard:{sport or 'all'}:{limit}:{timeframe}"
    
    if redis_client:
        try:
            cached_data = redis_client.get(cache_key)
            if cached_data:
                cached_result = json.loads(cached_data)
                logger.info("Cache hit for leaderboard")
                return AthleteLeaderboardResponse(**cached_result)
        except Exception as e:
            logger.warning("Cache read failed", error=str(e))
    
    try:
        # Generate leaderboard data (mock for demo)
        leaderboard_data = generate_leaderboard(limit, sport, timeframe)
        
        response_data = {
            "leaderboard": leaderboard_data,
            "total_athletes": len(leaderboard_data),
            "generated_at": datetime.now().isoformat(),
            "timeframe": timeframe,
            "disclaimer": "Estimated values, not contractual. For informational purposes only."
        }
        
        # Cache the result
        if redis_client:
            try:
                redis_client.setex(
                    cache_key,
                    900,  # 15 minutes TTL
                    json.dumps(response_data, default=str)
                )
            except Exception as e:
                logger.warning("Cache write failed", error=str(e))
        
        return AthleteLeaderboardResponse(**response_data)
    
    except Exception as e:
        logger.error("Leaderboard generation failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate leaderboard: {str(e)}"
        )


def get_athlete_features(athlete_id: str, db) -> Optional[Dict[str, Any]]:
    """Get athlete features for prediction (mock implementation)"""
    
    # Mock athlete data for demo
    mock_athletes = {
        "NIL-WILLIAMS-LSU": {
            "name": "Jayden Daniels",
            "sport": "Football",
            "school": "LSU",
            "attention_score": 0.85,
            "social_component": 0.78,
            "search_component": 0.92,
            "performance_index": 0.88,
            "consistency_score": 0.75,
            "peak_score": 0.95,
            "market_advantage_score": 0.82,
            "exposure_multiplier": 1.4,
            "tv_exposure_score": 88,
            "nil_collective_strength": 0.85,
            "total_followers": 645000,
            "avg_engagement_rate": 0.067,
            "monthly_engagement_growth": 0.15,
            "google_search_volume": 5500,
            "google_trends_score": 85.2
        },
        "NIL-CLARK-IOWA": {
            "name": "Caitlin Clark",
            "sport": "Basketball",
            "school": "Iowa",
            "attention_score": 0.92,
            "social_component": 0.95,
            "search_component": 0.88,
            "performance_index": 0.98,
            "consistency_score": 0.85,
            "peak_score": 0.99,
            "market_advantage_score": 0.68,
            "exposure_multiplier": 1.2,
            "tv_exposure_score": 75,
            "nil_collective_strength": 0.68,
            "total_followers": 1250000,
            "avg_engagement_rate": 0.095,
            "monthly_engagement_growth": 0.25,
            "google_search_volume": 8500,
            "google_trends_score": 95.8
        },
        "NIL-MANNING-TEX": {
            "name": "Arch Manning",
            "sport": "Football",
            "school": "Texas",
            "attention_score": 0.88,
            "social_component": 0.85,
            "search_component": 0.91,
            "performance_index": 0.72,
            "consistency_score": 0.68,
            "peak_score": 0.85,
            "market_advantage_score": 0.92,
            "exposure_multiplier": 1.5,
            "tv_exposure_score": 95,
            "nil_collective_strength": 0.92,
            "total_followers": 770000,
            "avg_engagement_rate": 0.078,
            "monthly_engagement_growth": 0.18,
            "google_search_volume": 7200,
            "google_trends_score": 88.5
        }
    }
    
    return mock_athletes.get(athlete_id)


def generate_leaderboard(limit: int, sport: Optional[str], timeframe: str) -> List[Dict[str, Any]]:
    """Generate mock leaderboard data"""
    
    # Mock leaderboard data
    import random
    random.seed(42)  # For consistent results
    
    athletes = [
        {"id": "NIL-CLARK-IOWA", "name": "Caitlin Clark", "sport": "Basketball", "school": "Iowa", "base_value": 4500000},
        {"id": "NIL-WILLIAMS-LSU", "name": "Jayden Daniels", "sport": "Football", "school": "LSU", "base_value": 3800000},
        {"id": "NIL-MANNING-TEX", "name": "Arch Manning", "sport": "Football", "school": "Texas", "base_value": 3100000},
        {"id": "NIL-YOUNG-BAMA", "name": "Bryce Young", "sport": "Football", "school": "Alabama", "base_value": 2800000},
        {"id": "NIL-REESE-LSU", "name": "Angel Reese", "sport": "Basketball", "school": "LSU", "base_value": 2400000},
    ]
    
    # Add more mock athletes
    for i in range(5, min(limit, 50)):
        athletes.append({
            "id": f"NIL-ATHLETE-{i:03d}",
            "name": f"Mock Athlete {i}",
            "sport": random.choice(["Football", "Basketball", "Baseball"]),
            "school": random.choice(["Texas", "LSU", "Alabama", "Georgia", "Ohio State"]),
            "base_value": random.randint(100000, 2200000)
        })
    
    # Filter by sport if specified
    if sport:
        athletes = [a for a in athletes if a["sport"].lower() == sport.lower()]
    
    # Add trend data and sort by value
    leaderboard = []
    for rank, athlete in enumerate(sorted(athletes, key=lambda x: x["base_value"], reverse=True)[:limit], 1):
        trend_change = random.uniform(-15, 25)  # -15% to +25% change
        trend_direction = "up" if trend_change > 5 else "down" if trend_change < -5 else "stable"
        
        leaderboard.append({
            "rank": rank,
            "athlete_id": athlete["id"],
            "name": athlete["name"],
            "sport": athlete["sport"],
            "school": athlete["school"],
            "predicted_nil_value_usd": float(athlete["base_value"]),
            "trend_direction": trend_direction,
            "trend_change_pct": round(trend_change, 1),
            "attention_score": round(random.uniform(0.3, 0.95), 2),
            "last_updated": datetime.now().isoformat()
        })
    
    return leaderboard


@app.post("/refresh-cache")
async def refresh_cache(background_tasks: BackgroundTasks):
    """Refresh all cached data"""
    if not redis_client:
        raise HTTPException(status_code=503, detail="Cache not available")
    
    def clear_cache():
        try:
            # Clear athlete valuations
            keys = redis_client.keys("athlete_valuation:*")
            if keys:
                redis_client.delete(*keys)
            
            # Clear leaderboards
            keys = redis_client.keys("leaderboard:*")
            if keys:
                redis_client.delete(*keys)
            
            logger.info("Cache refreshed successfully")
        except Exception as e:
            logger.error("Cache refresh failed", error=str(e))
    
    background_tasks.add_task(clear_cache)
    return {"message": "Cache refresh initiated"}


if __name__ == "__main__":
    # Run the API server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=False,
        workers=1
    )