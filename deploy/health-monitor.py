#!/usr/bin/env python3
"""
Production Health Monitor for Blaze Intelligence
Monitors system health, data freshness, and API availability
"""

import json
import os
import sys
import time
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class BlazeHealthMonitor:
    """Production health monitoring system"""
    
    def __init__(self, config_file: str = "deploy/monitor-config.json"):
        self.config = self.load_config(config_file)
        self.alerts = []
        
    def load_config(self, config_file: str) -> Dict[str, Any]:
        """Load monitoring configuration"""
        default_config = {
            "data_freshness_threshold_hours": 6,
            "api_timeout_seconds": 10,
            "max_failed_agents": 1,
            "alert_channels": {
                "slack_webhook": os.getenv("SLACK_WEBHOOK_URL"),
                "email_alerts": False
            },
            "focus_teams": ["MLB-STL", "NFL-TEN", "NCAA-TEX"],
            "critical_leagues": ["MLB", "NFL"],
            "health_check_endpoints": {
                "mlb": "https://statsapi.mlb.com/api/v1/teams",
                "nfl": "https://raw.githubusercontent.com/nflverse/nflfastR-data/master/data/teams_colors_logos.csv",
                "ncaa": "https://api.collegefootballdata.com/teams"
            }
        }
        
        try:
            if os.path.exists(config_file):
                with open(config_file, 'r') as f:
                    user_config = json.load(f)
                default_config.update(user_config)
        except Exception as e:
            print(f"Warning: Could not load config {config_file}: {e}")
            
        return default_config
    
    def check_data_freshness(self) -> Dict[str, Any]:
        """Check if data files are fresh"""
        results = {"status": "healthy", "issues": [], "leagues": {}}
        threshold = timedelta(hours=self.config["data_freshness_threshold_hours"])
        now = datetime.now()
        
        leagues_dir = "site/src/data/leagues"
        if not os.path.exists(leagues_dir):
            results["status"] = "critical"
            results["issues"].append("Leagues data directory missing")
            return results
        
        for filename in os.listdir(leagues_dir):
            if not filename.endswith('.json'):
                continue
                
            league = filename.replace('.json', '')
            filepath = os.path.join(leagues_dir, filename)
            
            try:
                # Check file modification time
                file_mtime = datetime.fromtimestamp(os.path.getmtime(filepath))
                age = now - file_mtime
                
                # Load and check data
                with open(filepath, 'r') as f:
                    data = json.load(f)
                
                players_count = len(data.get('players', []))
                generated_at = data.get('generated_at', '')
                
                league_status = {
                    "file_age_hours": round(age.total_seconds() / 3600, 1),
                    "players_count": players_count,
                    "generated_at": generated_at,
                    "status": "healthy"
                }
                
                # Check freshness
                if age > threshold:
                    league_status["status"] = "stale"
                    results["issues"].append(f"{league} data is {age} old")
                    if league.upper() in self.config["critical_leagues"]:
                        results["status"] = "degraded"
                
                # Check data completeness
                if players_count == 0:
                    league_status["status"] = "empty"
                    results["issues"].append(f"{league} has no players")
                    results["status"] = "degraded"
                
                results["leagues"][league] = league_status
                
            except Exception as e:
                results["issues"].append(f"Error checking {league}: {e}")
                results["status"] = "degraded"
                results["leagues"][league] = {"status": "error", "error": str(e)}
        
        return results
    
    def check_api_availability(self) -> Dict[str, Any]:
        """Check if external APIs are responsive"""
        results = {"status": "healthy", "issues": [], "apis": {}}
        
        for api_name, endpoint in self.config["health_check_endpoints"].items():
            try:
                start_time = time.time()
                response = requests.get(
                    endpoint, 
                    timeout=self.config["api_timeout_seconds"],
                    headers={'User-Agent': 'BlazeIntelligence-HealthCheck/1.0'}
                )
                response_time = round((time.time() - start_time) * 1000, 1)
                
                api_status = {
                    "status_code": response.status_code,
                    "response_time_ms": response_time,
                    "status": "healthy" if response.status_code == 200 else "degraded"
                }
                
                if response.status_code != 200:
                    results["issues"].append(f"{api_name} API returned {response.status_code}")
                    results["status"] = "degraded"
                
                if response_time > 5000:  # 5 seconds
                    results["issues"].append(f"{api_name} API slow ({response_time}ms)")
                    api_status["status"] = "slow"
                
                results["apis"][api_name] = api_status
                
            except requests.RequestException as e:
                results["issues"].append(f"{api_name} API unavailable: {e}")
                results["status"] = "degraded"
                results["apis"][api_name] = {"status": "down", "error": str(e)}
        
        return results
    
    def check_hav_f_metrics(self) -> Dict[str, Any]:
        """Check HAV-F metric validity"""
        results = {"status": "healthy", "issues": [], "metrics": {}}
        
        try:
            with open("site/src/data/readiness.json", 'r') as f:
                readiness_data = json.load(f)
        except Exception as e:
            results["status"] = "critical"
            results["issues"].append(f"Cannot read readiness data: {e}")
            return results
        
        players = readiness_data.get('players', [])
        summary = readiness_data.get('summary', {})
        
        # Check metric bounds
        invalid_metrics = []
        for player in players:
            for metric in ['champion_readiness', 'cognitive_leverage', 'nil_trust_score']:
                value = player.get(metric)
                if value is not None and not (0 <= value <= 100):
                    invalid_metrics.append(f"{player['name']}: {metric}={value}")
        
        if invalid_metrics:
            results["status"] = "critical"
            results["issues"].extend(invalid_metrics)
        
        # Check focus team coverage
        focus_teams = self.config["focus_teams"]
        focus_players = [p for p in players if p.get('team_id') in focus_teams]
        
        results["metrics"] = {
            "total_players": len(players),
            "focus_players": len(focus_players),
            "ready_players": summary.get('ready_players', 0),
            "monitor_players": summary.get('monitor_players', 0),
            "caution_players": summary.get('caution_players', 0),
            "invalid_metrics": len(invalid_metrics)
        }
        
        return results
    
    def check_system_resources(self) -> Dict[str, Any]:
        """Check system resource usage"""
        results = {"status": "healthy", "issues": [], "resources": {}}
        
        try:
            import psutil
            
            # CPU usage
            cpu_percent = psutil.cpu_percent(interval=1)
            if cpu_percent > 80:
                results["issues"].append(f"High CPU usage: {cpu_percent}%")
                results["status"] = "degraded"
            
            # Memory usage
            memory = psutil.virtual_memory()
            if memory.percent > 80:
                results["issues"].append(f"High memory usage: {memory.percent}%")
                results["status"] = "degraded"
            
            # Disk usage
            disk = psutil.disk_usage('/')
            if disk.percent > 85:
                results["issues"].append(f"High disk usage: {disk.percent}%")
                results["status"] = "degraded"
            
            results["resources"] = {
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "disk_percent": disk.percent
            }
            
        except ImportError:
            results["issues"].append("psutil not available for resource monitoring")
        except Exception as e:
            results["issues"].append(f"Resource check failed: {e}")
            results["status"] = "degraded"
        
        return results
    
    def run_comprehensive_health_check(self) -> Dict[str, Any]:
        """Run all health checks"""
        print("🔍 Running Blaze Intelligence Health Check...")
        
        overall_status = "healthy"
        health_report = {
            "timestamp": datetime.now().isoformat(),
            "overall_status": overall_status,
            "checks": {}
        }
        
        # Run all checks
        checks = {
            "data_freshness": self.check_data_freshness,
            "api_availability": self.check_api_availability,
            "hav_f_metrics": self.check_hav_f_metrics,
            "system_resources": self.check_system_resources
        }
        
        for check_name, check_func in checks.items():
            print(f"  Checking {check_name}...")
            try:
                result = check_func()
                health_report["checks"][check_name] = result
                
                # Update overall status
                if result["status"] == "critical":
                    overall_status = "critical"
                elif result["status"] == "degraded" and overall_status != "critical":
                    overall_status = "degraded"
                    
            except Exception as e:
                health_report["checks"][check_name] = {
                    "status": "error",
                    "error": str(e)
                }
                overall_status = "critical"
        
        health_report["overall_status"] = overall_status
        return health_report
    
    def send_alert(self, health_report: Dict[str, Any]) -> None:
        """Send alerts if issues detected"""
        if health_report["overall_status"] == "healthy":
            return
        
        # Prepare alert message
        status_emoji = {
            "healthy": "✅",
            "degraded": "⚠️",
            "critical": "🚨"
        }
        
        emoji = status_emoji.get(health_report["overall_status"], "❓")
        
        alert_message = f"{emoji} Blaze Intelligence Health Alert\n"
        alert_message += f"Status: {health_report['overall_status'].upper()}\n"
        alert_message += f"Time: {health_report['timestamp']}\n\n"
        
        # Add issues from each check
        for check_name, check_result in health_report["checks"].items():
            if check_result.get("issues"):
                alert_message += f"{check_name}:\n"
                for issue in check_result["issues"]:
                    alert_message += f"  - {issue}\n"
                alert_message += "\n"
        
        # Send to configured channels
        slack_webhook = self.config["alert_channels"].get("slack_webhook")
        if slack_webhook:
            try:
                requests.post(slack_webhook, json={
                    "text": alert_message,
                    "username": "Blaze Intelligence Monitor"
                })
                print("📧 Alert sent to Slack")
            except Exception as e:
                print(f"Failed to send Slack alert: {e}")
        
        # Log alert
        print("🚨 HEALTH ALERT:")
        print(alert_message)
    
    def generate_status_report(self, health_report: Dict[str, Any]) -> None:
        """Generate human-readable status report"""
        print("\n" + "="*60)
        print("🏥 BLAZE INTELLIGENCE SYSTEM HEALTH REPORT")
        print("="*60)
        
        status_colors = {
            "healthy": "🟢",
            "degraded": "🟡", 
            "critical": "🔴"
        }
        
        overall_icon = status_colors.get(health_report["overall_status"], "⚪")
        print(f"Overall Status: {overall_icon} {health_report['overall_status'].upper()}")
        print(f"Check Time: {health_report['timestamp']}")
        print()
        
        # Detailed check results
        for check_name, result in health_report["checks"].items():
            icon = status_colors.get(result["status"], "⚪")
            print(f"{icon} {check_name.replace('_', ' ').title()}: {result['status'].upper()}")
            
            if result.get("issues"):
                for issue in result["issues"]:
                    print(f"    ⚠️  {issue}")
            
            # Show specific metrics
            if check_name == "data_freshness" and "leagues" in result:
                healthy_leagues = sum(1 for l in result["leagues"].values() if l.get("status") == "healthy")
                total_leagues = len(result["leagues"])
                print(f"    📊 {healthy_leagues}/{total_leagues} leagues healthy")
            
            if check_name == "hav_f_metrics" and "metrics" in result:
                metrics = result["metrics"]
                print(f"    📈 {metrics['ready_players']} ready, {metrics['monitor_players']} monitor, {metrics['caution_players']} caution")
            
            print()


def main():
    """CLI entry point"""
    monitor = BlazeHealthMonitor()
    
    # Run health check
    health_report = monitor.run_comprehensive_health_check()
    
    # Generate report
    monitor.generate_status_report(health_report)
    
    # Send alerts if needed
    monitor.send_alert(health_report)
    
    # Save report
    report_path = "deploy/health-report.json"
    with open(report_path, 'w') as f:
        json.dump(health_report, f, indent=2)
    
    print(f"📋 Full report saved to: {report_path}")
    
    # Exit with appropriate code
    exit_codes = {"healthy": 0, "degraded": 1, "critical": 2}
    sys.exit(exit_codes.get(health_report["overall_status"], 3))


if __name__ == '__main__':
    main()
