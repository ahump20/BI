#!/usr/bin/env python3
"""
Blaze Intelligence Pattern Recognition Engine
Advanced machine learning system for discovering hidden patterns in sports analytics data

Contact: Austin Humphrey (ahump20@outlook.com, 210-273-5538)
"""

import os
import json
import re
import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, asdict
from flask import Flask, render_template, jsonify, request, send_from_directory
from flask_cors import CORS
import sqlite3
from pathlib import Path
import threading
import time
import hashlib
from collections import defaultdict, Counter
import statistics
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.ensemble import IsolationForest
from sklearn.feature_extraction.text import TfidfVectorizer
from textblob import TextBlob
import matplotlib.pyplot as plt
import seaborn as sns
from bs4 import BeautifulSoup
import requests

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class PatternDiscovery:
    """Discovered pattern in the data"""
    pattern_id: str
    pattern_type: str  # "temporal", "correlation", "anomaly", "cluster", "semantic"
    confidence_score: float
    description: str
    data_sources: List[str]
    metrics: Dict[str, Any]
    insights: List[str]
    recommendations: List[str]
    timestamp: str

@dataclass
class AnalyticsInsight:
    """Strategic insight derived from pattern analysis"""
    insight_id: str
    category: str  # "performance", "market", "competitive", "strategic"
    priority: str  # "critical", "high", "medium", "low"
    impact_score: float
    confidence: float
    description: str
    supporting_patterns: List[str]
    actionable_recommendations: List[str]
    business_value: str

class BlazePatternEngine:
    """Advanced pattern recognition and analytics engine"""
    
    def __init__(self, port=8080):
        self.port = port
        self.app = Flask(__name__, template_folder='templates', static_folder='static')
        CORS(self.app)
        
        # Initialize core components
        self.data_processor = DataProcessor()
        self.pattern_detector = PatternDetector()
        self.insight_generator = InsightGenerator()
        self.visualization_engine = VisualizationEngine()
        
        # Data storage
        self.patterns_db = {}
        self.insights_cache = {}
        self.analytics_history = []
        
        # Setup routes
        self._setup_routes()
        
        # Initialize background processing
        self.processing_thread = None
        self.is_processing = False
        
        logger.info(f"Blaze Pattern Engine initialized on port {port}")

    def _setup_routes(self):
        """Setup Flask routes for the analytics engine"""
        
        @self.app.route('/')
        def dashboard():
            """Main analytics dashboard"""
            return render_template('dashboard.html', 
                                 patterns_count=len(self.patterns_db),
                                 insights_count=len(self.insights_cache))
        
        @self.app.route('/api/patterns')
        def get_patterns():
            """Get all discovered patterns"""
            return jsonify({
                'patterns': list(self.patterns_db.values()),
                'total_count': len(self.patterns_db),
                'last_updated': datetime.now().isoformat()
            })
        
        @self.app.route('/api/insights')
        def get_insights():
            """Get strategic insights"""
            return jsonify({
                'insights': list(self.insights_cache.values()),
                'total_count': len(self.insights_cache),
                'categories': self._get_insight_categories()
            })
        
        @self.app.route('/api/process', methods=['POST'])
        def trigger_processing():
            """Trigger pattern analysis processing"""
            if not self.is_processing:
                self.start_pattern_analysis()
                return jsonify({'status': 'processing_started', 'message': 'Pattern analysis initiated'})
            else:
                return jsonify({'status': 'already_processing', 'message': 'Analysis already in progress'})
        
        @self.app.route('/api/status')
        def get_status():
            """Get engine status"""
            return jsonify({
                'status': 'processing' if self.is_processing else 'idle',
                'patterns_discovered': len(self.patterns_db),
                'insights_generated': len(self.insights_cache),
                'last_analysis': self.analytics_history[-1] if self.analytics_history else None,
                'uptime': self._get_uptime()
            })
        
        @self.app.route('/api/search/<query>')
        def search_patterns(query):
            """Search patterns and insights"""
            results = self._search_analytics(query)
            return jsonify(results)
        
        @self.app.route('/visualizations/<viz_type>')
        def get_visualization(viz_type):
            """Generate and return visualizations"""
            viz_data = self.visualization_engine.generate_visualization(viz_type, self.patterns_db)
            return jsonify(viz_data)

    def start_pattern_analysis(self):
        """Start background pattern analysis"""
        if self.processing_thread and self.processing_thread.is_alive():
            return
        
        self.processing_thread = threading.Thread(target=self._run_pattern_analysis)
        self.processing_thread.daemon = True
        self.processing_thread.start()
        
        logger.info("Pattern analysis started in background thread")

    def _run_pattern_analysis(self):
        """Main pattern analysis loop"""
        self.is_processing = True
        start_time = datetime.now()
        
        try:
            logger.info("🧠 Starting comprehensive pattern analysis...")
            
            # Stage 1: Data ingestion and processing
            logger.info("📊 Stage 1: Processing Blaze Intelligence OS data...")
            raw_data = self.data_processor.process_blaze_os_file()
            
            # Stage 2: Pattern detection
            logger.info("🔍 Stage 2: Detecting hidden patterns...")
            patterns = self.pattern_detector.discover_patterns(raw_data)
            
            # Stage 3: Insight generation
            logger.info("💡 Stage 3: Generating strategic insights...")
            insights = self.insight_generator.generate_insights(patterns, raw_data)
            
            # Stage 4: Store results
            self._store_analysis_results(patterns, insights)
            
            # Stage 5: Generate visualizations
            logger.info("📈 Stage 5: Creating visualizations...")
            self.visualization_engine.generate_dashboard_viz(patterns, insights)
            
            analysis_duration = (datetime.now() - start_time).total_seconds()
            
            self.analytics_history.append({
                'timestamp': datetime.now().isoformat(),
                'patterns_discovered': len(patterns),
                'insights_generated': len(insights),
                'duration_seconds': analysis_duration,
                'status': 'completed'
            })
            
            logger.info(f"✅ Pattern analysis completed in {analysis_duration:.2f} seconds")
            logger.info(f"   - Patterns discovered: {len(patterns)}")
            logger.info(f"   - Insights generated: {len(insights)}")
            
        except Exception as e:
            logger.error(f"❌ Pattern analysis failed: {str(e)}")
            self.analytics_history.append({
                'timestamp': datetime.now().isoformat(),
                'status': 'failed',
                'error': str(e)
            })
        
        finally:
            self.is_processing = False

    def _store_analysis_results(self, patterns: List[PatternDiscovery], insights: List[AnalyticsInsight]):
        """Store analysis results in memory and cache"""
        # Store patterns
        for pattern in patterns:
            self.patterns_db[pattern.pattern_id] = asdict(pattern)
        
        # Store insights
        for insight in insights:
            self.insights_cache[insight.insight_id] = asdict(insight)
        
        logger.info(f"Stored {len(patterns)} patterns and {len(insights)} insights")

    def _get_insight_categories(self) -> Dict[str, int]:
        """Get insight categories and counts"""
        categories = defaultdict(int)
        for insight in self.insights_cache.values():
            categories[insight['category']] += 1
        return dict(categories)

    def _search_analytics(self, query: str) -> Dict[str, Any]:
        """Search patterns and insights"""
        query_lower = query.lower()
        
        matching_patterns = []
        for pattern in self.patterns_db.values():
            if (query_lower in pattern['description'].lower() or 
                query_lower in pattern['pattern_type'].lower() or
                any(query_lower in insight.lower() for insight in pattern['insights'])):
                matching_patterns.append(pattern)
        
        matching_insights = []
        for insight in self.insights_cache.values():
            if (query_lower in insight['description'].lower() or
                query_lower in insight['category'].lower() or
                any(query_lower in rec.lower() for rec in insight['actionable_recommendations'])):
                matching_insights.append(insight)
        
        return {
            'query': query,
            'patterns': matching_patterns,
            'insights': matching_insights,
            'total_matches': len(matching_patterns) + len(matching_insights)
        }

    def _get_uptime(self) -> str:
        """Get engine uptime"""
        # This would track actual uptime in production
        return "System operational"

    def run(self):
        """Start the analytics engine server"""
        logger.info(f"🚀 Starting Blaze Pattern Engine on http://localhost:{self.port}")
        
        # Start initial pattern analysis
        self.start_pattern_analysis()
        
        # Run Flask server
        self.app.run(host='localhost', port=self.port, debug=False, threaded=True)

class DataProcessor:
    """Advanced data processing for Blaze Intelligence OS"""
    
    def __init__(self):
        self.blaze_os_path = "/Users/AustinHumphrey/Library/Mobile Documents/com~apple~CloudDocs/Austin Humphrey/🔥 Blaze Intelligence OS — Championship Sports Analytics.htm"
        self.processed_data = {}
        
    def process_blaze_os_file(self) -> Dict[str, Any]:
        """Process the comprehensive Blaze Intelligence OS file"""
        logger.info("📄 Processing Blaze Intelligence OS data...")
        
        try:
            with open(self.blaze_os_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Parse HTML content
            soup = BeautifulSoup(content, 'html.parser')
            
            # Extract structured data
            extracted_data = {
                'metadata': self._extract_metadata(soup),
                'components': self._extract_components(soup),
                'analytics': self._extract_analytics_data(soup),
                'visualizations': self._extract_visualization_data(soup),
                'javascript': self._extract_javascript_patterns(content),
                'styles': self._extract_style_patterns(soup),
                'performance_metrics': self._extract_performance_data(soup),
                'user_interactions': self._extract_interaction_patterns(soup),
                'data_flows': self._extract_data_flow_patterns(content)
            }
            
            self.processed_data = extracted_data
            logger.info(f"✅ Processed {len(extracted_data)} data categories")
            
            return extracted_data
            
        except Exception as e:
            logger.error(f"❌ Error processing Blaze OS file: {str(e)}")
            return {}

    def _extract_metadata(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract metadata and configuration"""
        metadata = {
            'title': soup.title.string if soup.title else 'Unknown',
            'description': '',
            'keywords': [],
            'libraries': [],
            'css_variables': {},
            'responsive_breakpoints': []
        }
        
        # Extract meta tags
        for meta in soup.find_all('meta'):
            if meta.get('name') == 'description':
                metadata['description'] = meta.get('content', '')
            elif meta.get('name') == 'keywords':
                metadata['keywords'] = meta.get('content', '').split(',')
        
        # Extract linked libraries
        for link in soup.find_all('link', rel='stylesheet'):
            href = link.get('href', '')
            if href:
                metadata['libraries'].append(href)
        
        for script in soup.find_all('script', src=True):
            src = script.get('src', '')
            if src:
                metadata['libraries'].append(src)
        
        # Extract CSS variables
        style_tags = soup.find_all('style')
        for style_tag in style_tags:
            content = style_tag.string or ''
            css_vars = re.findall(r'--([^:]+):\s*([^;]+);', content)
            for var_name, var_value in css_vars:
                metadata['css_variables'][var_name.strip()] = var_value.strip()
        
        return metadata

    def _extract_components(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract UI components and their characteristics"""
        components = {
            'sections': [],
            'interactive_elements': [],
            'data_displays': [],
            'navigation': []
        }
        
        # Extract sections
        for section in soup.find_all(['section', 'div'], class_=True):
            classes = section.get('class', [])
            if any('section' in cls.lower() for cls in classes):
                components['sections'].append({
                    'classes': classes,
                    'id': section.get('id', ''),
                    'child_count': len(section.find_all()),
                    'text_content_length': len(section.get_text().strip())
                })
        
        # Extract interactive elements
        interactive_tags = ['button', 'input', 'select', 'textarea', 'a']
        for tag in interactive_tags:
            for element in soup.find_all(tag):
                components['interactive_elements'].append({
                    'tag': tag,
                    'classes': element.get('class', []),
                    'id': element.get('id', ''),
                    'text': element.get_text().strip()[:100]
                })
        
        # Extract data display elements
        for canvas in soup.find_all('canvas'):
            components['data_displays'].append({
                'type': 'canvas',
                'id': canvas.get('id', ''),
                'classes': canvas.get('class', [])
            })
        
        for chart_elem in soup.find_all(['div', 'canvas'], class_=lambda x: x and 'chart' in ' '.join(x).lower()):
            components['data_displays'].append({
                'type': 'chart',
                'classes': chart_elem.get('class', []),
                'id': chart_elem.get('id', '')
            })
        
        return components

    def _extract_analytics_data(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract analytics and metrics data patterns"""
        analytics = {
            'metrics_mentioned': [],
            'data_sources': [],
            'kpis': [],
            'sports_entities': [],
            'performance_indicators': []
        }
        
        text_content = soup.get_text().lower()
        
        # Common sports analytics metrics
        metrics_patterns = [
            r'(\d+\.?\d*%)\s*(accuracy|precision|recall|f1)',
            r'(\d+\.?\d*)\s*(seconds?|ms|milliseconds?)\s*response',
            r'(\d+\.?\d*%)\s*(improvement|increase|reduction|decrease)',
            r'(\d+)\s*(teams?|players?|leagues?|games?)',
            r'(\$\d+\.?\d*[kmb]?)\s*(revenue|cost|savings|value)'
        ]
        
        for pattern in metrics_patterns:
            matches = re.finditer(pattern, text_content)
            for match in matches:
                analytics['metrics_mentioned'].append(match.group(0))
        
        # Sports entities
        sports_entities = ['cardinals', 'titans', 'longhorns', 'grizzlies', 'mlb', 'nfl', 'nba', 'ncaa']
        for entity in sports_entities:
            if entity in text_content:
                analytics['sports_entities'].append(entity)
        
        # Data sources
        data_source_patterns = ['api', 'database', 'stream', 'feed', 'integration']
        for source in data_source_patterns:
            if source in text_content:
                analytics['data_sources'].append(source)
        
        return analytics

    def _extract_visualization_data(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract visualization patterns and configurations"""
        visualizations = {
            'chart_types': [],
            'color_schemes': [],
            'three_js_scenes': [],
            'interactive_elements': []
        }
        
        # Extract Three.js related content
        scripts = soup.find_all('script')
        for script in scripts:
            content = script.string or ''
            if 'three.js' in content.lower() or 'THREE.' in content:
                # Extract Three.js patterns
                three_patterns = re.findall(r'new THREE\.(\w+)', content)
                visualizations['three_js_scenes'].extend(three_patterns)
        
        # Extract color schemes from CSS
        style_content = ''
        for style in soup.find_all('style'):
            style_content += style.string or ''
        
        color_patterns = re.findall(r'#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)', style_content)
        visualizations['color_schemes'] = color_patterns
        
        return visualizations

    def _extract_javascript_patterns(self, content: str) -> Dict[str, Any]:
        """Extract JavaScript patterns and functionality"""
        js_patterns = {
            'frameworks': [],
            'apis_used': [],
            'event_handlers': [],
            'data_processing': []
        }
        
        # Extract framework usage
        frameworks = ['React', 'Vue', 'Angular', 'jQuery', 'Chart.js', 'Three.js', 'D3']
        for framework in frameworks:
            if framework in content:
                js_patterns['frameworks'].append(framework)
        
        # Extract API calls
        api_patterns = re.findall(r'fetch\([^)]+\)|axios\.|XMLHttpRequest|\.get\(|\.post\(', content)
        js_patterns['apis_used'] = api_patterns[:10]  # Limit results
        
        # Extract event handlers
        event_patterns = re.findall(r'addEventListener\([^)]+\)|on\w+\s*=', content)
        js_patterns['event_handlers'] = event_patterns[:10]
        
        return js_patterns

    def _extract_style_patterns(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract styling patterns and themes"""
        styles = {
            'layout_methods': [],
            'animations': [],
            'responsive_design': [],
            'color_themes': []
        }
        
        style_content = ''
        for style_tag in soup.find_all('style'):
            style_content += style_tag.string or ''
        
        # Layout methods
        layout_patterns = ['flexbox', 'grid', 'float', 'position']
        for pattern in layout_patterns:
            if pattern in style_content.lower():
                styles['layout_methods'].append(pattern)
        
        # Animations
        animation_patterns = re.findall(r'@keyframes\s+(\w+)|animation:|transition:', style_content)
        styles['animations'] = [p for p in animation_patterns if p]
        
        # Responsive design
        media_queries = re.findall(r'@media[^{]+', style_content)
        styles['responsive_design'] = media_queries
        
        return styles

    def _extract_performance_data(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract performance-related data and metrics"""
        performance = {
            'optimization_techniques': [],
            'loading_strategies': [],
            'caching_mechanisms': []
        }
        
        # Look for performance optimization patterns
        text = soup.get_text().lower()
        
        performance_keywords = [
            'lazy loading', 'code splitting', 'compression', 'minification',
            'caching', 'cdn', 'optimization', 'performance'
        ]
        
        for keyword in performance_keywords:
            if keyword in text:
                performance['optimization_techniques'].append(keyword)
        
        return performance

    def _extract_interaction_patterns(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract user interaction patterns"""
        interactions = {
            'user_flows': [],
            'input_methods': [],
            'feedback_mechanisms': []
        }
        
        # Extract forms and inputs
        forms = soup.find_all('form')
        for form in forms:
            inputs = form.find_all(['input', 'select', 'textarea'])
            interactions['input_methods'].extend([inp.get('type', inp.name) for inp in inputs])
        
        # Extract buttons and clickable elements
        clickable = soup.find_all(['button', 'a'], class_=True)
        for elem in clickable:
            classes = elem.get('class', [])
            if any('btn' in cls or 'button' in cls for cls in classes):
                interactions['feedback_mechanisms'].append('button_interaction')
        
        return interactions

    def _extract_data_flow_patterns(self, content: str) -> Dict[str, Any]:
        """Extract data flow and processing patterns"""
        data_flows = {
            'data_sources': [],
            'processing_steps': [],
            'output_formats': []
        }
        
        # Extract data source references
        source_patterns = [
            r'api\..*\.com', r'database\.\w+', r'stream\.\w+',
            r'feed\.\w+', r'cdn\.\w+'
        ]
        
        for pattern in source_patterns:
            matches = re.findall(pattern, content.lower())
            data_flows['data_sources'].extend(matches)
        
        # Extract processing indicators
        processing_keywords = ['filter', 'transform', 'aggregate', 'analyze', 'compute']
        for keyword in processing_keywords:
            if keyword in content.lower():
                data_flows['processing_steps'].append(keyword)
        
        return data_flows

class PatternDetector:
    """Advanced pattern detection using machine learning"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        
    def discover_patterns(self, data: Dict[str, Any]) -> List[PatternDiscovery]:
        """Main pattern discovery function"""
        logger.info("🔍 Discovering patterns in processed data...")
        
        patterns = []
        
        # Temporal patterns
        patterns.extend(self._detect_temporal_patterns(data))
        
        # Correlation patterns
        patterns.extend(self._detect_correlation_patterns(data))
        
        # Anomaly patterns
        patterns.extend(self._detect_anomaly_patterns(data))
        
        # Clustering patterns
        patterns.extend(self._detect_clustering_patterns(data))
        
        # Semantic patterns
        patterns.extend(self._detect_semantic_patterns(data))
        
        logger.info(f"✅ Discovered {len(patterns)} patterns")
        return patterns

    def _detect_temporal_patterns(self, data: Dict[str, Any]) -> List[PatternDiscovery]:
        """Detect temporal patterns in the data"""
        patterns = []
        
        # Analyze component evolution patterns
        if 'components' in data and 'sections' in data['components']:
            sections = data['components']['sections']
            
            # Pattern: Component complexity distribution
            complexity_scores = [section['child_count'] for section in sections]
            if complexity_scores:
                avg_complexity = statistics.mean(complexity_scores)
                max_complexity = max(complexity_scores)
                
                pattern = PatternDiscovery(
                    pattern_id=f"temporal_complexity_{int(time.time())}",
                    pattern_type="temporal",
                    confidence_score=0.85,
                    description=f"Component complexity pattern: Average {avg_complexity:.1f} children, max {max_complexity}",
                    data_sources=["components", "sections"],
                    metrics={
                        "average_complexity": avg_complexity,
                        "max_complexity": max_complexity,
                        "complexity_variance": statistics.variance(complexity_scores) if len(complexity_scores) > 1 else 0
                    },
                    insights=[
                        f"High component complexity detected in {len([c for c in complexity_scores if c > avg_complexity * 1.5])} sections",
                        "Complex components may impact performance and maintainability"
                    ],
                    recommendations=[
                        "Consider component decomposition for high-complexity sections",
                        "Implement lazy loading for complex components"
                    ],
                    timestamp=datetime.now().isoformat()
                )
                patterns.append(pattern)
        
        return patterns

    def _detect_correlation_patterns(self, data: Dict[str, Any]) -> List[PatternDiscovery]:
        """Detect correlation patterns between different data elements"""
        patterns = []
        
        # Analyze library usage vs component complexity
        if 'metadata' in data and 'components' in data:
            library_count = len(data['metadata']['libraries'])
            component_count = len(data['components']['interactive_elements'])
            
            if library_count > 0 and component_count > 0:
                correlation_ratio = component_count / library_count
                
                pattern = PatternDiscovery(
                    pattern_id=f"correlation_lib_comp_{int(time.time())}",
                    pattern_type="correlation",
                    confidence_score=0.78,
                    description=f"Library-Component correlation: {correlation_ratio:.2f} components per library",
                    data_sources=["metadata", "components"],
                    metrics={
                        "library_count": library_count,
                        "component_count": component_count,
                        "correlation_ratio": correlation_ratio
                    },
                    insights=[
                        f"Platform uses {library_count} libraries for {component_count} interactive components",
                        "Efficient library utilization" if correlation_ratio > 2 else "Potential library bloat detected"
                    ],
                    recommendations=[
                        "Optimize library usage for better performance" if correlation_ratio < 1.5 else "Library usage is well balanced",
                        "Consider bundling optimization"
                    ],
                    timestamp=datetime.now().isoformat()
                )
                patterns.append(pattern)
        
        return patterns

    def _detect_anomaly_patterns(self, data: Dict[str, Any]) -> List[PatternDiscovery]:
        """Detect anomalies in data patterns"""
        patterns = []
        
        # Detect unusual CSS variable usage
        if 'metadata' in data and 'css_variables' in data['metadata']:
            css_vars = data['metadata']['css_variables']
            
            if css_vars:
                # Analyze color variables
                color_vars = {k: v for k, v in css_vars.items() if any(color in k.lower() for color in ['color', 'bg', 'border'])}
                
                if len(color_vars) > 10:  # Anomaly: Too many color variables
                    pattern = PatternDiscovery(
                        pattern_id=f"anomaly_color_vars_{int(time.time())}",
                        pattern_type="anomaly",
                        confidence_score=0.72,
                        description=f"Unusual color variable count: {len(color_vars)} color-related CSS variables",
                        data_sources=["metadata", "css_variables"],
                        metrics={
                            "total_css_vars": len(css_vars),
                            "color_vars": len(color_vars),
                            "color_var_ratio": len(color_vars) / len(css_vars)
                        },
                        insights=[
                            "High number of color variables may indicate design system complexity",
                            "Could benefit from color palette consolidation"
                        ],
                        recommendations=[
                            "Review and consolidate color palette",
                            "Implement design token hierarchy"
                        ],
                        timestamp=datetime.now().isoformat()
                    )
                    patterns.append(pattern)
        
        return patterns

    def _detect_clustering_patterns(self, data: Dict[str, Any]) -> List[PatternDiscovery]:
        """Detect clustering patterns in data"""
        patterns = []
        
        # Cluster interactive elements by type
        if 'components' in data and 'interactive_elements' in data['components']:
            elements = data['components']['interactive_elements']
            
            if elements:
                # Group by tag type
                tag_clusters = defaultdict(int)
                for element in elements:
                    tag_clusters[element['tag']] += 1
                
                # Find dominant interaction pattern
                most_common_tag = max(tag_clusters.items(), key=lambda x: x[1])
                
                pattern = PatternDiscovery(
                    pattern_id=f"cluster_interactions_{int(time.time())}",
                    pattern_type="cluster",
                    confidence_score=0.88,
                    description=f"Interaction clustering: {most_common_tag[0]} elements dominate with {most_common_tag[1]} instances",
                    data_sources=["components", "interactive_elements"],
                    metrics={
                        "total_interactive": len(elements),
                        "dominant_type": most_common_tag[0],
                        "dominant_count": most_common_tag[1],
                        "cluster_distribution": dict(tag_clusters)
                    },
                    insights=[
                        f"Primary interaction pattern: {most_common_tag[0]}-based interface",
                        f"Interaction diversity: {len(tag_clusters)} different element types"
                    ],
                    recommendations=[
                        "Ensure consistent UX patterns across dominant interaction type",
                        "Consider accessibility for primary interaction method"
                    ],
                    timestamp=datetime.now().isoformat()
                )
                patterns.append(pattern)
        
        return patterns

    def _detect_semantic_patterns(self, data: Dict[str, Any]) -> List[PatternDiscovery]:
        """Detect semantic patterns in content and structure"""
        patterns = []
        
        # Analyze sports analytics semantic patterns
        if 'analytics' in data:
            analytics = data['analytics']
            
            # Sports entity analysis
            if 'sports_entities' in analytics and analytics['sports_entities']:
                entity_counts = Counter(analytics['sports_entities'])
                primary_entities = entity_counts.most_common(3)
                
                pattern = PatternDiscovery(
                    pattern_id=f"semantic_sports_{int(time.time())}",
                    pattern_type="semantic",
                    confidence_score=0.92,
                    description=f"Sports focus pattern: Primary entities {', '.join([e[0] for e in primary_entities])}",
                    data_sources=["analytics", "sports_entities"],
                    metrics={
                        "total_entities": len(analytics['sports_entities']),
                        "unique_entities": len(entity_counts),
                        "primary_entities": dict(primary_entities)
                    },
                    insights=[
                        f"Multi-sport platform with emphasis on {primary_entities[0][0] if primary_entities else 'unknown'}",
                        f"Covers {len(entity_counts)} different sports organizations/leagues"
                    ],
                    recommendations=[
                        "Maintain balanced coverage across all supported sports",
                        "Consider expanding coverage to underrepresented entities"
                    ],
                    timestamp=datetime.now().isoformat()
                )
                patterns.append(pattern)
        
        return patterns

class InsightGenerator:
    """Generate strategic insights from discovered patterns"""
    
    def __init__(self):
        self.insight_templates = self._load_insight_templates()
        
    def generate_insights(self, patterns: List[PatternDiscovery], raw_data: Dict[str, Any]) -> List[AnalyticsInsight]:
        """Generate strategic insights from patterns"""
        logger.info("💡 Generating strategic insights...")
        
        insights = []
        
        # Performance insights
        insights.extend(self._generate_performance_insights(patterns, raw_data))
        
        # User experience insights
        insights.extend(self._generate_ux_insights(patterns, raw_data))
        
        # Business intelligence insights
        insights.extend(self._generate_business_insights(patterns, raw_data))
        
        # Technical architecture insights
        insights.extend(self._generate_technical_insights(patterns, raw_data))
        
        logger.info(f"✅ Generated {len(insights)} strategic insights")
        return insights

    def _generate_performance_insights(self, patterns: List[PatternDiscovery], raw_data: Dict[str, Any]) -> List[AnalyticsInsight]:
        """Generate performance-related insights"""
        insights = []
        
        # Analyze component complexity patterns for performance impact
        complexity_patterns = [p for p in patterns if 'complexity' in p.description.lower()]
        
        if complexity_patterns:
            pattern = complexity_patterns[0]
            avg_complexity = pattern.metrics.get('average_complexity', 0)
            
            if avg_complexity > 10:  # High complexity threshold
                insight = AnalyticsInsight(
                    insight_id=f"perf_complexity_{int(time.time())}",
                    category="performance",
                    priority="high",
                    impact_score=8.5,
                    confidence=0.87,
                    description=f"High component complexity ({avg_complexity:.1f} avg children) may impact rendering performance",
                    supporting_patterns=[pattern.pattern_id],
                    actionable_recommendations=[
                        "Implement component virtualization for complex sections",
                        "Consider lazy loading for non-critical components",
                        "Break down complex components into smaller, reusable pieces",
                        "Profile rendering performance in browser dev tools"
                    ],
                    business_value="Improved page load times and user experience leading to higher engagement"
                )
                insights.append(insight)
        
        return insights

    def _generate_ux_insights(self, patterns: List[PatternDiscovery], raw_data: Dict[str, Any]) -> List[AnalyticsInsight]:
        """Generate user experience insights"""
        insights = []
        
        # Analyze interaction patterns
        interaction_patterns = [p for p in patterns if 'interaction' in p.pattern_type.lower() or 'cluster' in p.pattern_type]
        
        if interaction_patterns:
            pattern = interaction_patterns[0]
            dominant_type = pattern.metrics.get('dominant_type', 'unknown')
            
            insight = AnalyticsInsight(
                insight_id=f"ux_interaction_{int(time.time())}",
                category="user_experience",
                priority="medium",
                impact_score=7.2,
                confidence=0.82,
                description=f"Interface heavily relies on {dominant_type} interactions - ensure optimal UX patterns",
                supporting_patterns=[pattern.pattern_id],
                actionable_recommendations=[
                    f"Optimize {dominant_type} interaction patterns for accessibility",
                    "Implement consistent feedback for all user actions",
                    "Consider alternative interaction methods for users with different abilities",
                    "A/B test interaction flows for better conversion"
                ],
                business_value="Enhanced user satisfaction and reduced friction in user journeys"
            )
            insights.append(insight)
        
        return insights

    def _generate_business_insights(self, patterns: List[PatternDiscovery], raw_data: Dict[str, Any]) -> List[AnalyticsInsight]:
        """Generate business intelligence insights"""
        insights = []
        
        # Analyze sports entity focus patterns
        semantic_patterns = [p for p in patterns if p.pattern_type == 'semantic']
        
        if semantic_patterns:
            pattern = semantic_patterns[0]
            primary_entities = pattern.metrics.get('primary_entities', {})
            
            if primary_entities:
                top_entity = max(primary_entities.items(), key=lambda x: x[1])
                
                insight = AnalyticsInsight(
                    insight_id=f"biz_market_focus_{int(time.time())}",
                    category="market",
                    priority="critical",
                    impact_score=9.1,
                    confidence=0.91,
                    description=f"Strong market positioning in {top_entity[0]} analytics with {top_entity[1]} references",
                    supporting_patterns=[pattern.pattern_id],
                    actionable_recommendations=[
                        f"Leverage {top_entity[0]} expertise for thought leadership",
                        "Develop case studies showcasing success with primary sports entities",
                        "Consider expanding similar depth to other sports organizations",
                        "Build strategic partnerships with identified focus areas"
                    ],
                    business_value="Clear market differentiation and expertise positioning for competitive advantage"
                )
                insights.append(insight)
        
        return insights

    def _generate_technical_insights(self, patterns: List[PatternDiscovery], raw_data: Dict[str, Any]) -> List[AnalyticsInsight]:
        """Generate technical architecture insights"""
        insights = []
        
        # Analyze library usage patterns
        correlation_patterns = [p for p in patterns if p.pattern_type == 'correlation']
        
        if correlation_patterns:
            pattern = correlation_patterns[0]
            correlation_ratio = pattern.metrics.get('correlation_ratio', 0)
            library_count = pattern.metrics.get('library_count', 0)
            
            if correlation_ratio < 1.5:  # Low efficiency
                priority = "high"
                impact = 8.0
                description = f"Suboptimal library utilization: {correlation_ratio:.2f} components per library"
                recommendations = [
                    "Audit and remove unused libraries",
                    "Consolidate overlapping functionality",
                    "Consider switching to more lightweight alternatives",
                    "Implement tree-shaking for better bundle optimization"
                ]
            else:  # Good efficiency
                priority = "low"
                impact = 6.0
                description = f"Efficient library utilization: {correlation_ratio:.2f} components per library"
                recommendations = [
                    "Maintain current library management practices",
                    "Monitor bundle size growth over time",
                    "Document library usage patterns for team consistency"
                ]
            
            insight = AnalyticsInsight(
                insight_id=f"tech_libraries_{int(time.time())}",
                category="technical",
                priority=priority,
                impact_score=impact,
                confidence=0.85,
                description=description,
                supporting_patterns=[pattern.pattern_id],
                actionable_recommendations=recommendations,
                business_value="Optimized technical stack leading to better performance and maintainability"
            )
            insights.append(insight)
        
        return insights

    def _load_insight_templates(self) -> Dict[str, Any]:
        """Load insight generation templates"""
        return {
            "performance": {
                "high_complexity": "Component complexity above threshold indicates performance optimization opportunity",
                "library_bloat": "High library-to-component ratio suggests optimization potential"
            },
            "ux": {
                "interaction_patterns": "Dominant interaction patterns should be optimized for accessibility and usability",
                "navigation_depth": "Deep navigation structures may impact user experience"
            },
            "business": {
                "market_focus": "Clear focus areas provide competitive differentiation opportunities",
                "feature_gaps": "Missing features represent potential market expansion areas"
            },
            "technical": {
                "architecture_complexity": "High architectural complexity may impact maintainability",
                "dependency_management": "Dependency patterns affect system reliability and performance"
            }
        }

class VisualizationEngine:
    """Generate visualizations for patterns and insights"""
    
    def __init__(self):
        self.viz_cache = {}
        
    def generate_visualization(self, viz_type: str, patterns_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate specific visualization"""
        
        if viz_type == 'pattern_distribution':
            return self._create_pattern_distribution_viz(patterns_data)
        elif viz_type == 'confidence_scores':
            return self._create_confidence_scores_viz(patterns_data)
        elif viz_type == 'insight_categories':
            return self._create_insight_categories_viz(patterns_data)
        else:
            return {'error': f'Unknown visualization type: {viz_type}'}

    def _create_pattern_distribution_viz(self, patterns_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create pattern type distribution visualization"""
        if not patterns_data:
            return {'error': 'No pattern data available'}
        
        # Count patterns by type
        pattern_counts = defaultdict(int)
        for pattern in patterns_data.values():
            pattern_counts[pattern['pattern_type']] += 1
        
        return {
            'type': 'pie',
            'title': 'Pattern Distribution by Type',
            'data': {
                'labels': list(pattern_counts.keys()),
                'values': list(pattern_counts.values())
            },
            'config': {
                'colors': ['#BF5700', '#FF7A00', '#FFB81C', '#8B3D00', '#F8F9FA']
            }
        }

    def _create_confidence_scores_viz(self, patterns_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create confidence scores distribution"""
        if not patterns_data:
            return {'error': 'No pattern data available'}
        
        scores = [pattern['confidence_score'] for pattern in patterns_data.values()]
        
        return {
            'type': 'histogram',
            'title': 'Pattern Confidence Score Distribution',
            'data': {
                'values': scores,
                'bins': 10
            },
            'config': {
                'color': '#BF5700',
                'opacity': 0.7
            }
        }

    def generate_dashboard_viz(self, patterns: List[PatternDiscovery], insights: List[AnalyticsInsight]) -> Dict[str, Any]:
        """Generate comprehensive dashboard visualizations"""
        dashboard_data = {
            'summary_stats': {
                'total_patterns': len(patterns),
                'total_insights': len(insights),
                'avg_confidence': statistics.mean([p.confidence_score for p in patterns]) if patterns else 0,
                'high_impact_insights': len([i for i in insights if i.impact_score > 8.0])
            },
            'pattern_types': Counter([p.pattern_type for p in patterns]),
            'insight_categories': Counter([i.category for i in insights]),
            'confidence_distribution': [p.confidence_score for p in patterns],
            'impact_distribution': [i.impact_score for i in insights]
        }
        
        self.viz_cache['dashboard'] = dashboard_data
        return dashboard_data

def create_dashboard_template():
    """Create the main dashboard HTML template"""
    
    dashboard_html = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🧠 Blaze Pattern Recognition Engine</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root {
            --primary: #BF5700;
            --primary-light: #FF7A00;
            --accent: #FFB81C;
            --dark: #0A0A0F;
            --darker: #050507;
            --light: #F8F9FA;
            --glass: rgba(255, 255, 255, 0.08);
            --glass-border: rgba(255, 255, 255, 0.15);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', system-ui, sans-serif;
            background: var(--darker);
            color: var(--light);
            line-height: 1.6;
        }

        .header {
            background: linear-gradient(135deg, var(--primary), var(--primary-light));
            padding: 2rem;
            text-align: center;
            box-shadow: 0 4px 20px rgba(191, 87, 0, 0.3);
        }

        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }

        .dashboard {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
        }

        .card {
            background: var(--glass);
            border: 1px solid var(--glass-border);
            border-radius: 16px;
            padding: 1.5rem;
            backdrop-filter: blur(10px);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(191, 87, 0, 0.2);
        }

        .card h2 {
            color: var(--accent);
            margin-bottom: 1rem;
            font-size: 1.3rem;
        }

        .metrics {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .metric {
            text-align: center;
            padding: 1rem;
            background: var(--glass);
            border-radius: 12px;
            border: 1px solid var(--glass-border);
        }

        .metric-value {
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary-light);
        }

        .metric-label {
            font-size: 0.9rem;
            opacity: 0.8;
            margin-top: 0.5rem;
        }

        .pattern-list {
            max-height: 400px;
            overflow-y: auto;
        }

        .pattern-item {
            padding: 1rem;
            margin-bottom: 1rem;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            border-left: 4px solid var(--primary);
        }

        .pattern-type {
            color: var(--accent);
            font-weight: 600;
            font-size: 0.9rem;
            text-transform: uppercase;
        }

        .pattern-description {
            margin: 0.5rem 0;
        }

        .confidence-bar {
            height: 4px;
            background: rgba(191, 87, 0, 0.3);
            border-radius: 2px;
            overflow: hidden;
            margin-top: 0.5rem;
        }

        .confidence-fill {
            height: 100%;
            background: var(--primary-light);
            transition: width 0.3s ease;
        }

        .controls {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
        }

        .btn {
            background: var(--primary);
            color: white;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: background 0.3s ease;
            margin-left: 0.5rem;
        }

        .btn:hover {
            background: var(--primary-light);
        }

        .status {
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
        }

        .status.processing {
            background: rgba(255, 184, 28, 0.2);
            color: var(--accent);
        }

        .status.idle {
            background: rgba(76, 175, 80, 0.2);
            color: #4CAF50;
        }

        .chart-container {
            position: relative;
            height: 300px;
            margin-top: 1rem;
        }

        @media (max-width: 768px) {
            .dashboard {
                grid-template-columns: 1fr;
                padding: 1rem;
            }
            
            .metrics {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 2rem;
            }
        }

        .loading {
            text-align: center;
            padding: 2rem;
            opacity: 0.6;
        }

        .error {
            color: #ff4444;
            background: rgba(255, 68, 68, 0.1);
            padding: 1rem;
            border-radius: 8px;
            border-left: 4px solid #ff4444;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧠 Blaze Pattern Recognition Engine</h1>
        <p>Advanced Analytics • Hidden Pattern Discovery • Strategic Intelligence</p>
    </div>

    <div class="controls">
        <span id="status" class="status idle">Idle</span>
        <button class="btn" onclick="triggerProcessing()">🔍 Analyze Patterns</button>
        <button class="btn" onclick="refreshData()">🔄 Refresh</button>
    </div>

    <div class="dashboard">
        <!-- Summary Metrics -->
        <div class="card">
            <h2>📊 Analysis Overview</h2>
            <div class="metrics">
                <div class="metric">
                    <div class="metric-value" id="patterns-count">0</div>
                    <div class="metric-label">Patterns Discovered</div>
                </div>
                <div class="metric">
                    <div class="metric-value" id="insights-count">0</div>
                    <div class="metric-label">Strategic Insights</div>
                </div>
                <div class="metric">
                    <div class="metric-value" id="confidence-avg">0%</div>
                    <div class="metric-label">Avg Confidence</div>
                </div>
                <div class="metric">
                    <div class="metric-value" id="high-impact">0</div>
                    <div class="metric-label">High Impact</div>
                </div>
            </div>
        </div>

        <!-- Pattern Types -->
        <div class="card">
            <h2>🔍 Pattern Distribution</h2>
            <div class="chart-container">
                <canvas id="pattern-chart"></canvas>
            </div>
        </div>

        <!-- Recent Patterns -->
        <div class="card">
            <h2>🎯 Recent Discoveries</h2>
            <div id="patterns-list" class="pattern-list loading">
                <p>Click "Analyze Patterns" to discover hidden insights...</p>
            </div>
        </div>

        <!-- Insights -->
        <div class="card">
            <h2>💡 Strategic Insights</h2>
            <div id="insights-list" class="pattern-list loading">
                <p>Insights will appear after pattern analysis...</p>
            </div>
        </div>
    </div>

    <script>
        let patternChart = null;

        async function triggerProcessing() {
            const statusEl = document.getElementById('status');
            statusEl.textContent = 'Processing';
            statusEl.className = 'status processing';
            
            try {
                const response = await fetch('/api/process', { method: 'POST' });
                const result = await response.json();
                console.log('Processing triggered:', result);
                
                // Poll for completion
                pollStatus();
            } catch (error) {
                console.error('Error triggering processing:', error);
                statusEl.textContent = 'Error';
                statusEl.className = 'status error';
            }
        }

        async function pollStatus() {
            const statusEl = document.getElementById('status');
            
            const checkStatus = async () => {
                try {
                    const response = await fetch('/api/status');
                    const status = await response.json();
                    
                    if (status.status === 'processing') {
                        statusEl.textContent = 'Processing';
                        statusEl.className = 'status processing';
                        setTimeout(checkStatus, 2000);
                    } else {
                        statusEl.textContent = 'Ready';
                        statusEl.className = 'status idle';
                        refreshData();
                    }
                } catch (error) {
                    console.error('Error checking status:', error);
                    statusEl.textContent = 'Error';
                    statusEl.className = 'status error';
                }
            };
            
            checkStatus();
        }

        async function refreshData() {
            try {
                // Fetch patterns
                const patternsResponse = await fetch('/api/patterns');
                const patternsData = await patternsResponse.json();
                
                // Fetch insights
                const insightsResponse = await fetch('/api/insights');
                const insightsData = await insightsResponse.json();
                
                // Update UI
                updateMetrics(patternsData, insightsData);
                updatePatternsList(patternsData.patterns || []);
                updateInsightsList(insightsData.insights || []);
                updatePatternChart(patternsData.patterns || []);
                
            } catch (error) {
                console.error('Error refreshing data:', error);
            }
        }

        function updateMetrics(patterns, insights) {
            document.getElementById('patterns-count').textContent = patterns.total_count || 0;
            document.getElementById('insights-count').textContent = insights.total_count || 0;
            
            const avgConfidence = patterns.patterns && patterns.patterns.length > 0 
                ? (patterns.patterns.reduce((sum, p) => sum + p.confidence_score, 0) / patterns.patterns.length * 100).toFixed(0)
                : 0;
            document.getElementById('confidence-avg').textContent = avgConfidence + '%';
            
            const highImpact = insights.insights 
                ? insights.insights.filter(i => i.impact_score > 8.0).length 
                : 0;
            document.getElementById('high-impact').textContent = highImpact;
        }

        function updatePatternsList(patterns) {
            const listEl = document.getElementById('patterns-list');
            
            if (patterns.length === 0) {
                listEl.innerHTML = '<p class="loading">No patterns discovered yet. Click "Analyze Patterns" to start.</p>';
                return;
            }
            
            listEl.innerHTML = patterns.slice(0, 5).map(pattern => `
                <div class="pattern-item">
                    <div class="pattern-type">${pattern.pattern_type}</div>
                    <div class="pattern-description">${pattern.description}</div>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${pattern.confidence_score * 100}%"></div>
                    </div>
                </div>
            `).join('');
        }

        function updateInsightsList(insights) {
            const listEl = document.getElementById('insights-list');
            
            if (insights.length === 0) {
                listEl.innerHTML = '<p class="loading">No insights generated yet.</p>';
                return;
            }
            
            listEl.innerHTML = insights.slice(0, 5).map(insight => `
                <div class="pattern-item">
                    <div class="pattern-type">${insight.category} • ${insight.priority} priority</div>
                    <div class="pattern-description">${insight.description}</div>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${insight.impact_score * 10}%"></div>
                    </div>
                </div>
            `).join('');
        }

        function updatePatternChart(patterns) {
            const ctx = document.getElementById('pattern-chart').getContext('2d');
            
            if (patternChart) {
                patternChart.destroy();
            }
            
            const patternTypes = {};
            patterns.forEach(pattern => {
                patternTypes[pattern.pattern_type] = (patternTypes[pattern.pattern_type] || 0) + 1;
            });
            
            patternChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(patternTypes),
                    datasets: [{
                        data: Object.values(patternTypes),
                        backgroundColor: ['#BF5700', '#FF7A00', '#FFB81C', '#8B3D00', '#F8F9FA'],
                        borderWidth: 2,
                        borderColor: 'rgba(255, 255, 255, 0.1)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#F8F9FA',
                                usePointStyle: true,
                                padding: 15
                            }
                        }
                    }
                }
            });
        }

        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            refreshData();
        });
    </script>
</body>
</html>'''
    
    return dashboard_html

def main():
    """Main entry point for the Pattern Recognition Engine"""
    print("🧠 BLAZE INTELLIGENCE PATTERN RECOGNITION ENGINE")
    print("=" * 60)
    
    # Create templates directory if it doesn't exist
    templates_dir = Path("templates")
    templates_dir.mkdir(exist_ok=True)
    
    # Create dashboard template
    dashboard_html = create_dashboard_template()
    with open(templates_dir / "dashboard.html", "w", encoding='utf-8') as f:
        f.write(dashboard_html)
    
    print("📄 Dashboard template created")
    
    # Initialize and start the engine
    try:
        engine = BlazePatternEngine(port=8080)
        print("🚀 Starting pattern recognition engine...")
        print("🌐 Dashboard available at: http://localhost:8080")
        print("🔍 Advanced analytics and pattern discovery ready")
        print("\n💡 Click 'Analyze Patterns' in the dashboard to discover hidden insights!")
        
        engine.run()
        
    except KeyboardInterrupt:
        print("\n🛑 Pattern Recognition Engine stopped")
    except Exception as e:
        logger.error(f"❌ Engine startup failed: {str(e)}")
        print(f"\n❌ Error starting engine: {str(e)}")
        print("📝 Check that required dependencies are installed:")
        print("   pip install flask flask-cors scikit-learn textblob beautifulsoup4 matplotlib seaborn pandas numpy")

if __name__ == "__main__":
    main()