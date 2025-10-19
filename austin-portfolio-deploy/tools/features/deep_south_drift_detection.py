#!/usr/bin/env python3
"""
============================================================================
BLAZE INTELLIGENCE DEEP SOUTH DRIFT DETECTION SYSTEM
Advanced ML feature drift monitoring for championship-level analytics
============================================================================

This system provides comprehensive drift detection for Deep South sports
intelligence features using KS-test, PSI (Population Stability Index),
and custom sports-specific drift metrics.

Key Capabilities:
- Statistical drift detection (KS, PSI, Jensen-Shannon)
- Sports-specific drift patterns (seasonal, performance, recruiting cycles)
- Real-time monitoring with configurable thresholds
- Automated alerting and rollback recommendations
- Deep South regional focus with geographic drift analysis

@author Austin Humphrey (ahump20@outlook.com)
@created 2025-09-25
@version 1.0.0
@classification Championship-Level Drift Detection
============================================================================
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional, Any, Union
from datetime import datetime, timedelta
import warnings
import logging
from pathlib import Path
import yaml
import json
from scipy import stats
from scipy.spatial.distance import jensenshannon
import matplotlib.pyplot as plt
import seaborn as sns
from dataclasses import dataclass
from enum import Enum

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore', category=FutureWarning)
warnings.filterwarnings('ignore', category=UserWarning)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DriftSeverity(Enum):
    """Drift severity levels for Deep South sports features"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class SportSeason(Enum):
    """Sports season enumeration for seasonal drift analysis"""
    SPRING = "spring"      # Baseball, Track & Field
    SUMMER = "summer"      # Youth tournaments, Perfect Game
    FALL = "fall"         # Football
    WINTER = "winter"     # Basketball


@dataclass
class DriftAlert:
    """Drift detection alert structure"""
    feature_name: str
    sport: str
    severity: DriftSeverity
    drift_score: float
    metric_type: str
    timestamp: datetime
    description: str
    recommendation: str
    regional_impact: Optional[Dict[str, float]] = None


class DeepSouthDriftDetector:
    """
    Advanced drift detection system for Deep South sports intelligence features
    """

    def __init__(self, config_path: Optional[Path] = None):
        """
        Initialize Deep South drift detector

        Args:
            config_path: Path to drift detection configuration file
        """
        self.config = self._load_config(config_path)
        self.drift_history = []
        self.baseline_distributions = {}
        self.regional_baselines = {}

        # Deep South states for regional analysis
        self.deep_south_states = [
            'TX', 'LA', 'MS', 'AL', 'GA', 'FL', 'AR', 'TN', 'SC', 'NC', 'KY'
        ]

        # Sports-specific thresholds
        self.sport_thresholds = {
            'baseball': {'ks_threshold': 0.15, 'psi_threshold': 0.2, 'js_threshold': 0.3},
            'football': {'ks_threshold': 0.12, 'psi_threshold': 0.25, 'js_threshold': 0.35},
            'basketball': {'ks_threshold': 0.18, 'psi_threshold': 0.22, 'js_threshold': 0.32},
            'track_field': {'ks_threshold': 0.10, 'psi_threshold': 0.15, 'js_threshold': 0.25}
        }

    def _load_config(self, config_path: Optional[Path]) -> Dict[str, Any]:
        """Load drift detection configuration"""
        default_config = {
            'global_thresholds': {
                'ks_threshold': 0.15,
                'psi_threshold': 0.2,
                'js_threshold': 0.3
            },
            'seasonal_adjustments': {
                'spring': {'multiplier': 1.2, 'sports': ['baseball', 'track_field']},
                'fall': {'multiplier': 1.1, 'sports': ['football']},
                'winter': {'multiplier': 1.0, 'sports': ['basketball']},
                'summer': {'multiplier': 1.3, 'sports': ['baseball']}  # Tournament season
            },
            'alert_config': {
                'email_recipients': ['ahump20@outlook.com'],
                'slack_webhook': None,
                'auto_rollback_threshold': 0.8
            }
        }

        if config_path and config_path.exists():
            with open(config_path, 'r') as f:
                custom_config = yaml.safe_load(f)
                default_config.update(custom_config)

        return default_config

    def detect_feature_drift(self,
                           feature_name: str,
                           baseline_data: pd.Series,
                           candidate_data: pd.Series,
                           sport: str,
                           metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Comprehensive drift detection for a single feature

        Args:
            feature_name: Name of the feature being monitored
            baseline_data: Historical baseline data
            candidate_data: New candidate data to compare
            sport: Sport category (baseball, football, basketball, track_field)
            metadata: Additional metadata (season, region, etc.)

        Returns:
            Comprehensive drift analysis results
        """
        if baseline_data.empty or candidate_data.empty:
            logger.warning(f"Empty data provided for {feature_name}")
            return self._empty_drift_result(feature_name, sport)

        # Clean data
        baseline_clean = self._clean_series(baseline_data)
        candidate_clean = self._clean_series(candidate_data)

        if len(baseline_clean) < 10 or len(candidate_clean) < 10:
            logger.warning(f"Insufficient data for drift detection: {feature_name}")
            return self._insufficient_data_result(feature_name, sport)

        # Calculate drift metrics
        ks_result = self._ks_test(baseline_clean, candidate_clean)
        psi_result = self._psi_calculation(baseline_clean, candidate_clean)
        js_result = self._jensen_shannon_divergence(baseline_clean, candidate_clean)

        # Sports-specific analysis
        sport_analysis = self._sports_specific_drift_analysis(
            baseline_clean, candidate_clean, sport, metadata
        )

        # Regional analysis for Deep South
        regional_analysis = self._regional_drift_analysis(
            baseline_data, candidate_data, metadata
        )

        # Seasonal adjustment
        seasonal_factor = self._get_seasonal_adjustment_factor(sport, metadata)

        # Aggregate drift score
        drift_score = self._calculate_aggregate_drift_score(
            ks_result, psi_result, js_result, sport_analysis, seasonal_factor
        )

        # Determine severity
        severity = self._determine_drift_severity(drift_score, sport)

        # Generate recommendations
        recommendations = self._generate_recommendations(
            feature_name, sport, severity, drift_score, sport_analysis
        )

        # Create drift report
        drift_report = {
            'feature_name': feature_name,
            'sport': sport,
            'timestamp': datetime.now().isoformat(),
            'drift_score': drift_score,
            'severity': severity.value,
            'metrics': {
                'ks_statistic': ks_result['statistic'],
                'ks_pvalue': ks_result['pvalue'],
                'psi_score': psi_result['psi'],
                'js_divergence': js_result['divergence']
            },
            'sports_analysis': sport_analysis,
            'regional_analysis': regional_analysis,
            'seasonal_factor': seasonal_factor,
            'recommendations': recommendations,
            'data_summary': {
                'baseline_size': len(baseline_clean),
                'candidate_size': len(candidate_clean),
                'baseline_mean': float(baseline_clean.mean()),
                'candidate_mean': float(candidate_clean.mean()),
                'mean_shift': float(candidate_clean.mean() - baseline_clean.mean()),
                'variance_ratio': float(candidate_clean.var() / baseline_clean.var()) if baseline_clean.var() > 0 else None
            }
        }

        # Store in history
        self._store_drift_result(drift_report)

        # Generate alert if necessary
        if severity in [DriftSeverity.HIGH, DriftSeverity.CRITICAL]:
            self._generate_drift_alert(drift_report)

        return drift_report

    def _ks_test(self, baseline: pd.Series, candidate: pd.Series) -> Dict[str, float]:
        """Kolmogorov-Smirnov test for distribution drift"""
        try:
            statistic, pvalue = stats.ks_2samp(baseline, candidate)
            return {
                'statistic': float(statistic),
                'pvalue': float(pvalue),
                'significant': pvalue < 0.05
            }
        except Exception as e:
            logger.error(f"KS test error: {e}")
            return {'statistic': 0.0, 'pvalue': 1.0, 'significant': False}

    def _psi_calculation(self, baseline: pd.Series, candidate: pd.Series, bins: int = 10) -> Dict[str, Any]:
        """Population Stability Index calculation"""
        try:
            # Create bins based on baseline distribution
            _, bin_edges = np.histogram(baseline, bins=bins)

            # Ensure bins cover full range
            bin_edges[0] = min(baseline.min(), candidate.min()) - 1e-6
            bin_edges[-1] = max(baseline.max(), candidate.max()) + 1e-6

            # Calculate distributions
            baseline_dist, _ = np.histogram(baseline, bins=bin_edges)
            candidate_dist, _ = np.histogram(candidate, bins=bin_edges)

            # Normalize to probabilities
            baseline_pct = baseline_dist / baseline_dist.sum()
            candidate_pct = candidate_dist / candidate_dist.sum()

            # Add small epsilon to avoid log(0)
            epsilon = 1e-6
            baseline_pct = np.maximum(baseline_pct, epsilon)
            candidate_pct = np.maximum(candidate_pct, epsilon)

            # Calculate PSI
            psi = np.sum((candidate_pct - baseline_pct) * np.log(candidate_pct / baseline_pct))

            return {
                'psi': float(psi),
                'bins': len(bin_edges) - 1,
                'interpretation': self._interpret_psi(psi)
            }
        except Exception as e:
            logger.error(f"PSI calculation error: {e}")
            return {'psi': 0.0, 'bins': 0, 'interpretation': 'error'}

    def _jensen_shannon_divergence(self, baseline: pd.Series, candidate: pd.Series, bins: int = 20) -> Dict[str, float]:
        """Jensen-Shannon divergence calculation"""
        try:
            # Create histograms
            min_val = min(baseline.min(), candidate.min())
            max_val = max(baseline.max(), candidate.max())
            bin_edges = np.linspace(min_val, max_val, bins + 1)

            baseline_hist, _ = np.histogram(baseline, bins=bin_edges, density=True)
            candidate_hist, _ = np.histogram(candidate, bins=bin_edges, density=True)

            # Normalize
            baseline_dist = baseline_hist / baseline_hist.sum()
            candidate_dist = candidate_hist / candidate_hist.sum()

            # Calculate JS divergence
            js_divergence = jensenshannon(baseline_dist, candidate_dist)

            return {
                'divergence': float(js_divergence),
                'similarity': float(1 - js_divergence)
            }
        except Exception as e:
            logger.error(f"JS divergence error: {e}")
            return {'divergence': 0.0, 'similarity': 1.0}

    def _sports_specific_drift_analysis(self,
                                      baseline: pd.Series,
                                      candidate: pd.Series,
                                      sport: str,
                                      metadata: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Sports-specific drift pattern analysis"""
        analysis = {'sport_patterns': {}}

        if sport == 'baseball':
            analysis['sport_patterns'] = self._baseball_drift_patterns(baseline, candidate, metadata)
        elif sport == 'football':
            analysis['sport_patterns'] = self._football_drift_patterns(baseline, candidate, metadata)
        elif sport == 'basketball':
            analysis['sport_patterns'] = self._basketball_drift_patterns(baseline, candidate, metadata)
        elif sport == 'track_field':
            analysis['sport_patterns'] = self._track_field_drift_patterns(baseline, candidate, metadata)

        return analysis

    def _baseball_drift_patterns(self, baseline: pd.Series, candidate: pd.Series,
                                metadata: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Baseball-specific drift analysis"""
        patterns = {}

        # Perfect Game tournament season impact
        if metadata and 'season' in metadata:
            if metadata['season'] in ['summer', 'spring']:
                patterns['tournament_season_adjustment'] = 1.2
            else:
                patterns['tournament_season_adjustment'] = 1.0

        # Velocity progression patterns (typical in baseball)
        mean_shift = candidate.mean() - baseline.mean()
        if abs(mean_shift) > baseline.std() * 0.5:
            patterns['significant_mean_shift'] = {
                'magnitude': float(mean_shift),
                'direction': 'increase' if mean_shift > 0 else 'decrease',
                'possible_cause': 'velocity_development' if mean_shift > 0 else 'measurement_drift'
            }

        # Recruiting cycle impact
        if metadata and 'month' in metadata:
            recruiting_months = [6, 7, 8, 9]  # June through September
            if metadata['month'] in recruiting_months:
                patterns['recruiting_cycle_factor'] = 1.15

        return patterns

    def _football_drift_patterns(self, baseline: pd.Series, candidate: pd.Series,
                                metadata: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Football-specific drift analysis"""
        patterns = {}

        # Friday Night Lights season impact
        if metadata and 'season' in metadata:
            if metadata['season'] == 'fall':
                patterns['game_season_adjustment'] = 1.1

        # Texas high school football recruiting impact
        if metadata and 'state' in metadata:
            if metadata['state'] == 'TX':
                patterns['texas_football_factor'] = 1.2

        # Position-specific drift (if available)
        if metadata and 'position' in metadata:
            skill_positions = ['QB', 'RB', 'WR', 'DB']
            if metadata['position'] in skill_positions:
                patterns['skill_position_variability'] = 1.1

        return patterns

    def _basketball_drift_patterns(self, baseline: pd.Series, candidate: pd.Series,
                                  metadata: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Basketball-specific drift analysis"""
        patterns = {}

        # March Madness impact
        if metadata and 'month' in metadata:
            if metadata['month'] == 3:  # March
                patterns['march_madness_factor'] = 1.3

        # AAU tournament season
        if metadata and 'season' in metadata:
            if metadata['season'] == 'summer':
                patterns['aau_season_adjustment'] = 1.2

        # Grizzlies young core development patterns
        if metadata and 'team' in metadata:
            if metadata['team'] == 'MEM':
                patterns['young_core_volatility'] = 1.15

        return patterns

    def _track_field_drift_patterns(self, baseline: pd.Series, candidate: pd.Series,
                                   metadata: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Track & field-specific drift analysis"""
        patterns = {}

        # Olympic year impact
        if metadata and 'year' in metadata:
            olympic_years = [2024, 2028, 2032]
            if metadata['year'] in olympic_years:
                patterns['olympic_year_factor'] = 1.4

        # Weather dependency for outdoor events
        if metadata and 'event_type' in metadata:
            outdoor_events = ['100m', '200m', '400m', 'long_jump', 'shot_put']
            if metadata['event_type'] in outdoor_events:
                patterns['weather_sensitivity'] = 1.2

        # Championship meet season
        if metadata and 'season' in metadata:
            if metadata['season'] == 'spring':
                patterns['championship_season_factor'] = 1.1

        return patterns

    def _regional_drift_analysis(self, baseline_data: pd.Series, candidate_data: pd.Series,
                                metadata: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Deep South regional drift analysis"""
        regional_analysis = {'deep_south_focus': True}

        if not metadata or 'region' not in metadata:
            return regional_analysis

        # Analyze drift by Deep South vs. other regions
        if 'state' in metadata:
            state = metadata['state']
            if state in self.deep_south_states:
                regional_analysis['is_deep_south'] = True
                regional_analysis['regional_multiplier'] = 1.1
            else:
                regional_analysis['is_deep_south'] = False
                regional_analysis['regional_multiplier'] = 1.0

        return regional_analysis

    def _get_seasonal_adjustment_factor(self, sport: str, metadata: Optional[Dict[str, Any]]) -> float:
        """Calculate seasonal adjustment factor"""
        if not metadata or 'season' not in metadata:
            return 1.0

        season = metadata['season']
        if season in self.config['seasonal_adjustments']:
            adjustment = self.config['seasonal_adjustments'][season]
            if sport in adjustment['sports']:
                return adjustment['multiplier']

        return 1.0

    def _calculate_aggregate_drift_score(self, ks_result: Dict[str, float],
                                       psi_result: Dict[str, Any],
                                       js_result: Dict[str, float],
                                       sport_analysis: Dict[str, Any],
                                       seasonal_factor: float) -> float:
        """Calculate aggregate drift score"""
        # Weight the different metrics
        ks_weight = 0.3
        psi_weight = 0.4
        js_weight = 0.3

        # Normalize scores to 0-1 scale
        ks_score = min(ks_result['statistic'] / 0.5, 1.0)
        psi_score = min(psi_result['psi'] / 1.0, 1.0)
        js_score = js_result['divergence']

        # Calculate base score
        base_score = (ks_score * ks_weight +
                     psi_score * psi_weight +
                     js_score * js_weight)

        # Apply seasonal adjustment
        adjusted_score = base_score * seasonal_factor

        # Apply sports-specific patterns
        sport_patterns = sport_analysis.get('sport_patterns', {})
        for pattern, factor in sport_patterns.items():
            if isinstance(factor, (int, float)) and factor > 1.0:
                adjusted_score *= factor

        return min(adjusted_score, 1.0)

    def _determine_drift_severity(self, drift_score: float, sport: str) -> DriftSeverity:
        """Determine drift severity level"""
        thresholds = self.sport_thresholds.get(sport, self.config['global_thresholds'])

        if drift_score < 0.1:
            return DriftSeverity.LOW
        elif drift_score < 0.3:
            return DriftSeverity.MEDIUM
        elif drift_score < 0.6:
            return DriftSeverity.HIGH
        else:
            return DriftSeverity.CRITICAL

    def _generate_recommendations(self, feature_name: str, sport: str,
                                severity: DriftSeverity, drift_score: float,
                                sport_analysis: Dict[str, Any]) -> List[str]:
        """Generate actionable recommendations based on drift analysis"""
        recommendations = []

        if severity == DriftSeverity.LOW:
            recommendations.append("Monitor closely but no immediate action needed")
            recommendations.append("Continue regular data quality checks")

        elif severity == DriftSeverity.MEDIUM:
            recommendations.append("Investigate data source changes")
            recommendations.append("Review feature engineering logic")
            recommendations.append("Consider seasonal or regional factors")

        elif severity == DriftSeverity.HIGH:
            recommendations.append("Immediate investigation required")
            recommendations.append("Consider feature rollback to previous version")
            recommendations.append("Review upstream data pipeline changes")
            recommendations.append("Validate with domain experts")

        elif severity == DriftSeverity.CRITICAL:
            recommendations.append("URGENT: Stop using this feature for predictions")
            recommendations.append("Rollback to last stable version immediately")
            recommendations.append("Emergency investigation of data pipeline")
            recommendations.append("Notify championship analytics team")

        # Add sport-specific recommendations
        sport_patterns = sport_analysis.get('sport_patterns', {})
        if sport == 'baseball' and 'recruiting_cycle_factor' in sport_patterns:
            recommendations.append("Consider Perfect Game tournament season impact")

        if sport == 'football' and 'texas_football_factor' in sport_patterns:
            recommendations.append("Review Dave Campbell's Texas Football data source")

        if sport == 'basketball' and 'march_madness_factor' in sport_patterns:
            recommendations.append("Account for March Madness tournament variability")

        return recommendations

    def _clean_series(self, series: pd.Series) -> pd.Series:
        """Clean data series for drift analysis"""
        # Remove NaN and infinite values
        cleaned = series.dropna()
        cleaned = cleaned[np.isfinite(cleaned)]

        # Remove extreme outliers (beyond 3 standard deviations)
        if len(cleaned) > 10:
            z_scores = np.abs(stats.zscore(cleaned))
            cleaned = cleaned[z_scores < 3]

        return cleaned

    def _interpret_psi(self, psi: float) -> str:
        """Interpret PSI score"""
        if psi < 0.1:
            return "No significant change"
        elif psi < 0.25:
            return "Minor change - monitor"
        elif psi < 0.5:
            return "Major change - investigate"
        else:
            return "Severe change - immediate action required"

    def _empty_drift_result(self, feature_name: str, sport: str) -> Dict[str, Any]:
        """Return empty drift result for invalid inputs"""
        return {
            'feature_name': feature_name,
            'sport': sport,
            'timestamp': datetime.now().isoformat(),
            'drift_score': 0.0,
            'severity': DriftSeverity.LOW.value,
            'error': 'Empty or invalid input data',
            'recommendations': ['Fix data input issues before retrying drift detection']
        }

    def _insufficient_data_result(self, feature_name: str, sport: str) -> Dict[str, Any]:
        """Return insufficient data result"""
        return {
            'feature_name': feature_name,
            'sport': sport,
            'timestamp': datetime.now().isoformat(),
            'drift_score': 0.0,
            'severity': DriftSeverity.LOW.value,
            'error': 'Insufficient data for reliable drift detection',
            'recommendations': ['Collect more data before performing drift analysis']
        }

    def _store_drift_result(self, drift_report: Dict[str, Any]):
        """Store drift detection result in history"""
        self.drift_history.append(drift_report)

        # Keep only last 1000 results
        if len(self.drift_history) > 1000:
            self.drift_history = self.drift_history[-1000:]

    def _generate_drift_alert(self, drift_report: Dict[str, Any]):
        """Generate drift alert for high/critical severity"""
        alert = DriftAlert(
            feature_name=drift_report['feature_name'],
            sport=drift_report['sport'],
            severity=DriftSeverity(drift_report['severity']),
            drift_score=drift_report['drift_score'],
            metric_type='aggregate',
            timestamp=datetime.fromisoformat(drift_report['timestamp']),
            description=f"Drift detected in {drift_report['feature_name']} with score {drift_report['drift_score']:.3f}",
            recommendation="; ".join(drift_report['recommendations'][:3])
        )

        logger.warning(f"DRIFT ALERT: {alert.description}")

        # Here you would integrate with actual alerting systems
        # self._send_email_alert(alert)
        # self._send_slack_alert(alert)

    def generate_drift_report(self,
                            start_date: Optional[datetime] = None,
                            end_date: Optional[datetime] = None) -> Dict[str, Any]:
        """Generate comprehensive drift monitoring report"""
        if not start_date:
            start_date = datetime.now() - timedelta(days=7)
        if not end_date:
            end_date = datetime.now()

        # Filter drift history by date range
        filtered_history = [
            result for result in self.drift_history
            if start_date <= datetime.fromisoformat(result['timestamp']) <= end_date
        ]

        if not filtered_history:
            return {
                'period': f"{start_date.date()} to {end_date.date()}",
                'total_checks': 0,
                'alerts_generated': 0,
                'features_monitored': 0,
                'summary': 'No drift detection results in specified period'
            }

        # Generate summary statistics
        severity_counts = {}
        sport_breakdown = {}
        feature_breakdown = {}

        for result in filtered_history:
            # Severity distribution
            severity = result['severity']
            severity_counts[severity] = severity_counts.get(severity, 0) + 1

            # Sport breakdown
            sport = result['sport']
            sport_breakdown[sport] = sport_breakdown.get(sport, 0) + 1

            # Feature breakdown
            feature = result['feature_name']
            if feature not in feature_breakdown:
                feature_breakdown[feature] = {
                    'checks': 0, 'avg_score': 0, 'max_score': 0, 'alerts': 0
                }
            feature_breakdown[feature]['checks'] += 1
            feature_breakdown[feature]['avg_score'] += result['drift_score']
            feature_breakdown[feature]['max_score'] = max(
                feature_breakdown[feature]['max_score'], result['drift_score']
            )
            if result['severity'] in ['high', 'critical']:
                feature_breakdown[feature]['alerts'] += 1

        # Calculate averages
        for feature in feature_breakdown:
            feature_breakdown[feature]['avg_score'] /= feature_breakdown[feature]['checks']

        report = {
            'period': f"{start_date.date()} to {end_date.date()}",
            'total_checks': len(filtered_history),
            'alerts_generated': sum([
                severity_counts.get('high', 0),
                severity_counts.get('critical', 0)
            ]),
            'features_monitored': len(feature_breakdown),
            'severity_distribution': severity_counts,
            'sport_breakdown': sport_breakdown,
            'feature_analysis': feature_breakdown,
            'avg_drift_score': np.mean([r['drift_score'] for r in filtered_history]),
            'max_drift_score': max([r['drift_score'] for r in filtered_history]),
            'recommendations': self._generate_overall_recommendations(filtered_history),
            'championship_readiness': self._assess_championship_readiness(filtered_history)
        }

        return report

    def _generate_overall_recommendations(self, history: List[Dict[str, Any]]) -> List[str]:
        """Generate overall recommendations based on drift history"""
        recommendations = []

        high_drift_features = [
            r['feature_name'] for r in history
            if r['severity'] in ['high', 'critical']
        ]

        if high_drift_features:
            recommendations.append(
                f"High priority: Address drift in {len(set(high_drift_features))} features"
            )

        # Sport-specific recommendations
        sport_issues = {}
        for result in history:
            if result['severity'] in ['high', 'critical']:
                sport = result['sport']
                sport_issues[sport] = sport_issues.get(sport, 0) + 1

        for sport, count in sport_issues.items():
            if count > 2:
                recommendations.append(f"Review {sport} data pipeline - {count} drift alerts")

        if not recommendations:
            recommendations.append("All features stable - continue monitoring")

        return recommendations

    def _assess_championship_readiness(self, history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Assess championship readiness based on drift status"""
        critical_drifts = len([r for r in history if r['severity'] == 'critical'])
        high_drifts = len([r for r in history if r['severity'] == 'high'])

        if critical_drifts > 0:
            readiness = "NOT_READY"
            message = f"{critical_drifts} critical drift issues require immediate attention"
        elif high_drifts > 3:
            readiness = "CAUTION"
            message = f"{high_drifts} high drift issues need investigation"
        else:
            readiness = "CHAMPIONSHIP_READY"
            message = "All features within acceptable drift thresholds"

        return {
            'status': readiness,
            'message': message,
            'critical_issues': critical_drifts,
            'high_priority_issues': high_drifts
        }

    def export_drift_results(self, filepath: Path, format: str = 'json'):
        """Export drift detection results"""
        if format.lower() == 'json':
            with open(filepath, 'w') as f:
                json.dump(self.drift_history, f, indent=2, default=str)
        elif format.lower() == 'csv':
            df = pd.DataFrame(self.drift_history)
            df.to_csv(filepath, index=False)
        else:
            raise ValueError(f"Unsupported export format: {format}")

        logger.info(f"Drift results exported to {filepath}")


# CLI interface for drift detection
if __name__ == "__main__":
    """Command-line interface for Deep South drift detection"""
    import argparse

    parser = argparse.ArgumentParser(description="Deep South Drift Detection System")
    parser.add_argument('--config', type=str, help='Path to configuration file')
    parser.add_argument('--baseline', type=str, required=True, help='Path to baseline data CSV')
    parser.add_argument('--candidate', type=str, required=True, help='Path to candidate data CSV')
    parser.add_argument('--feature', type=str, required=True, help='Feature column name')
    parser.add_argument('--sport', type=str, required=True,
                       choices=['baseball', 'football', 'basketball', 'track_field'])
    parser.add_argument('--output', type=str, help='Output file path for results')

    args = parser.parse_args()

    # Initialize detector
    config_path = Path(args.config) if args.config else None
    detector = DeepSouthDriftDetector(config_path)

    # Load data
    baseline_df = pd.read_csv(args.baseline)
    candidate_df = pd.read_csv(args.candidate)

    # Run drift detection
    result = detector.detect_feature_drift(
        feature_name=args.feature,
        baseline_data=baseline_df[args.feature],
        candidate_data=candidate_df[args.feature],
        sport=args.sport
    )

    # Output results
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(result, f, indent=2, default=str)
    else:
        print(json.dumps(result, indent=2, default=str))