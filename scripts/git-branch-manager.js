#!/usr/bin/env node

/**
 * Git Branch Management Automation
 * Handles merging feature branches to main and updating branches to stay current
 * 
 * Usage:
 * npm run catch-branches           # Dry run mode
 * npm run catch-branches --execute # Execute changes
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

class GitBranchManager {
  constructor() {
    this.dryRun = true;
    this.currentBranch = '';
    this.mainBranch = 'main';
    this.remoteName = 'origin';
    this.repoPath = process.cwd();
  }

  log(message, type = 'info') {
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red,
      header: chalk.cyan.bold
    };
    console.log(colors[type](message));
  }

  async execGit(command, throwOnError = true) {
    try {
      if (this.dryRun && !command.includes('status') && !command.includes('log') && !command.includes('show') && !command.includes('branch') && !command.includes('fetch')) {
        this.log(`[DRY RUN] Would execute: git ${command}`, 'info');
        return '';
      }

      const result = execSync(`git ${command}`, {
        cwd: this.repoPath,
        encoding: 'utf8'
      });
      return result.trim();
    } catch (error) {
      if (throwOnError) {
        throw new Error(`Git command failed: git ${command}\nError: ${error.message}`);
      }
      return '';
    }
  }

  async getCurrentBranch() {
    const branch = await this.execGit('branch --show-current');
    this.currentBranch = branch;
    return branch;
  }

  async fetchAllBranches() {
    this.log('📡 Fetching all branches from remote...', 'info');
    await this.execGit('fetch --all --prune');
    this.log('✅ Fetch complete', 'success');
  }

  async getBranchList() {
    // Get all remote branches
    const remoteBranches = await this.execGit('branch -r --format="%(refname:short)"');
    const branches = remoteBranches.split('\n')
      .filter(branch => branch.trim())
      .filter(branch => !branch.includes('HEAD'))
      .map(branch => branch.replace(`${this.remoteName}/`, ''))
      .filter(branch => branch !== this.mainBranch);

    // Get local branches
    const localBranches = await this.execGit('branch --format="%(refname:short)"');
    const localBranchList = localBranches.split('\n')
      .filter(branch => branch.trim())
      .filter(branch => branch !== this.mainBranch);

    // Combine and deduplicate
    const allBranches = [...new Set([...branches, ...localBranchList])];
    
    this.log(`Found ${allBranches.length} branches to analyze`, 'info');
    return allBranches;
  }

  async getBranchInfo(branchName) {
    try {
      // Check if branch exists locally
      const localExists = await this.execGit(`show-ref --verify --quiet refs/heads/${branchName}`, false);
      
      // Check if branch exists on remote
      const remoteExists = await this.execGit(`show-ref --verify --quiet refs/remotes/${this.remoteName}/${branchName}`, false);
      
      // Get last commit info
      let lastCommit = '';
      let lastCommitDate = '';
      let commitsBehindMain = 0;
      let commitsAheadMain = 0;
      
      if (localExists || remoteExists) {
        const branchRef = localExists ? branchName : `${this.remoteName}/${branchName}`;
        
        try {
          lastCommit = await this.execGit(`log -1 --format="%H %s" ${branchRef}`);
          lastCommitDate = await this.execGit(`log -1 --format="%ai" ${branchRef}`);
          
          // Get commit counts relative to main
          const behindCount = await this.execGit(`rev-list --count ${branchRef}..${this.remoteName}/${this.mainBranch}`, false);
          const aheadCount = await this.execGit(`rev-list --count ${this.remoteName}/${this.mainBranch}..${branchRef}`, false);
          
          commitsBehindMain = parseInt(behindCount) || 0;
          commitsAheadMain = parseInt(aheadCount) || 0;
        } catch (error) {
          // Branch might not exist or other issue
        }
      }

      return {
        name: branchName,
        localExists: !!localExists,
        remoteExists: !!remoteExists,
        lastCommit,
        lastCommitDate,
        commitsBehindMain,
        commitsAheadMain,
        isStale: this.isBranchStale(lastCommitDate),
        shouldMerge: this.shouldMergeBranch(branchName, commitsAheadMain, lastCommitDate),
        shouldUpdate: this.shouldUpdateBranch(branchName, commitsBehindMain)
      };
    } catch (error) {
      this.log(`Error analyzing branch ${branchName}: ${error.message}`, 'error');
      return null;
    }
  }

  isBranchStale(lastCommitDate) {
    if (!lastCommitDate) return true;
    
    const commitDate = new Date(lastCommitDate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    return commitDate < threeMonthsAgo;
  }

  shouldMergeBranch(branchName, commitsAhead, lastCommitDate) {
    // Always merge the current working branch if it has commits ahead
    if (branchName === this.currentBranch && commitsAhead > 0) {
      return true;
    }
    
    // Merge criteria:
    // 1. Has commits ahead of main
    // 2. Is a feature branch (not a long-running branch)
    // 3. Not older than 6 months
    
    if (commitsAhead === 0) return false;
    
    // Don't auto-merge development or staging branches
    const longRunningBranches = ['development', 'staging', 'dev', 'stage'];
    if (longRunningBranches.includes(branchName)) return false;
    
    // Don't auto-merge very old branches without manual review
    if (lastCommitDate) {
      const commitDate = new Date(lastCommitDate);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      if (commitDate < sixMonthsAgo) return false;
    }
    
    return true;
  }

  shouldUpdateBranch(branchName, commitsBehind) {
    // Update criteria:
    // 1. Branch is behind main
    // 2. Is a long-running branch or recent feature branch
    
    if (commitsBehind === 0) return false;
    
    // Always update development branches
    const developmentBranches = ['development', 'staging', 'dev', 'stage'];
    if (developmentBranches.includes(branchName)) return true;
    
    // Update recent feature branches
    return commitsBehind > 0 && commitsBehind < 100; // Don't update very old branches
  }

  async switchToBranch(branchName) {
    // Check if branch exists locally
    const localExists = await this.execGit(`show-ref --verify --quiet refs/heads/${branchName}`, false);
    
    if (!localExists) {
      // Create local branch from remote
      await this.execGit(`checkout -b ${branchName} ${this.remoteName}/${branchName}`);
    } else {
      await this.execGit(`checkout ${branchName}`);
    }
  }

  async mergeBranchToMain(branchInfo) {
    this.log(`🔄 Merging ${branchInfo.name} to ${this.mainBranch}...`, 'header');
    
    try {
      // Switch to main branch
      await this.execGit(`checkout ${this.mainBranch}`);
      
      // Ensure main is up to date
      await this.execGit(`pull ${this.remoteName} ${this.mainBranch}`);
      
      // Merge the branch
      await this.execGit(`merge --no-ff ${branchInfo.name} -m "Merge branch '${branchInfo.name}' into ${this.mainBranch}"`);
      
      // Push the merge
      await this.execGit(`push ${this.remoteName} ${this.mainBranch}`);
      
      this.log(`✅ Successfully merged ${branchInfo.name} to ${this.mainBranch}`, 'success');
      
      return true;
    } catch (error) {
      this.log(`❌ Failed to merge ${branchInfo.name}: ${error.message}`, 'error');
      return false;
    }
  }

  async updateBranchFromMain(branchInfo) {
    this.log(`⬆️ Updating ${branchInfo.name} from ${this.mainBranch}...`, 'header');
    
    try {
      // Switch to the branch
      await this.switchToBranch(branchInfo.name);
      
      // Merge main into the branch
      await this.execGit(`merge ${this.remoteName}/${this.mainBranch} -m "Update ${branchInfo.name} from ${this.mainBranch}"`);
      
      // Push the updated branch
      if (branchInfo.remoteExists) {
        await this.execGit(`push ${this.remoteName} ${branchInfo.name}`);
      }
      
      this.log(`✅ Successfully updated ${branchInfo.name} from ${this.mainBranch}`, 'success');
      
      return true;
    } catch (error) {
      this.log(`❌ Failed to update ${branchInfo.name}: ${error.message}`, 'error');
      return false;
    }
  }

  async deleteStaleBranch(branchInfo) {
    // Never delete the current working branch
    if (branchInfo.name === this.currentBranch) {
      this.log(`⚠️ Skipping deletion of current working branch: ${branchInfo.name}`, 'warning');
      return false;
    }
    
    this.log(`🗑️ Deleting stale branch ${branchInfo.name}...`, 'warning');
    
    try {
      // Delete local branch if it exists
      if (branchInfo.localExists) {
        await this.execGit(`branch -D ${branchInfo.name}`);
      }
      
      // Delete remote branch if it exists
      if (branchInfo.remoteExists) {
        await this.execGit(`push ${this.remoteName} --delete ${branchInfo.name}`);
      }
      
      this.log(`✅ Successfully deleted stale branch ${branchInfo.name}`, 'success');
      return true;
    } catch (error) {
      this.log(`❌ Failed to delete ${branchInfo.name}: ${error.message}`, 'error');
      return false;
    }
  }

  async analyzeBranches() {
    this.log('🔍 Analyzing all branches...', 'header');
    
    const branches = await this.getBranchList();
    const analysis = {
      totalBranches: branches.length,
      toMerge: [],
      toUpdate: [],
      stale: [],
      upToDate: [],
      errors: []
    };

    for (const branchName of branches) {
      const branchInfo = await this.getBranchInfo(branchName);
      
      if (!branchInfo) {
        analysis.errors.push(branchName);
        continue;
      }

      if (branchInfo.isStale && branchInfo.commitsAheadMain === 0) {
        analysis.stale.push(branchInfo);
      } else if (branchInfo.shouldMerge) {
        analysis.toMerge.push(branchInfo);
      } else if (branchInfo.shouldUpdate) {
        analysis.toUpdate.push(branchInfo);
      } else {
        analysis.upToDate.push(branchInfo);
      }
    }

    return analysis;
  }

  async displayAnalysis(analysis) {
    this.log('\n📊 BRANCH ANALYSIS SUMMARY', 'header');
    this.log('='.repeat(50), 'header');
    
    this.log(`\n📈 Total Branches: ${analysis.totalBranches}`, 'info');
    this.log(`🔄 To Merge: ${analysis.toMerge.length}`, 'info');
    this.log(`⬆️ To Update: ${analysis.toUpdate.length}`, 'info');
    this.log(`🗑️ Stale: ${analysis.stale.length}`, 'warning');
    this.log(`✅ Up to Date: ${analysis.upToDate.length}`, 'success');
    this.log(`❌ Errors: ${analysis.errors.length}`, 'error');

    if (analysis.toMerge.length > 0) {
      this.log('\n🔄 BRANCHES TO MERGE TO MAIN:', 'header');
      analysis.toMerge.forEach(branch => {
        this.log(`  • ${branch.name} (+${branch.commitsAheadMain} commits)`, 'info');
      });
    }

    if (analysis.toUpdate.length > 0) {
      this.log('\n⬆️ BRANCHES TO UPDATE FROM MAIN:', 'header');
      analysis.toUpdate.forEach(branch => {
        this.log(`  • ${branch.name} (-${branch.commitsBehindMain} commits)`, 'warning');
      });
    }

    if (analysis.stale.length > 0) {
      this.log('\n🗑️ STALE BRANCHES TO DELETE:', 'warning');
      analysis.stale.forEach(branch => {
        this.log(`  • ${branch.name} (last commit: ${branch.lastCommitDate})`, 'warning');
      });
    }

    if (analysis.errors.length > 0) {
      this.log('\n❌ BRANCHES WITH ERRORS:', 'error');
      analysis.errors.forEach(branch => {
        this.log(`  • ${branch}`, 'error');
      });
    }

    return analysis;
  }

  async executeBranchOperations(analysis) {
    this.log('\n🚀 EXECUTING BRANCH OPERATIONS', 'header');
    this.log('='.repeat(50), 'header');

    const results = {
      merged: [],
      updated: [],
      deleted: [],
      failed: []
    };

    // Store current branch to restore later
    const originalBranch = await this.getCurrentBranch();

    try {
      // Phase 1: Merge branches to main
      for (const branchInfo of analysis.toMerge) {
        const success = await this.mergeBranchToMain(branchInfo);
        if (success) {
          results.merged.push(branchInfo.name);
        } else {
          results.failed.push(branchInfo.name);
        }
      }

      // Phase 2: Update branches from main
      for (const branchInfo of analysis.toUpdate) {
        const success = await this.updateBranchFromMain(branchInfo);
        if (success) {
          results.updated.push(branchInfo.name);
        } else {
          results.failed.push(branchInfo.name);
        }
      }

      // Phase 3: Delete stale branches (optional)
      for (const branchInfo of analysis.stale) {
        const success = await this.deleteStaleBranch(branchInfo);
        if (success) {
          results.deleted.push(branchInfo.name);
        } else {
          results.failed.push(branchInfo.name);
        }
      }

    } finally {
      // Restore original branch
      try {
        if (originalBranch && originalBranch !== await this.getCurrentBranch()) {
          await this.execGit(`checkout ${originalBranch}`);
        }
      } catch (error) {
        this.log(`⚠️ Could not restore original branch ${originalBranch}`, 'warning');
      }
    }

    return results;
  }

  async displayResults(results) {
    this.log('\n🎉 OPERATION RESULTS', 'header');
    this.log('='.repeat(50), 'header');

    this.log(`✅ Merged: ${results.merged.length} branches`, 'success');
    if (results.merged.length > 0) {
      results.merged.forEach(branch => this.log(`  • ${branch}`, 'success'));
    }

    this.log(`⬆️ Updated: ${results.updated.length} branches`, 'success');
    if (results.updated.length > 0) {
      results.updated.forEach(branch => this.log(`  • ${branch}`, 'success'));
    }

    this.log(`🗑️ Deleted: ${results.deleted.length} branches`, 'warning');
    if (results.deleted.length > 0) {
      results.deleted.forEach(branch => this.log(`  • ${branch}`, 'warning'));
    }

    if (results.failed.length > 0) {
      this.log(`❌ Failed: ${results.failed.length} branches`, 'error');
      results.failed.forEach(branch => this.log(`  • ${branch}`, 'error'));
    }

    if (this.dryRun) {
      this.log('\n⚠️ DRY RUN MODE - No actual changes were made', 'warning');
      this.log('Add --execute flag to perform actual operations', 'info');
    }
  }

  async saveReport(analysis, results) {
    const report = {
      timestamp: new Date().toISOString(),
      analysis,
      results,
      dryRun: this.dryRun
    };

    const reportPath = path.join(this.repoPath, 'branch-management-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    this.log(`📄 Report saved to: ${reportPath}`, 'info');
  }

  enableExecutionMode() {
    this.dryRun = false;
    this.log('⚠️ EXECUTION MODE ENABLED - Changes will be made!', 'error');
  }

  async run() {
    try {
      this.log('🌿 Git Branch Manager - Catching all branches up to main', 'header');
      this.log('='.repeat(60), 'header');

      // Get current branch first
      await this.getCurrentBranch();
      this.log(`📍 Current branch: ${this.currentBranch}`, 'info');

      // Fetch latest from remote
      await this.fetchAllBranches();

      // Analyze all branches
      const analysis = await this.analyzeBranches();
      await this.displayAnalysis(analysis);

      // Execute operations
      const results = await this.executeBranchOperations(analysis);
      await this.displayResults(results);

      // Save report
      await this.saveReport(analysis, results);

      this.log('\n🎯 Branch management complete!', 'success');

    } catch (error) {
      this.log(`💥 Fatal error: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const manager = new GitBranchManager();
  
  // Check for execution flag
  if (process.argv.includes('--execute')) {
    manager.enableExecutionMode();
  }
  
  await manager.run();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default GitBranchManager;