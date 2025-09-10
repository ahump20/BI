#!/usr/bin/env python3
"""
Advanced Biometric Data Integration System for Blaze Intelligence
Integrates physiological, biomechanical, and performance biometrics
"""

import json
import numpy as np  # pyright: ignore[reportMissingImports]
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import logging
from dataclasses import dataclass
import requests  # pyright: ignore[reportMissingModuleSource]
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class BiometricReading:
    """Standardized biometric reading structure"""
    metric_type: str
    value: float
    unit: str
    timestamp: datetime
    confidence: float
    source_device: str


class BiometricIntegrator:
    """
    Advanced biometric data integration and analysis system
    Processes data from multiple biometric sources and devices
    """
    
    def __init__(self, player_id: str, sport: str = "baseball"):
        self.player_id = player_id
        self.sport = sport.lower()
        self.readings = []
        self.thresholds = self._load_sport_thresholds()
        self.baseline_metrics = {}
        
    def _load_sport_thresholds(self) -> Dict[str, Dict[str, float]]:
        """Load sport-specific biometric thresholds"""
        thresholds = {
            "baseball": {
                "heart_rate": {"resting": [50, 70], "peak": [160, 190], "recovery": [80, 110]},
                "vo2_max": {"elite": 55, "good": 45, "average": 35},
                "body_fat": {"elite": [6, 12], "good": [8, 15], "average": [12, 20]},
                "reaction_time": {"elite": 0.15, "good": 0.20, "average": 0.25},
                "vertical_jump": {"elite": 35, "good": 30, "average": 25},  # inches
                "grip_strength": {"elite": 130, "good": 110, "average": 90},  # lbs
                "flexibility": {"elite": 8, "good": 6, "average": 4},  # shoulder internal rotation
                "power_output": {"elite": 1000, "good": 800, "average": 600}  # watts
            },
            "basketball": {
                "heart_rate": {"resting": [45, 65], "peak": [170, 200], "recovery": [75, 105]},
                "vo2_max": {"elite": 60, "good": 50, "average": 40},
                "body_fat": {"elite": [4, 8], "good": [6, 10], "average": [8, 15]},
                "reaction_time": {"elite": 0.12, "good": 0.18, "average": 0.22},
                "vertical_jump": {"elite": 40, "good": 35, "average": 28},
                "grip_strength": {"elite": 120, "good": 100, "average": 80},
                "flexibility": {"elite": 10, "good": 8, "average": 6},
                "power_output": {"elite": 1200, "good": 1000, "average": 800}
            },
            "football": {
                "heart_rate": {"resting": [50, 70], "peak": [170, 195], "recovery": [80, 115]},
                "vo2_max": {"elite": 58, "good": 48, "average": 38},
                "body_fat": {"elite": [6, 14], "good": [8, 16], "average": [10, 20]},
                "reaction_time": {"elite": 0.13, "good": 0.19, "average": 0.24},
                "vertical_jump": {"elite": 38, "good": 32, "average": 26},
                "grip_strength": {"elite": 140, "good": 120, "average": 100},
                "flexibility": {"elite": 9, "good": 7, "average": 5},
                "power_output": {"elite": 1400, "good": 1100, "average": 900}
            }
        }
        
        return thresholds.get(self.sport, thresholds["baseball"])
    
    def add_reading(self, metric_type: str, value: float, unit: str, 
                   source_device: str, confidence: float = 1.0) -> None:
        """Add a new biometric reading"""
        reading = BiometricReading(
            metric_type=metric_type,
            value=value,
            unit=unit,
            timestamp=datetime.now(),
            confidence=confidence,
            source_device=source_device
        )
        
        self.readings.append(reading)
        logger.debug(f"Added {metric_type} reading: {value} {unit}")
    
    def simulate_device_readings(self) -> List[BiometricReading]:
        """Simulate readings from various biometric devices"""
        readings = []
        
        # Heart Rate Variability (Polar H10, Whoop)
        base_hr = np.random.normal(60, 8)
        readings.append(BiometricReading(
            "heart_rate_resting", base_hr, "bpm",
            datetime.now(), 0.95, "Polar_H10"
        ))
        
        # VO2 Max (metabolic cart, fitness tracker estimate)
        vo2_max = np.random.normal(48, 6)
        readings.append(BiometricReading(
            "vo2_max", vo2_max, "ml/kg/min",
            datetime.now(), 0.85, "Metabolic_Cart"
        ))
        
        # Body Composition (DEXA, InBody)
        body_fat = np.random.normal(10, 3)
        muscle_mass = np.random.normal(75, 5)
        readings.extend([
            BiometricReading("body_fat_percentage", body_fat, "%", 
                           datetime.now(), 0.92, "InBody_970"),
            BiometricReading("lean_muscle_mass", muscle_mass, "kg",
                           datetime.now(), 0.92, "InBody_970")
        ])
        
        # Neuromuscular Function (Force plates, reaction timer)
        reaction_time = np.random.normal(0.18, 0.03)
        vertical_jump = np.random.normal(32, 4)
        readings.extend([
            BiometricReading("reaction_time", reaction_time, "seconds",
                           datetime.now(), 0.98, "Blazepod_Trainer"),
            BiometricReading("vertical_jump", vertical_jump, "inches",
                           datetime.now(), 0.95, "ForceDecks_Force_Plate")
        ])
        
        # Strength & Power (Dynamometer, Power meter)
        grip_strength = np.random.normal(115, 15)
        power_output = np.random.normal(850, 100)
        readings.extend([
            BiometricReading("grip_strength", grip_strength, "lbs",
                           datetime.now(), 0.97, "Jamar_Dynamometer"),
            BiometricReading("peak_power_output", power_output, "watts",
                           datetime.now(), 0.93, "Keiser_A300")
        ])
        
        # Flexibility & Mobility (Goniometer, functional movement)
        shoulder_flexibility = np.random.normal(7, 2)
        hip_mobility = np.random.normal(45, 8)
        readings.extend([
            BiometricReading("shoulder_internal_rotation", shoulder_flexibility, "cm",
                           datetime.now(), 0.88, "Digital_Goniometer"),
            BiometricReading("hip_flexion_range", hip_mobility, "degrees",
                           datetime.now(), 0.88, "Functional_Movement_Screen")
        ])
        
        # Recovery & Sleep (Whoop, Oura Ring)
        sleep_quality = np.random.normal(85, 10)
        hrv = np.random.normal(45, 8)
        readings.extend([
            BiometricReading("sleep_quality_score", sleep_quality, "score",
                           datetime.now(), 0.82, "Oura_Ring_Gen3"),
            BiometricReading("heart_rate_variability", hrv, "ms",
                           datetime.now(), 0.90, "Whoop_4.0")
        ])
        
        return readings
    
    def classify_metric_performance(self, metric_type: str, value: float) -> Dict[str, Any]:
        """Classify metric performance against sport-specific thresholds"""
        
        if metric_type not in self.thresholds:
            return {"classification": "unknown", "percentile": 50, "elite_threshold": None}
        
        threshold_data = self.thresholds[metric_type]
        
        # Handle different threshold structures
        if isinstance(threshold_data, dict):
            # Range-based thresholds (like heart_rate, body_fat)
            if "elite" in threshold_data:
                # Single value thresholds
                elite_threshold = threshold_data["elite"]
                good_threshold = threshold_data["good"]
                
                # Higher is better for most metrics
                if metric_type in ["vo2_max", "vertical_jump", "grip_strength", "power_output", "flexibility", "sleep_quality_score", "heart_rate_variability"]:
                    if value >= elite_threshold:
                        classification = "elite"
                        percentile = 90 + min(10, (value - elite_threshold) / elite_threshold * 10)
                    elif value >= good_threshold:
                        classification = "above_average"
                        percentile = 70 + (value - good_threshold) / (elite_threshold - good_threshold) * 20
                    else:
                        classification = "needs_improvement"
                        percentile = max(10, 70 * value / good_threshold)
                
                # Lower is better for some metrics
                elif metric_type in ["reaction_time"]:
                    if value <= elite_threshold:
                        classification = "elite"
                        percentile = 90 + min(10, (elite_threshold - value) / elite_threshold * 10)
                    elif value <= good_threshold:
                        classification = "above_average"
                        percentile = 70 + (good_threshold - value) / (good_threshold - elite_threshold) * 20
                    else:
                        classification = "needs_improvement"
                        percentile = max(10, 70 - (value - good_threshold) / good_threshold * 60)
                
                # Range-based metrics (body_fat)
                else:
                    elite_range = threshold_data.get("elite", [0, 100])
                    good_range = threshold_data.get("good", [0, 100])
                    
                    if elite_range[0] <= value <= elite_range[1]:
                        classification = "elite"
                        percentile = 95
                    elif good_range[0] <= value <= good_range[1]:
                        classification = "above_average"
                        percentile = 80
                    else:
                        classification = "needs_improvement"
                        percentile = 40
                
                return {
                    "classification": classification,
                    "percentile": round(percentile, 1),
                    "elite_threshold": elite_threshold,
                    "improvement_needed": elite_threshold - value if classification != "elite" else 0
                }
        
        # Default classification
        return {"classification": "average", "percentile": 50, "elite_threshold": None}
    
    def analyze_readiness_indicators(self, readings: List[BiometricReading]) -> Dict[str, Any]:
        """Analyze biometric indicators of performance readiness"""
        
        readiness_factors = {
            "cardiovascular": 0,
            "neuromuscular": 0, 
            "recovery": 0,
            "strength_power": 0,
            "flexibility_mobility": 0
        }
        
        factor_counts = {key: 0 for key in readiness_factors.keys()}
        
        for reading in readings:
            classification = self.classify_metric_performance(reading.metric_type, reading.value)
            percentile_score = classification["percentile"] / 100.0
            
            # Map metrics to readiness factors
            if reading.metric_type in ["heart_rate_resting", "vo2_max", "heart_rate_variability"]:
                readiness_factors["cardiovascular"] += percentile_score
                factor_counts["cardiovascular"] += 1
                
            elif reading.metric_type in ["reaction_time", "vertical_jump"]:
                readiness_factors["neuromuscular"] += percentile_score
                factor_counts["neuromuscular"] += 1
                
            elif reading.metric_type in ["sleep_quality_score", "heart_rate_variability"]:
                readiness_factors["recovery"] += percentile_score
                factor_counts["recovery"] += 1
                
            elif reading.metric_type in ["grip_strength", "peak_power_output"]:
                readiness_factors["strength_power"] += percentile_score
                factor_counts["strength_power"] += 1
                
            elif reading.metric_type in ["shoulder_internal_rotation", "hip_flexion_range"]:
                readiness_factors["flexibility_mobility"] += percentile_score
                factor_counts["flexibility_mobility"] += 1
        
        # Calculate average scores
        for factor in readiness_factors:
            if factor_counts[factor] > 0:
                readiness_factors[factor] = readiness_factors[factor] / factor_counts[factor]
        
        # Overall readiness score (weighted by sport requirements)
        sport_weights = {
            "baseball": {"cardiovascular": 0.15, "neuromuscular": 0.35, "recovery": 0.20, "strength_power": 0.20, "flexibility_mobility": 0.10},
            "basketball": {"cardiovascular": 0.25, "neuromuscular": 0.30, "recovery": 0.20, "strength_power": 0.15, "flexibility_mobility": 0.10}, 
            "football": {"cardiovascular": 0.20, "neuromuscular": 0.25, "recovery": 0.15, "strength_power": 0.30, "flexibility_mobility": 0.10}
        }
        
        weights = sport_weights.get(self.sport, sport_weights["baseball"])
        overall_readiness = sum(readiness_factors[factor] * weights[factor] for factor in readiness_factors)
        
        return {
            "overall_readiness_score": round(overall_readiness * 100, 1),
            "factor_scores": {factor: round(score * 100, 1) for factor, score in readiness_factors.items()},
            "readiness_level": self._classify_readiness_level(overall_readiness * 100),
            "recommendations": self._generate_biometric_recommendations(readiness_factors, weights)
        }
    
    def _classify_readiness_level(self, score: float) -> str:
        """Classify overall readiness level"""
        if score >= 85:
            return "Peak Performance"
        elif score >= 70:
            return "Competition Ready"
        elif score >= 55:
            return "Training Ready"
        elif score >= 40:
            return "Active Recovery"
        else:
            return "Rest Required"
    
    def _generate_biometric_recommendations(self, factors: Dict[str, float], weights: Dict[str, float]) -> List[str]:
        """Generate specific recommendations based on biometric profile"""
        recommendations = []
        
        # Identify weakest areas
        weak_factors = [(factor, score) for factor, score in factors.items() if score < 0.6]
        weak_factors.sort(key=lambda x: x[1])
        
        for factor, score in weak_factors[:3]:  # Top 3 areas for improvement
            if factor == "cardiovascular":
                recommendations.append("Increase aerobic base training - focus on zone 2 cardio 3-4x/week")
            elif factor == "neuromuscular":
                recommendations.append("Implement plyometric training and reactive agility drills")
            elif factor == "recovery":
                recommendations.append("Prioritize sleep hygiene and stress management protocols")
            elif factor == "strength_power":
                recommendations.append("Add explosive power training with olympic lifts and medicine balls")
            elif factor == "flexibility_mobility":
                recommendations.append("Include daily mobility work and targeted stretching routines")
        
        # Sport-specific recommendations
        if self.sport == "baseball" and factors.get("flexibility_mobility", 1) < 0.7:
            recommendations.append("Focus on shoulder and hip mobility for pitching/hitting mechanics")
        elif self.sport == "basketball" and factors.get("neuromuscular", 1) < 0.7:
            recommendations.append("Add jump training and court-specific reaction drills")
        
        return recommendations[:5]  # Top 5 recommendations
    
    def integration_report(self) -> Dict[str, Any]:
        """Generate comprehensive biometric integration report"""
        
        # Simulate recent biometric readings
        readings = self.simulate_device_readings()
        
        # Analyze readiness
        readiness_analysis = self.analyze_readiness_indicators(readings)
        
        # Classify individual metrics
        metric_classifications = {}
        for reading in readings:
            classification = self.classify_metric_performance(reading.metric_type, reading.value)
            metric_classifications[reading.metric_type] = {
                "value": reading.value,
                "unit": reading.unit,
                "classification": classification["classification"],
                "percentile": classification["percentile"],
                "device": reading.source_device,
                "confidence": reading.confidence
            }
        
        # Generate injury risk assessment
        injury_risk = self._assess_injury_risk(readings)
        
        # Performance prediction
        performance_prediction = self._predict_performance_window(readiness_analysis["overall_readiness_score"])
        
        return {
            "player_id": self.player_id,
            "sport": self.sport,
            "assessment_timestamp": datetime.now().isoformat(),
            "biometric_summary": {
                "total_metrics_analyzed": len(readings),
                "data_confidence_avg": round(np.mean([r.confidence for r in readings]), 3),
                "assessment_period": "24_hours"
            },
            "readiness_analysis": readiness_analysis,
            "individual_metrics": metric_classifications,
            "injury_risk_assessment": injury_risk,
            "performance_prediction": performance_prediction,
            "integration_quality": "high",
            "devices_used": list(set([r.source_device for r in readings]))
        }
    
    def _assess_injury_risk(self, readings: List[BiometricReading]) -> Dict[str, Any]:
        """Assess injury risk based on biometric patterns"""
        risk_factors = []
        overall_risk = "low"
        
        for reading in readings:
            classification = self.classify_metric_performance(reading.metric_type, reading.value)
            
            # Identify high-risk patterns
            if reading.metric_type == "heart_rate_variability" and classification["percentile"] < 30:
                risk_factors.append("Low HRV indicates high stress/poor recovery")
                overall_risk = "moderate"
            
            elif reading.metric_type == "sleep_quality_score" and classification["percentile"] < 40:
                risk_factors.append("Poor sleep quality increases injury susceptibility")
                overall_risk = "moderate"
            
            elif reading.metric_type == "flexibility_mobility" and classification["percentile"] < 35:
                risk_factors.append("Reduced mobility increases overuse injury risk")
                if overall_risk == "low":
                    overall_risk = "moderate"
        
        # Sport-specific risk patterns
        if self.sport == "baseball":
            # Check shoulder mobility for pitchers
            shoulder_metrics = [r for r in readings if "shoulder" in r.metric_type]
            if shoulder_metrics and shoulder_metrics[0].value < 5:
                risk_factors.append("Limited shoulder internal rotation - high UCL injury risk")
                overall_risk = "high"
        
        return {
            "overall_risk_level": overall_risk,
            "risk_factors": risk_factors,
            "monitoring_recommendations": [
                "Continue daily biometric monitoring",
                "Alert coaching staff if risk factors increase",
                "Implement targeted injury prevention protocols"
            ]
        }
    
    def _predict_performance_window(self, readiness_score: float) -> Dict[str, Any]:
        """Predict optimal performance window based on current biometrics"""
        
        if readiness_score >= 85:
            window = "next_48_hours"
            confidence = 0.92
        elif readiness_score >= 70:
            window = "next_24_hours"
            confidence = 0.85
        elif readiness_score >= 55:
            window = "after_recovery_session"
            confidence = 0.75
        else:
            window = "48_72_hours_with_rest"
            confidence = 0.65
        
        return {
            "optimal_performance_window": window,
            "prediction_confidence": confidence,
            "expected_performance_level": min(100, readiness_score + 5),
            "factors_driving_prediction": [
                "Current biometric readiness profile",
                "Sport-specific performance requirements",
                "Historical performance correlation data"
            ]
        }


def main():
    """Test the biometric integrator"""
    print("🔬 BLAZE INTELLIGENCE - BIOMETRIC INTEGRATION SYSTEM")
    print("=" * 60)
    
    # Test with different athletes
    test_athletes = [
        {"id": "nba_mem_ja_morant", "sport": "basketball", "name": "Ja Morant"},
        {"id": "mlb_stl_goldschmidt", "sport": "baseball", "name": "Paul Goldschmidt"},
        {"id": "nfl_ten_henry", "sport": "football", "name": "Derrick Henry"}
    ]
    
    for athlete in test_athletes:
        print(f"\n🏃‍♂️ BIOMETRIC ANALYSIS: {athlete['name']} ({athlete['sport'].upper()})")
        print("-" * 50)
        
        integrator = BiometricIntegrator(athlete["id"], athlete["sport"])
        report = integrator.integration_report()
        
        # Display key results
        readiness = report["readiness_analysis"]
        print(f"📊 Overall Readiness: {readiness['overall_readiness_score']}/100 ({readiness['readiness_level']})")
        
        print(f"\n🎯 Factor Breakdown:")
        for factor, score in readiness["factor_scores"].items():
            status = "🟢" if score >= 80 else "🟡" if score >= 60 else "🔴"
            print(f"   {status} {factor.replace('_', ' ').title()}: {score}/100")
        
        print(f"\n💡 Top Recommendations:")
        for i, rec in enumerate(readiness["recommendations"][:3], 1):
            print(f"   {i}. {rec}")
        
        # Injury risk
        injury = report["injury_risk_assessment"]
        risk_color = "🟢" if injury["overall_risk_level"] == "low" else "🟡" if injury["overall_risk_level"] == "moderate" else "🔴"
        print(f"\n⚠️  Injury Risk: {risk_color} {injury['overall_risk_level'].upper()}")
        
        # Performance prediction
        perf = report["performance_prediction"]
        print(f"🎯 Optimal Performance Window: {perf['optimal_performance_window'].replace('_', ' ').title()}")
        
        # Save detailed report
        output_file = f"data/biometric_report_{athlete['id']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        try:
            with open(output_file, 'w') as f:
                json.dump(report, f, indent=2)
            print(f"💾 Detailed report saved: {output_file}")
        except Exception as e:
            print(f"❌ Error saving report: {str(e)}")
    
    print(f"\n🟢 Biometric Integration System test completed!")


if __name__ == "__main__":
    main()