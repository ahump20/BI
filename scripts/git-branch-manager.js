#!/usr/bin/env node

/**
 * Git Branch Management Automation
 * Automates merging pull requests and synchronizing branches with main
 * 
 * This tool implements the "catch all branches up to main" functionality
 * by analyzing branch relationships and performing appropriate git operations.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class GitBranchManager {
    constructor(options = {}) {
        this.dryRun = options.dryRun !== false; // Default to dry run
        this.currentBranch = null;
        this.branches = [];
        this.mergeResults = [];
        this.safeBranches = ['main', 'master', 'develop', 'production'];
        
        console.log(`🌿 Git Branch Manager ${this.dryRun ? '(DRY RUN)' : '(EXECUTION MODE)'}`);
    }

    async analyzeBranches() {
        console.log('\n📊 Analyzing branch relationships...');
        
        try {
            // Get current branch
            this.currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
            console.log(`📍 Current branch: ${this.currentBranch}`);

            // Fetch latest changes
            console.log('🔄 Fetching latest changes...');
            if (!this.dryRun) {
                execSync('git fetch --all --prune', { stdio: 'inherit' });
            }

            // Get all branches
            const localBranches = execSync('git branch', { encoding: 'utf8' })
                .split('\n')
                .map(branch => branch.replace(/[*\s]/g, ''))
                .filter(branch => branch && !branch.startsWith('origin/'));

            const remoteBranches = execSync('git branch -r', { encoding: 'utf8' })
                .split('\n')
                .map(branch => branch.trim())
                .filter(branch => branch && !branch.includes('HEAD ->'))
                .map(branch => branch.replace('origin/', ''));

            // Combine and deduplicate
            const allBranches = [...new Set([...localBranches, ...remoteBranches])];
            
            this.branches = await Promise.all(
                allBranches.map(async (branchName) => this.analyzeBranch(branchName))
            );

            console.log(`\n📈 Found ${this.branches.length} branches to analyze`);
            return this.branches;

        } catch (error) {
            console.error('❌ Error analyzing branches:', error.message);
            throw error;
        }
    }

    async analyzeBranch(branchName) {
        if (this.safeBranches.includes(branchName)) {
            return {
                name: branchName,
                action: 'skip',
                reason: 'Protected branch'
            };
        }

        try {
            // Check if branch exists locally
            const branchExists = execSync(`git show-ref --verify --quiet refs/heads/${branchName}`, { 
                stdio: 'ignore' 
            }).code === 0;

            if (!branchExists) {
                // Check out remote branch locally
                if (!this.dryRun) {
                    execSync(`git checkout -b ${branchName} origin/${branchName}`, { stdio: 'ignore' });
                    execSync(`git checkout ${this.currentBranch}`, { stdio: 'ignore' });
                }
            }

            // Get commit comparison with main
            const aheadBehind = execSync(
                `git rev-list --left-right --count main...${branchName}`, 
                { encoding: 'utf8' }
            ).trim().split('\t');

            const commitsAhead = parseInt(aheadBehind[1]) || 0;
            const commitsBehind = parseInt(aheadBehind[0]) || 0;

            // Get last commit date
            const lastCommitDate = new Date(execSync(
                `git log -1 --format=%ci ${branchName}`, 
                { encoding: 'utf8' }
            ).trim());

            const daysSinceLastCommit = Math.floor(
                (new Date() - lastCommitDate) / (1000 * 60 * 60 * 24)
            );

            // Determine action
            let action = 'skip';
            let reason = '';

            if (commitsAhead > 0 && commitsBehind === 0) {
                action = 'merge';
                reason = `${commitsAhead} commits ahead of main`;
            } else if (commitsAhead === 0 && commitsBehind > 0) {
                action = 'delete';
                reason = `${commitsBehind} commits behind, no unique changes`;
            } else if (commitsAhead > 0 && commitsBehind > 0) {
                if (daysSinceLastCommit <= 30) {
                    action = 'update';
                    reason = `Needs merge from main (${commitsBehind} behind, ${commitsAhead} ahead)`;
                } else {
                    action = 'review';
                    reason = `Old diverged branch (${daysSinceLastCommit} days old)`;
                }
            } else if (daysSinceLastCommit > 60) {
                action = 'delete';
                reason = `Stale branch (${daysSinceLastCommit} days old)`;
            }

            // Don't delete current working branch
            if (action === 'delete' && branchName === this.currentBranch) {
                action = 'skip';
                reason = 'Current working branch';
            }

            return {
                name: branchName,
                action,
                reason,
                commitsAhead,
                commitsBehind,
                daysSinceLastCommit,
                lastCommitDate
            };

        } catch (error) {
            return {
                name: branchName,
                action: 'error',
                reason: `Analysis failed: ${error.message}`
            };
        }
    }

    async executeActions() {
        if (this.dryRun) {
            console.log('\n🔍 DRY RUN - Showing planned operations:');
            this.printSummary();
            return;
        }

        console.log('\n🚀 Executing branch operations...');
        
        // First, merge branches with commits ahead
        const toMerge = this.branches.filter(b => b.action === 'merge');
        for (const branch of toMerge) {
            await this.mergeBranch(branch);
        }

        // Then update branches that need main merged in
        const toUpdate = this.branches.filter(b => b.action === 'update');
        for (const branch of toUpdate) {
            await this.updateBranch(branch);
        }

        // Finally, clean up stale branches
        const toDelete = this.branches.filter(b => b.action === 'delete');
        for (const branch of toDelete) {
            await this.deleteBranch(branch);
        }

        this.printResults();
    }

    async mergeBranch(branch) {
        console.log(`🔄 Merging ${branch.name} to main...`);
        
        try {
            // Ensure we're on main
            execSync('git checkout main', { stdio: 'inherit' });
            
            // Pull latest main
            execSync('git pull origin main', { stdio: 'inherit' });
            
            // Merge the branch
            execSync(`git merge --no-ff ${branch.name} -m "Merge branch '${branch.name}' - ${branch.reason}"`, {
                stdio: 'inherit'
            });
            
            // Push changes
            execSync('git push origin main', { stdio: 'inherit' });
            
            this.mergeResults.push({
                branch: branch.name,
                action: 'merged',
                success: true
            });
            
            console.log(`✅ Successfully merged ${branch.name}`);
            
        } catch (error) {
            console.error(`❌ Failed to merge ${branch.name}:`, error.message);
            this.mergeResults.push({
                branch: branch.name,
                action: 'merge_failed',
                success: false,
                error: error.message
            });
        }
    }

    async updateBranch(branch) {
        console.log(`⬆️ Updating ${branch.name} with latest main...`);
        
        try {
            // Checkout branch
            execSync(`git checkout ${branch.name}`, { stdio: 'inherit' });
            
            // Merge main into branch
            execSync('git merge main -m "Update branch with latest main"', { stdio: 'inherit' });
            
            // Push updated branch
            execSync(`git push origin ${branch.name}`, { stdio: 'inherit' });
            
            this.mergeResults.push({
                branch: branch.name,
                action: 'updated',
                success: true
            });
            
            console.log(`✅ Successfully updated ${branch.name}`);
            
        } catch (error) {
            console.error(`❌ Failed to update ${branch.name}:`, error.message);
            this.mergeResults.push({
                branch: branch.name,
                action: 'update_failed',
                success: false,
                error: error.message
            });
        }
    }

    async deleteBranch(branch) {
        console.log(`🗑️ Deleting stale branch ${branch.name}...`);
        
        try {
            // Delete local branch
            execSync(`git branch -D ${branch.name}`, { stdio: 'inherit' });
            
            // Delete remote branch
            execSync(`git push origin --delete ${branch.name}`, { stdio: 'inherit' });
            
            this.mergeResults.push({
                branch: branch.name,
                action: 'deleted',
                success: true
            });
            
            console.log(`✅ Successfully deleted ${branch.name}`);
            
        } catch (error) {
            console.error(`❌ Failed to delete ${branch.name}:`, error.message);
            this.mergeResults.push({
                branch: branch.name,
                action: 'delete_failed',
                success: false,
                error: error.message
            });
        }
    }

    printSummary() {
        const summary = {
            merge: this.branches.filter(b => b.action === 'merge'),
            update: this.branches.filter(b => b.action === 'update'),
            delete: this.branches.filter(b => b.action === 'delete'),
            review: this.branches.filter(b => b.action === 'review'),
            skip: this.branches.filter(b => b.action === 'skip'),
            error: this.branches.filter(b => b.action === 'error')
        };

        console.log('\n📊 BRANCH ANALYSIS SUMMARY');
        console.log(`📈 Total Branches: ${this.branches.length}`);
        console.log(`🔄 To Merge: ${summary.merge.length}`);
        console.log(`⬆️ To Update: ${summary.update.length}`);
        console.log(`🗑️ To Delete: ${summary.delete.length}`);
        console.log(`👁️ Need Review: ${summary.review.length}`);
        console.log(`⏭️ Skip: ${summary.skip.length}`);
        console.log(`❌ Errors: ${summary.error.length}`);

        if (summary.merge.length > 0) {
            console.log('\n🔄 BRANCHES TO MERGE:');
            summary.merge.forEach(b => {
                console.log(`  • ${b.name} - ${b.reason}`);
            });
        }

        if (summary.update.length > 0) {
            console.log('\n⬆️ BRANCHES TO UPDATE:');
            summary.update.forEach(b => {
                console.log(`  • ${b.name} - ${b.reason}`);
            });
        }

        if (summary.delete.length > 0) {
            console.log('\n🗑️ BRANCHES TO DELETE:');
            summary.delete.forEach(b => {
                console.log(`  • ${b.name} - ${b.reason}`);
            });
        }

        if (summary.review.length > 0) {
            console.log('\n👁️ BRANCHES NEEDING REVIEW:');
            summary.review.forEach(b => {
                console.log(`  • ${b.name} - ${b.reason}`);
            });
        }
    }

    printResults() {
        console.log('\n📊 EXECUTION RESULTS');
        
        const successful = this.mergeResults.filter(r => r.success);
        const failed = this.mergeResults.filter(r => !r.success);
        
        console.log(`✅ Successful operations: ${successful.length}`);
        console.log(`❌ Failed operations: ${failed.length}`);

        if (successful.length > 0) {
            console.log('\n✅ SUCCESSFUL OPERATIONS:');
            successful.forEach(r => {
                console.log(`  • ${r.action} ${r.branch}`);
            });
        }

        if (failed.length > 0) {
            console.log('\n❌ FAILED OPERATIONS:');
            failed.forEach(r => {
                console.log(`  • ${r.action} ${r.branch}: ${r.error}`);
            });
        }

        // Return to original branch
        if (this.currentBranch) {
            execSync(`git checkout ${this.currentBranch}`, { stdio: 'inherit' });
        }
    }

    async saveReport() {
        const report = {
            timestamp: new Date().toISOString(),
            mode: this.dryRun ? 'dry-run' : 'execution',
            currentBranch: this.currentBranch,
            branches: this.branches,
            results: this.mergeResults,
            summary: {
                total: this.branches.length,
                merged: this.mergeResults.filter(r => r.action === 'merged').length,
                updated: this.mergeResults.filter(r => r.action === 'updated').length,
                deleted: this.mergeResults.filter(r => r.action === 'deleted').length,
                failed: this.mergeResults.filter(r => !r.success).length
            }
        };

        const reportPath = `branch-management-report-${Date.now()}.json`;
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 Report saved to: ${reportPath}`);
        
        return report;
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    const dryRun = !args.includes('--execute');
    
    const manager = new GitBranchManager({ dryRun });
    
    try {
        await manager.analyzeBranches();
        await manager.executeActions();
        await manager.saveReport();
        
        console.log('\n🎉 Branch management complete!');
        
    } catch (error) {
        console.error('\n💥 Branch management failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default GitBranchManager;