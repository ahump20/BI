#!/usr/bin/env python3
"""
Blaze Intelligence Master Ingestion Orchestrator
Runs complete data pipeline: fetch → normalize → compute → validate → persist
"""

import sys
import os
import argparse
import time
from datetime import datetime
from typing import Dict, List, Any

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import all agents
from ingestion.mlb_agent import MLBAgent
from ingestion.nfl_agent import NFLAgent  
from ingestion.ncaa_agent import NCAAAgent
from ingestion.hs_agent import HSAgent
from ingestion.nil_agent import NILAgent
from ingestion.intl_agent import InternationalAgent
from ingestion.nba_agent import NBADataAgent


class BlazeOrchestrator:
    """Master orchestrator for Blaze Intelligence data ingestion"""
    
    def __init__(self):
        self.agents = {
            'mlb': MLBAgent(),
            'nfl': NFLAgent(),
            'ncaa': NCAAAgent(), 
            'hs': HSAgent(),
            'nil': NILAgent(),
            'intl': InternationalAgent(),
            'nba': NBADataAgent()
        }
        
        self.default_params = {
            'mlb': {'team': 'STL'},
            'nfl': {'team': 'TEN'},
            'ncaa': {'team': 'TEX'}, 
            'hs': {},
            'nil': {},
            'intl': {'league': 'KBO'},
            'nba': {'team': 'MEM'}
        }
    
    def run_agent(self, league: str, live: bool = False, params: Dict[str, Any] = None) -> bool:
        """Run a specific agent"""
        if league not in self.agents:
            print(f"Unknown league: {league}")
            return False
        
        agent = self.agents[league]
        agent_params = params or self.default_params.get(league, {})
        
        print(f"\n{'='*20} {league.upper()} AGENT {'='*20}")
        print(f"Live mode: {live}")
        print(f"Parameters: {agent_params}")
        print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        start_time = time.time()
        
        try:
            success = agent.run(agent_params, live=live)
            end_time = time.time()
            duration = end_time - start_time
            
            status = "SUCCESS" if success else "FAILED"
            print(f"Status: {status}")
            print(f"Duration: {duration:.2f}s")
            
            return success
            
        except Exception as e:
            end_time = time.time()
            duration = end_time - start_time
            print(f"Status: ERROR")
            print(f"Error: {e}")
            print(f"Duration: {duration:.2f}s")
            return False
    
    def run_all_agents(self, live: bool = False, leagues: List[str] = None) -> Dict[str, bool]:
        """Run all agents in priority order"""
        target_leagues = leagues or ['mlb', 'nfl', 'ncaa', 'nba', 'hs', 'nil', 'intl']
        results = {}
        
        print(f"\n{'='*60}")
        print("BLAZE INTELLIGENCE MASTER ORCHESTRATOR")
        print(f"{'='*60}")
        print(f"Live fetch mode: {live}")
        print(f"Target leagues: {', '.join(target_leagues)}")
        print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        total_start = time.time()
        
        # Run agents in order (prioritizing Cardinals, Titans, Longhorns)
        for league in target_leagues:
            if league in self.agents:
                success = self.run_agent(league, live=live)
                results[league] = success
            else:
                print(f"Skipping unknown league: {league}")
                results[league] = False
        
        total_end = time.time()
        total_duration = total_end - total_start
        
        # Summary
        print(f"\n{'='*60}")
        print("ORCHESTRATION COMPLETE")
        print(f"{'='*60}")
        
        successes = sum(1 for success in results.values() if success)
        total_agents = len(results)
        
        print(f"Success rate: {successes}/{total_agents} ({100*successes/total_agents:.1f}%)")
        print(f"Total duration: {total_duration:.2f}s")
        
        print("\nDetailed Results:")
        for league, success in results.items():
            status = "✅" if success else "❌"
            print(f"  {status} {league.upper()}")
        
        return results
    
    def run_readiness_board(self, focus_teams: List[str] = None) -> bool:
        """Generate readiness board after data ingestion"""
        print(f"\n{'='*20} READINESS BOARD {'='*20}")
        
        try:
            from ingestion.readiness import main as readiness_main
            import sys
            
            # Temporarily override sys.argv to pass arguments
            original_argv = sys.argv
            sys.argv = ['readiness.py']
            
            if focus_teams:
                sys.argv.extend(['--focus', ','.join(focus_teams)])
            
            readiness_main()
            sys.argv = original_argv
            
            print("Readiness board generated successfully")
            return True
            
        except Exception as e:
            print(f"Readiness board failed: {e}")
            return False
    
    def run_tests(self) -> bool:
        """Run validation tests"""
        print(f"\n{'='*20} VALIDATION TESTS {'='*20}")
        
        try:
            # Import and run tests
            from run_tests import run_tests
            success = run_tests()
            
            if success:
                print("All tests passed ✅")
            else:
                print("Some tests failed ❌")
            
            return success
            
        except Exception as e:
            print(f"Test execution failed: {e}")
            return False
    
    def run_biometric_analysis(self, player_ids: List[str] = None) -> bool:
        """Run biometric analysis for specified players"""
        print(f"\n{'='*20} BIOMETRIC ANALYSIS {'='*20}")
        
        try:
            from biometrics.biometric_integrator import BiometricIntegrator
            
            # Default test players if none specified
            test_players = player_ids or [
                "nba_mem_ja_morant",
                "mlb_stl_goldschmidt", 
                "nfl_ten_henry"
            ]
            
            for player_id in test_players:
                sport = "basketball" if "nba" in player_id else "baseball" if "mlb" in player_id else "football"
                integrator = BiometricIntegrator(player_id, sport)
                report = integrator.integration_report()
                
                print(f"📊 {player_id}: Readiness {report['readiness_analysis']['overall_readiness_score']}/100")
            
            print("Biometric analysis completed successfully")
            return True
            
        except Exception as e:
            print(f"Biometric analysis failed: {e}")
            return False
    
    def run_video_analysis(self, video_files: List[str] = None) -> bool:
        """Run video analysis on provided files"""
        print(f"\n{'='*20} VIDEO ANALYSIS {'='*20}")
        
        try:
            from vision.analyzers.biomechanical_analyzer import BiomechanicalAnalyzer
            from vision.analyzers.character_analyzer import CharacterAnalyzer
            
            # Demo analysis
            bio_analyzer = BiomechanicalAnalyzer(sport="baseball")
            char_analyzer = CharacterAnalyzer()
            
            print("📹 Biomechanical analyzer initialized")
            print("🎭 Character analyzer initialized")
            print("Video analysis systems operational")
            return True
            
        except Exception as e:
            print(f"Video analysis failed: {e}")
            return False
    
    def run_client_reports(self, client_ids: List[int] = None) -> bool:
        """Generate client reports"""
        print(f"\n{'='*20} CLIENT REPORTS {'='*20}")
        
        try:
            from reporting.client_report_automation import ClientReportGenerator
            
            generator = ClientReportGenerator()
            reports_generated = generator.run_automated_reports()
            
            print(f"Generated {reports_generated} client reports")
            return True
            
        except Exception as e:
            print(f"Client reports failed: {e}")
            return False


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(description='Blaze Intelligence Master Orchestrator')
    
    parser.add_argument('--live', action='store_true',
                       help='Enable live data fetching')
    parser.add_argument('--leagues', 
                       help='Comma-separated list of leagues to run (mlb,nfl,ncaa,nba,hs,nil,intl)')
    parser.add_argument('--focus-teams',
                       help='Comma-separated list of teams for readiness board',
                       default='MLB-STL,NFL-TEN,NCAA-TEX,NBA-MEM')
    parser.add_argument('--skip-tests', action='store_true',
                       help='Skip validation tests')
    parser.add_argument('--skip-readiness', action='store_true', 
                       help='Skip readiness board generation')
    parser.add_argument('--agent', 
                       help='Run specific agent only')
    parser.add_argument('--biometric-analysis', action='store_true',
                       help='Run biometric analysis on key players')
    parser.add_argument('--video-analysis', action='store_true',
                       help='Run video analysis systems check')
    parser.add_argument('--client-reports', action='store_true',
                       help='Generate automated client reports')
    parser.add_argument('--full-system', action='store_true',
                       help='Run complete system including all advanced features')
    
    args = parser.parse_args()
    
    # Create orchestrator
    orchestrator = BlazeOrchestrator()
    
    # Parse leagues
    if args.leagues:
        target_leagues = [l.strip().lower() for l in args.leagues.split(',')]
    else:
        target_leagues = None
    
    # Parse focus teams
    focus_teams = [t.strip() for t in args.focus_teams.split(',')] if args.focus_teams else None
    
    # Run single agent if specified
    if args.agent:
        success = orchestrator.run_agent(args.agent.lower(), live=args.live)
        sys.exit(0 if success else 1)
    
    # Run full orchestration
    results = orchestrator.run_all_agents(live=args.live, leagues=target_leagues)
    
    # Run tests unless skipped
    if not args.skip_tests:
        test_success = orchestrator.run_tests()
    else:
        test_success = True
        print("Tests skipped")
    
    # Generate readiness board unless skipped
    if not args.skip_readiness:
        readiness_success = orchestrator.run_readiness_board(focus_teams)
    else:
        readiness_success = True
        print("Readiness board skipped")
    
    # Run advanced features if requested
    biometric_success = True
    video_success = True  
    client_report_success = True
    
    if args.biometric_analysis or args.full_system:
        biometric_success = orchestrator.run_biometric_analysis()
    
    if args.video_analysis or args.full_system:
        video_success = orchestrator.run_video_analysis()
    
    if args.client_reports or args.full_system:
        client_report_success = orchestrator.run_client_reports()
    
    # Final status
    agent_successes = sum(1 for success in results.values() if success)
    base_components = len(results) + (1 if not args.skip_tests else 0) + (1 if not args.skip_readiness else 0)
    advanced_components = (
        (1 if args.biometric_analysis or args.full_system else 0) +
        (1 if args.video_analysis or args.full_system else 0) +
        (1 if args.client_reports or args.full_system else 0)
    )
    total_components = base_components + advanced_components
    
    successful_components = (
        agent_successes + 
        (1 if test_success else 0) + 
        (1 if readiness_success else 0) +
        (1 if biometric_success and (args.biometric_analysis or args.full_system) else 0) +
        (1 if video_success and (args.video_analysis or args.full_system) else 0) +
        (1 if client_report_success and (args.client_reports or args.full_system) else 0)
    )
    
    print(f"\n{'='*60}")
    print("FINAL STATUS")
    print(f"{'='*60}")
    print(f"Overall success rate: {successful_components}/{total_components} ({100*successful_components/total_components:.1f}%)")
    
    # Exit with appropriate code
    if successful_components == total_components:
        print("🎉 All systems operational!")
        sys.exit(0)
    else:
        print("⚠️  Some components failed")
        sys.exit(1)


if __name__ == '__main__':
    main()
