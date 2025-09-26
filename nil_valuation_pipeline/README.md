# NIL Valuation Pipeline

**Blaze Sports Intel's NIL Valuation Pipeline** - A comprehensive Python project scaffold implementing a production-ready NIL (Name, Image, Likeness) valuation system for college athletes.

## 🎯 Overview

This pipeline implements a 2-stage machine learning architecture to predict NIL valuations for college athletes:

- **Stage A**: Attention Score Predictor with temporal decay
- **Stage B**: LightGBM-based NIL value regressor with Bayesian shrinkage
- **Complete ETL**: Automated data ingestion, feature engineering, and model training
- **Production API**: FastAPI service with Redis caching and comprehensive endpoints

## 🏗️ Architecture

```
├── etl/                    # ETL Pipeline
│   ├── data_ingestion.py   # Box scores, social media, search trends
│   ├── feature_engineering.py # Attention scores, performance indices
│   └── nil_etl_dag.py     # Prefect orchestration DAG
├── models/                 # ML Models
│   ├── database.py        # SQLAlchemy ORM models
│   └── nil_models.py      # 2-stage ML pipeline
├── api/                   # FastAPI Service
│   └── main.py           # API endpoints with caching
├── config/               # Configuration
│   └── config.yaml      # Pipeline settings
├── data/                # Data & Storage
│   └── mock_data_loader.py # Demo data generator
└── tests/              # Test Suite
    └── test_nil_pipeline.py # Comprehensive tests
```

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Clone and navigate to project
cd nil_valuation_pipeline

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp config/config.yaml.example config/config.yaml
# Edit config.yaml with your settings
```

### 2. Generate Demo Data

```bash
# Create mock data for 5 athletes across 2 sports
python data/mock_data_loader.py
```

### 3. Run ETL Pipeline

```bash
# Run complete ETL pipeline
python etl/nil_etl_dag.py
```

### 4. Start API Service

```bash
# Start FastAPI server
python api/main.py

# Or with uvicorn
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

### 5. Test API Endpoints

```bash
# Health check
curl http://localhost:8000/health

# Get athlete valuation
curl http://localhost:8000/athlete/NIL-WILLIAMS-LSU/value

# Get leaderboard
curl http://localhost:8000/leaderboard?limit=10
```

## 📊 Data Sources

### Ingestion Pipeline
- **Box Scores**: Performance metrics from games/events
- **Social Media**: Followers, engagement rates, growth metrics
- **Search Trends**: Google search volume and trend scores
- **Market Context**: School market size, TV exposure, NIL collective strength

### Mock Data (5 Athletes, 2 Sports)
- **Jayden Daniels** (Football, LSU) - $3.8M NIL value
- **Caitlin Clark** (Basketball, Iowa) - $4.5M NIL value  
- **Arch Manning** (Football, Texas) - $3.1M NIL value
- **Angel Reese** (Basketball, LSU) - $2.4M NIL value
- **Kumar Rocker** (Baseball, Vanderbilt) - $650K NIL value

## 🤖 ML Models

### Stage A: Attention Score Predictor
- **Architecture**: LSTM-based time series predictor (simplified to LightGBM for demo)
- **Features**: Social components, search components, follower metrics
- **Output**: Predicted attention score with temporal decay (0.95 daily factor)

### Stage B: NIL Value Predictor  
- **Architecture**: LightGBM tree-based regressor
- **Features**: Attention scores, performance indices, market context
- **Output**: NIL value prediction with 90% confidence intervals

### Bayesian Shrinkage
- **Purpose**: Adjust predictions for athletes with limited sample data
- **Method**: Shrink towards population mean based on sample size
- **Threshold**: Minimum 10 samples for full confidence

## 🔧 Feature Engineering

### Attention Score (Weighted: Social 60%, Search 40%)
```python
attention_score = (
    0.6 * social_component +    # Follower count, engagement rate
    0.4 * search_component      # Google trends, search volume
) * decay_factor^days_elapsed
```

### Performance Index (Weighted: Recency 30%, Consistency 40%, Peak 30%)
```python
performance_index = (
    0.3 * recency_weighted_avg +     # Recent game performance
    0.4 * consistency_score +        # Performance stability  
    0.3 * peak_performance_avg       # Best game performances
)
```

### Market Context Features
- **School Market Tier**: 1 (major), 2 (mid-major), 3 (small)
- **TV Exposure Score**: Media coverage and broadcast reach
- **NIL Collective Strength**: School's NIL fundraising capacity
- **Conference Prestige**: SEC, Big Ten, etc.

## 🌐 API Endpoints

### `/athlete/{id}/value` - Individual Valuation
```json
{
  "athlete_id": "NIL-WILLIAMS-LSU",
  "name": "Jayden Daniels",
  "predicted_nil_value_usd": 3800000.0,
  "confidence_interval_lower": 3200000.0,
  "confidence_interval_upper": 4400000.0,
  "prediction_confidence": 0.85,
  "value_drivers": {
    "performance_contribution": 1520000.0,
    "attention_contribution": 1520000.0,
    "market_context_contribution": 760000.0
  },
  "disclaimer": "Estimated value, not contractual. For informational purposes only."
}
```

### `/leaderboard` - Top Athletes Ranking
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "athlete_id": "NIL-CLARK-IOWA",
      "name": "Caitlin Clark",
      "predicted_nil_value_usd": 4500000.0,
      "trend_direction": "up",
      "trend_change_pct": 12.5
    }
  ],
  "total_athletes": 100,
  "disclaimer": "Estimated values, not contractual."
}
```

## ⚡ ETL Orchestration (Prefect)

### Nightly Pipeline Schedule
```python
# Runs daily at 2 AM CT
@flow(name="nil_valuation_etl_pipeline")
def nil_valuation_etl_pipeline():
    # 1. Data ingestion from multiple sources
    # 2. Data quality validation  
    # 3. Feature engineering
    # 4. Model retraining
    # 5. Backtesting validation
    # 6. Results notification
```

### Pipeline Steps
1. **Data Ingestion**: Fetch box scores, social metrics, search trends
2. **Quality Validation**: Check data completeness and freshness
3. **Feature Engineering**: Compute attention scores and performance indices
4. **Model Training**: Retrain 2-stage pipeline with fresh data
5. **Backtesting**: Validate against historical NIL deal data
6. **Deployment**: Update production models and cache

## 💾 Data Storage

### PostgreSQL Database (SQLAlchemy ORM)
- **Athletes**: Master athlete information
- **Performance Data**: Game-by-game performance metrics
- **Social Metrics**: Daily social media and search metrics
- **NIL Valuations**: Historical predictions and actual deal data
- **School Context**: Market context and institutional data

### S3-Compatible Storage (Mock: Local Files)
- **Raw Data**: JSON/CSV files from data sources
- **Processed Features**: Engineered features ready for modeling
- **Model Artifacts**: Trained model files and metadata
- **Backtest Results**: Historical validation results

### Redis Cache
- **API Responses**: 30-minute TTL for athlete valuations
- **Leaderboards**: 15-minute TTL for ranking data
- **Feature Cache**: Computed features for fast prediction

## 🧪 Testing

### Test Coverage
```bash
# Run full test suite
pytest tests/ -v --cov=. --cov-report=html

# Run specific test categories
pytest tests/test_nil_pipeline.py::TestDataIngestion -v
pytest tests/test_nil_pipeline.py::TestNILModels -v
pytest tests/test_nil_pipeline.py::TestAPIEndpoints -v
```

### Test Categories
- **Data Ingestion**: ETL pipeline validation
- **Feature Engineering**: Score computation accuracy
- **ML Models**: Training, prediction, and serialization
- **API Endpoints**: Response structure and caching
- **Integration**: End-to-end pipeline testing

## 📈 Quality & Compliance

### Model Validation
- **Backtesting**: Historical performance against actual NIL deals
- **Cross-Validation**: Time series split validation
- **A/B Testing**: Model version comparison
- **Drift Detection**: Feature and prediction drift monitoring

### Compliance Features
- **Legal Disclaimer**: All predictions include contractual disclaimer
- **Audit Logging**: Complete prediction history and model lineage
- **Data Retention**: Configurable retention policies
- **Privacy Controls**: Athlete data access controls

### Performance Monitoring
- **Model Metrics**: MAE, RMSE, R² tracking
- **API Performance**: Response times and error rates
- **Data Quality**: Completeness and freshness monitoring
- **System Health**: Database, cache, and service status

## 🔒 Security & Privacy

### Data Protection
- **Environment Variables**: Sensitive configuration via environment
- **Database Encryption**: Encrypted connections and data at rest
- **API Rate Limiting**: Configurable request limits
- **Access Controls**: Role-based API access

### Monitoring & Alerting
- **Sentry Integration**: Error tracking and alerting
- **Health Checks**: Service availability monitoring
- **Performance Alerts**: Model drift and quality degradation
- **Security Scanning**: Dependency vulnerability scanning

## 🚀 Production Deployment

### Docker Deployment
```dockerfile
FROM python:3.11-slim
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Kubernetes Configuration
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nil-valuation-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nil-valuation-api
  template:
    spec:
      containers:
      - name: api
        image: nil-valuation:latest
        ports:
        - containerPort: 8000
```

### Environment Configuration
```bash
# Required Environment Variables
DATABASE_URL=postgresql://user:pass@host:5432/nil_valuation
REDIS_HOST=redis-cluster.cache.amazonaws.com
SENTRY_DSN=https://...@sentry.io/...

# API Keys (for production data sources)
BOX_SCORES_API_KEY=your_sports_api_key
TWITTER_API_KEY=your_twitter_api_key
GOOGLE_TRENDS_API_KEY=your_google_api_key
```

## 📋 Configuration

### YAML Configuration (`config/config.yaml`)
```yaml
# Model hyperparameters
models:
  attention_predictor:
    sequence_length: 30
    hidden_units: 128
    learning_rate: 0.001
  nil_value_predictor:
    n_estimators: 1000
    max_depth: 8
    learning_rate: 0.05

# Feature engineering settings
features:
  attention_score:
    social_weight: 0.6
    search_weight: 0.4
    decay_factor: 0.95
```

## 🤝 Contributing

### Development Setup
```bash
# Install development dependencies
pip install -r requirements.txt
pip install pytest pytest-cov black flake8 mypy

# Code formatting
black .
flake8 .
mypy .

# Run tests
pytest tests/ -v
```

### Project Structure
- Follow existing patterns for new features
- Add comprehensive tests for all new code
- Update configuration files as needed
- Document API changes in README

## 📝 License & Disclaimer

**Important**: This NIL Valuation Pipeline provides estimated values for informational purposes only. Predictions are not contractual and should not be used as the sole basis for NIL deal negotiations.

**Legal Disclaimer**: "Estimated value, not contractual. For informational purposes only."

---

**Blaze Sports Intel** - The Deep South Sports Authority  
*Texas Football & SEC Analytics Platform*

For questions or support, please refer to the comprehensive test suite and documentation included in this repository.