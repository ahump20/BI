#!/usr/bin/env python3
"""
Biomechanical Analysis Engine for Blaze Intelligence
Analyzes athletic movement patterns, form, and mechanics from video
"""

import numpy as np
import cv2
from typing import Dict, List, Any, Optional, Tuple
import json
from datetime import datetime
import os


class BiomechanicalAnalyzer:
    """
    Advanced biomechanical analysis for athletic performance
    Focuses on movement efficiency, form optimization, and injury risk assessment
    """
    
    def __init__(self, sport: str = "baseball", model_path: Optional[str] = None):
        self.sport = sport.lower()
        self.model_path = model_path
        self.movement_templates = self._load_movement_templates()
        self.key_points = self._get_sport_keypoints()
        
    def _load_movement_templates(self) -> Dict[str, Any]:
        """Load sport-specific movement templates for comparison"""
        templates = {
            "baseball": {
                "swing": {
                    "phases": ["stance", "load", "stride", "swing", "contact", "follow_through"],
                    "key_angles": {
                        "bat_angle": {"optimal_range": [15, 35], "critical": True},
                        "hip_shoulder_separation": {"optimal_range": [25, 45], "critical": True},
                        "knee_bend": {"optimal_range": [120, 160], "critical": False}
                    },
                    "timing_windows": {
                        "load_to_stride": {"optimal_ms": [150, 250]},
                        "stride_to_contact": {"optimal_ms": [100, 180]}
                    }
                },
                "pitch": {
                    "phases": ["windup", "leg_lift", "stride", "arm_cocking", "acceleration", "release", "follow_through"],
                    "key_angles": {
                        "arm_slot": {"optimal_range": [85, 95], "critical": True},
                        "stride_length": {"optimal_range": [80, 120], "critical": True},  # % of height
                        "hip_shoulder_timing": {"optimal_range": [0, 50], "critical": True}  # ms hip leads
                    }
                }
            },
            "football": {
                "throwing": {
                    "phases": ["setup", "load", "stride", "release", "follow_through"],
                    "key_angles": {
                        "arm_angle": {"optimal_range": [85, 95], "critical": True},
                        "footwork_timing": {"optimal_range": [0, 25], "critical": False}
                    }
                },
                "cutting": {
                    "phases": ["approach", "plant", "cut", "acceleration"],
                    "key_angles": {
                        "knee_valgus": {"optimal_range": [0, 15], "critical": True},  # injury risk
                        "center_of_mass": {"optimal_range": [-5, 5], "critical": False}
                    }
                }
            },
            "basketball": {
                "shooting": {
                    "phases": ["setup", "dip", "rise", "release", "follow_through"],
                    "key_angles": {
                        "release_angle": {"optimal_range": [45, 55], "critical": True},
                        "elbow_alignment": {"optimal_range": [85, 95], "critical": True}
                    }
                }
            }
        }
        
        return templates.get(self.sport, {})
    
    def _get_sport_keypoints(self) -> List[str]:
        """Get key body points to track for specific sport"""
        keypoint_mapping = {
            "baseball": [
                "nose", "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
                "left_wrist", "right_wrist", "left_hip", "right_hip", "left_knee", 
                "right_knee", "left_ankle", "right_ankle"
            ],
            "football": [
                "nose", "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
                "left_wrist", "right_wrist", "left_hip", "right_hip", "left_knee",
                "right_knee", "left_ankle", "right_ankle"  
            ],
            "basketball": [
                "nose", "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
                "left_wrist", "right_wrist", "left_hip", "right_hip"
            ]
        }
        
        return keypoint_mapping.get(self.sport, keypoint_mapping["baseball"])
    
    def extract_pose_keypoints(self, frame: np.ndarray) -> Dict[str, Any]:
        """
        Extract pose keypoints from video frame
        In production, this would use MediaPipe, OpenPose, or similar
        """
        # Simulated keypoint extraction for development
        height, width = frame.shape[:2]
        
        # Mock keypoints for demonstration (would be real pose detection in production)
        keypoints = {}
        for i, point in enumerate(self.key_points):
            # Generate realistic mock coordinates
            x = int(width * (0.3 + 0.4 * (i % 3) / 2))
            y = int(height * (0.2 + 0.6 * (i // 3) / len(self.key_points)))
            confidence = 0.85 + 0.1 * np.random.random()  # Mock confidence
            
            keypoints[point] = {
                "x": x,
                "y": y, 
                "confidence": confidence,
                "visible": confidence > 0.5
            }
        
        return {
            "timestamp": datetime.now().isoformat(),
            "keypoints": keypoints,
            "frame_dimensions": {"width": width, "height": height}
        }
    
    def calculate_joint_angles(self, keypoints: Dict[str, Any]) -> Dict[str, float]:
        """Calculate key joint angles from keypoints"""
        angles = {}
        kp = keypoints["keypoints"]
        
        def angle_between_points(p1: Dict, p2: Dict, p3: Dict) -> float:
            """Calculate angle at p2 formed by p1-p2-p3"""
            if not all(p["visible"] for p in [p1, p2, p3]):
                return -1  # Invalid angle
            
            # Vector calculations
            v1 = np.array([p1["x"] - p2["x"], p1["y"] - p2["y"]])
            v2 = np.array([p3["x"] - p2["x"], p3["y"] - p2["y"]])
            
            # Calculate angle
            cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
            angle = np.arccos(np.clip(cos_angle, -1, 1)) * 180 / np.pi
            
            return angle
        
        # Calculate sport-specific angles
        if self.sport == "baseball":
            # Elbow angle (important for swing/pitch mechanics)
            if all(k in kp for k in ["left_shoulder", "left_elbow", "left_wrist"]):
                angles["left_elbow"] = angle_between_points(
                    kp["left_shoulder"], kp["left_elbow"], kp["left_wrist"]
                )
            
            if all(k in kp for k in ["right_shoulder", "right_elbow", "right_wrist"]):
                angles["right_elbow"] = angle_between_points(
                    kp["right_shoulder"], kp["right_elbow"], kp["right_wrist"]
                )
            
            # Knee angles (important for power generation)
            if all(k in kp for k in ["left_hip", "left_knee", "left_ankle"]):
                angles["left_knee"] = angle_between_points(
                    kp["left_hip"], kp["left_knee"], kp["left_ankle"]
                )
            
            if all(k in kp for k in ["right_hip", "right_knee", "right_ankle"]):
                angles["right_knee"] = angle_between_points(
                    kp["right_hip"], kp["right_knee"], kp["right_ankle"]
                )
            
            # Torso rotation (hip-shoulder separation)
            if all(k in kp for k in ["left_hip", "right_hip", "left_shoulder", "right_shoulder"]):
                hip_angle = np.arctan2(
                    kp["right_hip"]["y"] - kp["left_hip"]["y"],
                    kp["right_hip"]["x"] - kp["left_hip"]["x"]
                )
                shoulder_angle = np.arctan2(
                    kp["right_shoulder"]["y"] - kp["left_shoulder"]["y"],
                    kp["right_shoulder"]["x"] - kp["left_shoulder"]["x"]
                )
                angles["hip_shoulder_separation"] = abs(hip_angle - shoulder_angle) * 180 / np.pi
        
        return angles
    
    def analyze_movement_phase(self, keypoints_sequence: List[Dict], movement_type: str) -> Dict[str, Any]:
        """Analyze a complete movement sequence"""
        if movement_type not in self.movement_templates:
            return {"error": f"Unknown movement type: {movement_type}"}
        
        template = self.movement_templates[movement_type]
        analysis = {
            "movement_type": movement_type,
            "sport": self.sport,
            "frame_count": len(keypoints_sequence),
            "duration_ms": len(keypoints_sequence) * 33.33,  # Assuming 30fps
            "phases": {},
            "efficiency_score": 0,
            "technical_score": 0,
            "recommendations": []
        }
        
        # Analyze each frame
        frame_analyses = []
        for i, frame_keypoints in enumerate(keypoints_sequence):
            angles = self.calculate_joint_angles(frame_keypoints)
            frame_analysis = {
                "frame": i,
                "timestamp": frame_keypoints.get("timestamp"),
                "angles": angles,
                "phase": self._identify_movement_phase(angles, template, i, len(keypoints_sequence))
            }
            frame_analyses.append(frame_analysis)
        
        # Calculate overall scores
        analysis["efficiency_score"] = self._calculate_efficiency_score(frame_analyses, template)
        analysis["technical_score"] = self._calculate_technical_score(frame_analyses, template)
        analysis["recommendations"] = self._generate_recommendations(frame_analyses, template)
        
        return analysis
    
    def _identify_movement_phase(self, angles: Dict[str, float], template: Dict, 
                                frame_idx: int, total_frames: int) -> str:
        """Identify which phase of movement this frame represents"""
        phases = template.get("phases", [])
        if not phases:
            return "unknown"
        
        # Simple time-based phase identification (would be more sophisticated in production)
        phase_duration = total_frames / len(phases)
        phase_idx = min(int(frame_idx / phase_duration), len(phases) - 1)
        
        return phases[phase_idx]
    
    def _calculate_efficiency_score(self, frame_analyses: List[Dict], template: Dict) -> float:
        """Calculate movement efficiency score (0-100)"""
        if not frame_analyses:
            return 0
        
        total_score = 0
        scored_frames = 0
        
        for frame in frame_analyses:
            angles = frame.get("angles", {})
            frame_score = 0
            angle_count = 0
            
            # Compare angles to optimal ranges
            for angle_name, angle_value in angles.items():
                if angle_value < 0:  # Invalid angle
                    continue
                    
                # Find optimal range for this angle
                template_angles = template.get("key_angles", {})
                if angle_name in template_angles:
                    optimal_range = template_angles[angle_name]["optimal_range"]
                    
                    if optimal_range[0] <= angle_value <= optimal_range[1]:
                        frame_score += 100  # Perfect
                    else:
                        # Score based on distance from optimal range
                        distance = min(
                            abs(angle_value - optimal_range[0]),
                            abs(angle_value - optimal_range[1])
                        )
                        frame_score += max(0, 100 - distance * 2)
                    
                    angle_count += 1
            
            if angle_count > 0:
                total_score += frame_score / angle_count
                scored_frames += 1
        
        return round(total_score / scored_frames if scored_frames > 0 else 0, 1)
    
    def _calculate_technical_score(self, frame_analyses: List[Dict], template: Dict) -> float:
        """Calculate technical execution score (0-100)"""
        # Focus on critical angles and timing
        critical_score = 0
        critical_count = 0
        
        for frame in frame_analyses:
            angles = frame.get("angles", {})
            
            # Check critical angles
            template_angles = template.get("key_angles", {})
            for angle_name, config in template_angles.items():
                if not config.get("critical", False):
                    continue
                    
                if angle_name in angles and angles[angle_name] >= 0:
                    optimal_range = config["optimal_range"]
                    angle_value = angles[angle_name]
                    
                    if optimal_range[0] <= angle_value <= optimal_range[1]:
                        critical_score += 100
                    else:
                        # Harsh penalty for critical angles outside range
                        distance = min(
                            abs(angle_value - optimal_range[0]),
                            abs(angle_value - optimal_range[1])
                        )
                        critical_score += max(0, 100 - distance * 5)
                    
                    critical_count += 1
        
        return round(critical_score / critical_count if critical_count > 0 else 50, 1)
    
    def _generate_recommendations(self, frame_analyses: List[Dict], template: Dict) -> List[str]:
        """Generate specific coaching recommendations"""
        recommendations = []
        
        # Analyze common issues
        angle_issues = {}
        template_angles = template.get("key_angles", {})
        
        for frame in frame_analyses:
            angles = frame.get("angles", {})
            
            for angle_name, angle_value in angles.items():
                if angle_value < 0 or angle_name not in template_angles:
                    continue
                
                optimal_range = template_angles[angle_name]["optimal_range"]
                
                if angle_value < optimal_range[0]:
                    angle_issues.setdefault(angle_name, {"too_low": 0, "too_high": 0})
                    angle_issues[angle_name]["too_low"] += 1
                elif angle_value > optimal_range[1]:
                    angle_issues.setdefault(angle_name, {"too_low": 0, "too_high": 0})
                    angle_issues[angle_name]["too_high"] += 1
        
        # Generate specific recommendations
        total_frames = len(frame_analyses)
        
        for angle_name, issues in angle_issues.items():
            if issues["too_low"] > total_frames * 0.3:
                if "elbow" in angle_name:
                    recommendations.append(f"Increase {angle_name} angle - focus on arm extension")
                elif "knee" in angle_name:
                    recommendations.append(f"Deepen {angle_name} bend for more power generation")
            
            if issues["too_high"] > total_frames * 0.3:
                if "elbow" in angle_name:
                    recommendations.append(f"Reduce {angle_name} angle - avoid over-extension")
                elif "knee" in angle_name:
                    recommendations.append(f"Maintain {angle_name} stability - avoid collapse")
        
        # Sport-specific recommendations
        if self.sport == "baseball":
            if "hip_shoulder_separation" in angle_issues:
                recommendations.append("Work on hip-shoulder separation timing for increased power")
        
        return recommendations[:5]  # Top 5 recommendations
    
    def analyze_video_file(self, video_path: str, movement_type: str) -> Dict[str, Any]:
        """Analyze a complete video file"""
        if not os.path.exists(video_path):
            return {"error": f"Video file not found: {video_path}"}
        
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return {"error": f"Could not open video: {video_path}"}
        
        keypoints_sequence = []
        frame_count = 0
        
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Extract keypoints from frame
                frame_keypoints = self.extract_pose_keypoints(frame)
                keypoints_sequence.append(frame_keypoints)
                
                frame_count += 1
                
                # Limit analysis to prevent memory issues
                if frame_count > 300:  # ~10 seconds at 30fps
                    break
                    
        finally:
            cap.release()
        
        if not keypoints_sequence:
            return {"error": "No frames processed"}
        
        # Analyze movement
        analysis = self.analyze_movement_phase(keypoints_sequence, movement_type)
        analysis["video_info"] = {
            "path": video_path,
            "frames_analyzed": len(keypoints_sequence),
            "duration_estimate_ms": len(keypoints_sequence) * 33.33
        }
        
        return analysis


# Example usage and testing
def main():
    """Test the biomechanical analyzer"""
    analyzer = BiomechanicalAnalyzer(sport="baseball")
    
    # Create mock video frame for testing
    mock_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    
    # Test keypoint extraction
    keypoints = analyzer.extract_pose_keypoints(mock_frame)
    print("📊 BIOMECHANICAL ANALYSIS TEST")
    print("="*40)
    print(f"Keypoints extracted: {len(keypoints['keypoints'])}")
    
    # Test angle calculation
    angles = analyzer.calculate_joint_angles(keypoints)
    print(f"Angles calculated: {len(angles)}")
    
    # Test movement analysis with sequence
    sequence = [keypoints] * 30  # Mock 1-second sequence
    analysis = analyzer.analyze_movement_phase(sequence, "swing")
    
    print(f"\nMovement Analysis Results:")
    print(f"  Efficiency Score: {analysis['efficiency_score']}")
    print(f"  Technical Score: {analysis['technical_score']}")
    print(f"  Recommendations: {len(analysis['recommendations'])}")
    
    for rec in analysis['recommendations']:
        print(f"    • {rec}")


if __name__ == "__main__":
    main()
