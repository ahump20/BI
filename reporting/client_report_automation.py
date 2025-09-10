#!/usr/bin/env python3
"""
Client Reporting Automation System for Blaze Intelligence
Generates automated reports for clients with customizable templates and delivery
"""

import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import sqlite3
from pathlib import Path
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from jinja2 import Template
import io
import base64

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ClientReportGenerator:
    """
    Automated client reporting system with customizable templates
    """
    
    def __init__(self, db_path: str = "data/client_reports.db"):
        self.db_path = db_path
        self.setup_database()
        self.report_templates = self._load_report_templates()
        
        # Email configuration (would use environment variables in production)
        self.smtp_config = {
            "host": "smtp.gmail.com",
            "port": 587,
            "username": "blaze.intelligence.reports@gmail.com",
            "password": "secure_app_password"  # Use app-specific password
        }
        
    def setup_database(self):
        """Initialize client reporting database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Clients table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS clients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                organization TEXT,
                report_frequency TEXT DEFAULT 'weekly',
                focus_teams TEXT,  -- JSON array of team IDs
                custom_metrics TEXT,  -- JSON array of preferred metrics
                delivery_format TEXT DEFAULT 'pdf',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                active BOOLEAN DEFAULT 1
            )
        """)
        
        # Report history table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS report_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_id INTEGER,
                report_type TEXT,
                generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                file_path TEXT,
                delivery_status TEXT DEFAULT 'pending',
                metadata TEXT,  -- JSON with report details
                FOREIGN KEY (client_id) REFERENCES clients (id)
            )
        """)
        
        conn.commit()
        conn.close()
        
    def _load_report_templates(self) -> Dict[str, str]:
        """Load HTML email templates"""
        return {
            "weekly_performance": """
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .metric-card { background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 20px; margin: 15px 0; }
        .metric-title { font-weight: bold; color: #495057; font-size: 14px; margin-bottom: 8px; }
        .metric-value { font-size: 24px; font-weight: bold; color: #007bff; }
        .team-section { border-left: 4px solid #FF6B35; padding-left: 20px; margin: 20px 0; }
        .recommendations { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6c757d; font-size: 12px; }
        .status-ready { color: #28a745; font-weight: bold; }
        .status-caution { color: #ffc107; font-weight: bold; }
        .status-concern { color: #dc3545; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔥 Blaze Intelligence Weekly Report</h1>
            <p>{{ report_date }} | {{ client_name }}</p>
        </div>
        
        <div class="content">
            <h2>Executive Summary</h2>
            <p>Your focus teams' performance analysis for the week ending {{ report_date }}.</p>
            
            <div class="metric-card">
                <div class="metric-title">Overall Team Readiness</div>
                <div class="metric-value">{{ avg_readiness }}/100</div>
                <small>Average across {{ team_count }} monitored teams</small>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">Players in Peak Condition</div>
                <div class="metric-value">{{ peak_players }}</div>
                <small>Readiness score ≥85</small>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">Players Requiring Attention</div>
                <div class="metric-value">{{ attention_players }}</div>
                <small>Readiness score <60</small>
            </div>
            
            {% for team in teams %}
            <div class="team-section">
                <h3>{{ team.name }} ({{ team.league }})</h3>
                <p><strong>Team Readiness:</strong> 
                    <span class="{% if team.avg_readiness >= 80 %}status-ready{% elif team.avg_readiness >= 60 %}status-caution{% else %}status-concern{% endif %}">
                        {{ team.avg_readiness }}/100
                    </span>
                </p>
                
                <h4>Top Performers:</h4>
                <ul>
                    {% for player in team.top_players %}
                    <li><strong>{{ player.name }}</strong> ({{ player.position }}) - {{ player.readiness }}/100</li>
                    {% endfor %}
                </ul>
                
                {% if team.concerns %}
                <h4>Areas of Concern:</h4>
                <ul>
                    {% for concern in team.concerns %}
                    <li>{{ concern }}</li>
                    {% endfor %}
                </ul>
                {% endif %}
            </div>
            {% endfor %}
            
            <div class="recommendations">
                <h3>🎯 Strategic Recommendations</h3>
                <ul>
                    {% for rec in recommendations %}
                    <li>{{ rec }}</li>
                    {% endfor %}
                </ul>
            </div>
            
            <p><strong>Next Report:</strong> {{ next_report_date }}</p>
        </div>
        
        <div class="footer">
            <p>Generated by Blaze Intelligence | Where cognitive performance meets quarterly performance</p>
            <p>Questions? Reply to this email or visit <a href="https://blaze-intelligence.com">blaze-intelligence.com</a></p>
        </div>
    </div>
</body>
</html>
            """,
            
            "monthly_nil": """
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .nil-card { background-color: #e8f5e8; border: 2px solid #28a745; border-radius: 8px; padding: 20px; margin: 15px 0; }
        .nil-value { font-size: 28px; font-weight: bold; color: #28a745; }
        .trend-up { color: #28a745; }
        .trend-down { color: #dc3545; }
        .market-insight { background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💰 NIL Market Intelligence Report</h1>
            <p>{{ report_date }} | {{ client_name }}</p>
        </div>
        
        <div class="content">
            <h2>NIL Valuation Summary</h2>
            
            {% for athlete in nil_athletes %}
            <div class="nil-card">
                <h3>{{ athlete.name }} ({{ athlete.sport }})</h3>
                <div class="nil-value">${{ athlete.estimated_value }}</div>
                <p>Estimated Monthly NIL Value</p>
                <p>Trust Score: {{ athlete.nil_trust_score }}/100</p>
                <p>30-Day Trend: 
                    <span class="{% if athlete.trend > 0 %}trend-up{% else %}trend-down{% endif %}">
                        {{ athlete.trend }}%
                    </span>
                </p>
            </div>
            {% endfor %}
            
            <div class="market-insight">
                <h3>🔍 Market Insights</h3>
                <ul>
                    {% for insight in market_insights %}
                    <li>{{ insight }}</li>
                    {% endfor %}
                </ul>
            </div>
        </div>
    </div>
</body>
</html>
            """
        }
    
    def add_client(self, name: str, email: str, organization: str = "", 
                   focus_teams: List[str] = None, report_frequency: str = "weekly") -> int:
        """Add a new client to the system"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO clients (name, email, organization, report_frequency, focus_teams)
            VALUES (?, ?, ?, ?, ?)
        """, (name, email, organization, report_frequency, json.dumps(focus_teams or [])))
        
        client_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        logger.info(f"Added client: {name} ({email})")
        return client_id
    
    def generate_weekly_performance_report(self, client_id: int) -> Dict[str, Any]:
        """Generate weekly performance report for client"""
        # Get client info
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM clients WHERE id = ?", (client_id,))
        client = cursor.fetchone()
        conn.close()
        
        if not client:
            raise ValueError(f"Client {client_id} not found")
        
        client_data = {
            'id': client[0],
            'name': client[1],
            'email': client[2],
            'organization': client[3],
            'focus_teams': json.loads(client[5] or '[]')
        }
        
        # Gather team performance data
        teams_data = self._collect_team_performance_data(client_data['focus_teams'])
        
        # Calculate summary metrics
        all_readiness_scores = []
        peak_players = 0
        attention_players = 0
        
        for team in teams_data:
            for player in team.get('players', []):
                readiness = player.get('havf_scores', {}).get('champion_readiness', 0)
                all_readiness_scores.append(readiness)
                
                if readiness >= 85:
                    peak_players += 1
                elif readiness < 60:
                    attention_players += 1
        
        avg_readiness = round(sum(all_readiness_scores) / len(all_readiness_scores), 1) if all_readiness_scores else 0
        
        # Generate recommendations
        recommendations = self._generate_strategic_recommendations(teams_data, avg_readiness)
        
        # Prepare template data
        template_data = {
            'client_name': client_data['name'],
            'report_date': datetime.now().strftime('%B %d, %Y'),
            'next_report_date': (datetime.now() + timedelta(days=7)).strftime('%B %d, %Y'),
            'avg_readiness': avg_readiness,
            'team_count': len(teams_data),
            'peak_players': peak_players,
            'attention_players': attention_players,
            'teams': teams_data,
            'recommendations': recommendations
        }
        
        # Generate HTML report
        template = Template(self.report_templates['weekly_performance'])
        html_content = template.render(**template_data)
        
        # Save report
        report_file = f"reports/weekly_performance_{client_id}_{datetime.now().strftime('%Y%m%d')}.html"
        os.makedirs(os.path.dirname(report_file), exist_ok=True)
        
        with open(report_file, 'w') as f:
            f.write(html_content)
        
        # Record in database
        self._record_report_generation(client_id, "weekly_performance", report_file, template_data)
        
        return {
            'report_file': report_file,
            'html_content': html_content,
            'client_email': client_data['email'],
            'summary': template_data
        }
    
    def generate_monthly_nil_report(self, client_id: int) -> Dict[str, Any]:
        """Generate monthly NIL valuation report"""
        # Get client info
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM clients WHERE id = ?", (client_id,))
        client = cursor.fetchone()
        conn.close()
        
        if not client:
            raise ValueError(f"Client {client_id} not found")
        
        client_data = {
            'name': client[1],
            'email': client[2],
            'focus_teams': json.loads(client[5] or '[]')
        }
        
        # Collect NIL data for focus athletes
        nil_athletes = self._collect_nil_valuation_data(client_data['focus_teams'])
        market_insights = self._generate_nil_market_insights(nil_athletes)
        
        template_data = {
            'client_name': client_data['name'],
            'report_date': datetime.now().strftime('%B %Y'),
            'nil_athletes': nil_athletes,
            'market_insights': market_insights
        }
        
        # Generate HTML report
        template = Template(self.report_templates['monthly_nil'])
        html_content = template.render(**template_data)
        
        # Save report
        report_file = f"reports/monthly_nil_{client_id}_{datetime.now().strftime('%Y%m%d')}.html"
        os.makedirs(os.path.dirname(report_file), exist_ok=True)
        
        with open(report_file, 'w') as f:
            f.write(html_content)
        
        # Record in database
        self._record_report_generation(client_id, "monthly_nil", report_file, template_data)
        
        return {
            'report_file': report_file,
            'html_content': html_content,
            'client_email': client_data['email'],
            'summary': template_data
        }
    
    def _collect_team_performance_data(self, focus_teams: List[str]) -> List[Dict[str, Any]]:
        """Collect performance data for focus teams"""
        teams_data = []
        
        # Mock data collection - in production, this would query actual data files
        team_mappings = {
            'mlb_stl': {'name': 'St. Louis Cardinals', 'league': 'MLB'},
            'nfl_ten': {'name': 'Tennessee Titans', 'league': 'NFL'},
            'ncaa_tex': {'name': 'Texas Longhorns', 'league': 'NCAA'},
            'nba_mem': {'name': 'Memphis Grizzlies', 'league': 'NBA'}
        }
        
        for team_id in focus_teams:
            if team_id in team_mappings:
                # Try to load actual data
                data_files = [
                    f"data/{team_id}_*",
                    f"data/{team_mappings[team_id]['league'].lower()}_*"
                ]
                
                # Mock team data with realistic metrics
                team_data = {
                    'id': team_id,
                    'name': team_mappings[team_id]['name'],
                    'league': team_mappings[team_id]['league'],
                    'avg_readiness': round(60 + (hash(team_id) % 30), 1),
                    'top_players': [
                        {'name': f'Player {i}', 'position': 'POS', 'readiness': 85 + (i * 2)} 
                        for i in range(1, 4)
                    ],
                    'concerns': [
                        'Two players showing elevated fatigue markers',
                        'Injury risk slightly elevated for starting lineup'
                    ] if hash(team_id) % 2 == 0 else [],
                    'players': []
                }
                
                teams_data.append(team_data)
        
        return teams_data
    
    def _collect_nil_valuation_data(self, focus_teams: List[str]) -> List[Dict[str, Any]]:
        """Collect NIL valuation data for athletes"""
        nil_athletes = []
        
        # Mock NIL data - in production, would connect to NIL tracking systems
        mock_athletes = [
            {'name': 'Quinn Ewers', 'sport': 'Football', 'estimated_value': '125K', 'nil_trust_score': 82, 'trend': 15},
            {'name': 'Ja Morant', 'sport': 'Basketball', 'estimated_value': '85K', 'nil_trust_score': 78, 'trend': -8},
            {'name': 'Arch Manning', 'sport': 'Football', 'estimated_value': '200K', 'nil_trust_score': 92, 'trend': 25}
        ]
        
        return mock_athletes
    
    def _generate_nil_market_insights(self, athletes: List[Dict]) -> List[str]:
        """Generate NIL market insights"""
        insights = [
            "Football NIL values up 18% month-over-month driven by playoff performances",
            "Basketball player valuations show increased volatility tied to tournament outcomes",
            "Social media engagement correlation with NIL value remains at 0.73",
            "Emerging opportunity in women's sports NIL partnerships (+45% growth)"
        ]
        
        return insights
    
    def _generate_strategic_recommendations(self, teams_data: List[Dict], avg_readiness: float) -> List[str]:
        """Generate strategic recommendations based on performance data"""
        recommendations = []
        
        if avg_readiness < 60:
            recommendations.append("Consider increased recovery protocols across monitored teams")
            recommendations.append("Evaluate training load distribution for key players")
        
        if avg_readiness >= 80:
            recommendations.append("Teams showing excellent readiness - prime window for peak performances")
            recommendations.append("Consider strategic rest for non-essential games to maintain peak condition")
        
        # Team-specific recommendations
        for team in teams_data:
            if team['concerns']:
                recommendations.append(f"Monitor {team['name']} closely - elevated risk indicators detected")
        
        recommendations.append("Continue biometric monitoring to maintain competitive advantage")
        
        return recommendations[:5]  # Top 5 recommendations
    
    def _record_report_generation(self, client_id: int, report_type: str, 
                                 file_path: str, metadata: Dict[str, Any]):
        """Record report generation in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO report_history (client_id, report_type, file_path, metadata)
            VALUES (?, ?, ?, ?)
        """, (client_id, report_type, file_path, json.dumps(metadata)))
        
        conn.commit()
        conn.close()
    
    def send_report_email(self, report_data: Dict[str, Any], subject: str = None) -> bool:
        """Send report via email"""
        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.smtp_config['username']
            msg['To'] = report_data['client_email']
            msg['Subject'] = subject or f"Blaze Intelligence Report - {datetime.now().strftime('%B %d, %Y')}"
            
            # Add HTML body
            msg.attach(MIMEText(report_data['html_content'], 'html'))
            
            # Attach report file if exists
            if os.path.exists(report_data['report_file']):
                with open(report_data['report_file'], "rb") as attachment:
                    part = MIMEBase('application', 'octet-stream')
                    part.set_payload(attachment.read())
                    encoders.encode_base64(part)
                    part.add_header(
                        'Content-Disposition',
                        f'attachment; filename= {os.path.basename(report_data["report_file"])}'
                    )
                    msg.attach(part)
            
            # Send email (commented out for testing)
            # server = smtplib.SMTP(self.smtp_config['host'], self.smtp_config['port'])
            # server.starttls()
            # server.login(self.smtp_config['username'], self.smtp_config['password'])
            # text = msg.as_string()
            # server.sendmail(self.smtp_config['username'], report_data['client_email'], text)
            # server.quit()
            
            logger.info(f"Report email prepared for {report_data['client_email']}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            return False
    
    def run_automated_reports(self):
        """Run automated report generation for all active clients"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, report_frequency FROM clients WHERE active = 1")
        clients = cursor.fetchall()
        conn.close()
        
        reports_generated = 0
        
        for client in clients:
            client_id, name, frequency = client
            
            try:
                if frequency == 'weekly':
                    report = self.generate_weekly_performance_report(client_id)
                    self.send_report_email(report, f"Weekly Performance Report - {name}")
                    reports_generated += 1
                    
                elif frequency == 'monthly':
                    report = self.generate_monthly_nil_report(client_id)
                    self.send_report_email(report, f"Monthly NIL Report - {name}")
                    reports_generated += 1
                    
            except Exception as e:
                logger.error(f"Error generating report for client {name}: {str(e)}")
        
        logger.info(f"Generated {reports_generated} automated reports")
        return reports_generated


def main():
    """Test the client reporting system"""
    print("📊 BLAZE INTELLIGENCE - CLIENT REPORTING AUTOMATION")
    print("=" * 60)
    
    # Initialize system
    generator = ClientReportGenerator()
    
    # Add test clients
    print("👥 Adding test clients...")
    
    client1_id = generator.add_client(
        name="Cardinals Front Office",
        email="analytics@cardinals.com",
        organization="St. Louis Cardinals",
        focus_teams=["mlb_stl", "ncaa_tex"],
        report_frequency="weekly"
    )
    
    client2_id = generator.add_client(
        name="Titans Analytics Team", 
        email="data@titans.com",
        organization="Tennessee Titans",
        focus_teams=["nfl_ten", "nba_mem"],
        report_frequency="weekly"
    )
    
    client3_id = generator.add_client(
        name="NIL Advisor Group",
        email="advisors@nilgroup.com", 
        organization="NIL Advisory",
        focus_teams=["ncaa_tex", "mlb_stl"],
        report_frequency="monthly"
    )
    
    print(f"✅ Added 3 test clients")
    
    # Generate sample reports
    print("\n📋 Generating sample reports...")
    
    # Weekly performance report
    weekly_report = generator.generate_weekly_performance_report(client1_id)
    print(f"📊 Generated weekly report: {weekly_report['report_file']}")
    
    # Monthly NIL report  
    nil_report = generator.generate_monthly_nil_report(client3_id)
    print(f"💰 Generated NIL report: {nil_report['report_file']}")
    
    # Test automated report run
    print("\n🤖 Running automated report generation...")
    generated_count = generator.run_automated_reports()
    print(f"✅ Generated {generated_count} automated reports")
    
    print(f"\n🟢 Client Reporting Automation system test completed!")
    print(f"📁 Reports saved in: reports/")
    print(f"🗄️  Client database: {generator.db_path}")


if __name__ == "__main__":
    main()