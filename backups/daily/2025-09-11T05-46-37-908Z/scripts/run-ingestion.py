#!/usr/bin/env python3
import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from blaze_multi_league_ingestion import UnifiedIngestionPipeline

async def main():
    pipeline = UnifiedIngestionPipeline()
    
    # Run for priority leagues
    summary = await pipeline.run(['MLB', 'NFL', 'NCAA'])
    
    print(f"✓ Ingested {summary['total_players']} players from {summary['total_teams']} teams")
    print(f"  HAV-F Average: {summary['havf_stats']['avg_composite']:.1f}")
    
    return 0 if summary['total_players'] > 0 else 1

if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
