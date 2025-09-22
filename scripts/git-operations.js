#!/usr/bin/env node

/**
 * Git Operations Manager
 * Comprehensive git workflow automation for Blaze Intelligence Platform
 * Handles commit, pull, push, and rebase operations to main branch
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';

class GitOperations {
  constructor(options = {}) {
    this.dryRun = options.dryRun !== false; // Default to dry run for safety
    this.verbose = options.verbose || false;
    this.autoStash = options.autoStash !== false; // Auto-stash by default
    this.mainBranch = options.mainBranch || 'main';
    this.currentBranch = null;
    this.repoPath = process.cwd();
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[34m',    // blue
      success: '\x1b[32m', // green
      warning: '\x1b[33m', // yellow
      error: '\x1b[31m',   // red
      action: '\x1b[36m'   // cyan
    };
    const reset = '\x1b[0m';
    
    const prefix = this.dryRun ? '[DRY RUN] ' : '';
    console.log(`${colors[type] || colors.info}${prefix}${message}${reset}`);
  }

  async executeCommand(command, options = {}) {
    this.log(`Executing: ${command}`, 'action');
    
    if (this.dryRun && !options.allowInDryRun) {
      this.log(`Would execute: ${command}`, 'warning');
      return { stdout: '', stderr: '', success: true };
    }

    try {
      const result = execSync(command, {
        cwd: this.repoPath,
        encoding: 'utf8',
        stdio: this.verbose ? 'inherit' : 'pipe',
        ...options
      });
      
      return { stdout: result, stderr: '', success: true };
    } catch (error) {
      this.log(`Command failed: ${error.message}`, 'error');
      return { 
        stdout: error.stdout || '', 
        stderr: error.stderr || error.message, 
        success: false,
        error 
      };
    }
  }

  async getCurrentBranch() {
    const result = await this.executeCommand('git branch --show-current', { allowInDryRun: true });
    this.currentBranch = result.stdout.trim();
    return this.currentBranch;
  }

  async getGitStatus() {
    const result = await this.executeCommand('git status --porcelain', { allowInDryRun: true });
    return result.stdout.trim();
  }

  async hasUncommittedChanges() {
    const status = await this.getGitStatus();
    return status.length > 0;
  }

  async hasStagedChanges() {
    const result = await this.executeCommand('git diff --cached --name-only', { allowInDryRun: true });
    return result.stdout.trim().length > 0;
  }

  async branchExists(branchName, remote = false) {
    const command = remote 
      ? `git ls-remote --heads origin ${branchName}`
      : `git show-ref --verify --quiet refs/heads/${branchName}`;
    
    const result = await this.executeCommand(command, { allowInDryRun: true });
    return result.success && result.stdout.trim().length > 0;
  }

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupBranch = `backup/${this.currentBranch}-${timestamp}`;
    
    this.log(`Creating backup branch: ${backupBranch}`, 'action');
    return await this.executeCommand(`git branch ${backupBranch}`);
  }

  async stashChanges(message = 'Auto-stash before git operations') {
    if (!(await this.hasUncommittedChanges())) {
      return { success: true, stashed: false };
    }

    this.log(`Stashing uncommitted changes: ${message}`, 'action');
    const result = await this.executeCommand(`git stash push -m "${message}"`);
    return { ...result, stashed: result.success };
  }

  async popStash() {
    this.log('Restoring stashed changes', 'action');
    return await this.executeCommand('git stash pop');
  }

  async switchToMain() {
    const mainExists = await this.branchExists(this.mainBranch);
    const mainExistsRemote = await this.branchExists(this.mainBranch, true);

    if (!mainExists && mainExistsRemote) {
      this.log(`Creating local ${this.mainBranch} branch from remote`, 'action');
      const result = await this.executeCommand(`git checkout -b ${this.mainBranch} origin/${this.mainBranch}`);
      if (!result.success) {
        throw new Error(`Failed to create local ${this.mainBranch} branch`);
      }
    } else if (!mainExists && !mainExistsRemote) {
      throw new Error(`${this.mainBranch} branch does not exist locally or remotely`);
    } else {
      this.log(`Switching to ${this.mainBranch} branch`, 'action');
      const result = await this.executeCommand(`git checkout ${this.mainBranch}`);
      if (!result.success) {
        throw new Error(`Failed to switch to ${this.mainBranch} branch`);
      }
    }
  }

  async commit(message, options = {}) {
    this.log('=== COMMIT OPERATION ===', 'action');
    
    await this.getCurrentBranch();
    this.log(`Current branch: ${this.currentBranch}`, 'info');

    // Check for changes to commit
    const hasStaged = await this.hasStagedChanges();
    const hasUncommitted = await this.hasUncommittedChanges();

    if (!hasStaged && !hasUncommitted) {
      this.log('No changes to commit', 'warning');
      return { success: true, noChanges: true };
    }

    // Stage all changes if requested or if no staged changes
    if (options.addAll || !hasStaged) {
      this.log('Staging all changes', 'action');
      const stageResult = await this.executeCommand('git add .');
      if (!stageResult.success) {
        throw new Error('Failed to stage changes');
      }
    }

    // Create commit
    const commitCommand = `git commit -m "${message}"`;
    const result = await this.executeCommand(commitCommand);
    
    if (result.success) {
      this.log(`Successfully committed: ${message}`, 'success');
    } else {
      throw new Error(`Commit failed: ${result.stderr}`);
    }

    return result;
  }

  async pull(branch = this.mainBranch) {
    this.log('=== PULL OPERATION ===', 'action');
    
    await this.getCurrentBranch();
    
    // Switch to target branch if not already there
    if (this.currentBranch !== branch) {
      await this.switchToMain();
    }

    // Stash changes if needed
    let stashResult = null;
    if (this.autoStash) {
      stashResult = await this.stashChanges('Auto-stash before pull');
    }

    try {
      this.log(`Pulling latest changes from origin/${branch}`, 'action');
      const result = await this.executeCommand(`git pull origin ${branch}`);
      
      if (result.success) {
        this.log(`Successfully pulled from origin/${branch}`, 'success');
      } else {
        throw new Error(`Pull failed: ${result.stderr}`);
      }

      // Restore stashed changes
      if (stashResult && stashResult.stashed) {
        await this.popStash();
      }

      return result;
    } catch (error) {
      // If pull failed and we stashed, restore the stash
      if (stashResult && stashResult.stashed) {
        await this.popStash();
      }
      throw error;
    }
  }

  async push(branch = this.mainBranch, force = false) {
    this.log('=== PUSH OPERATION ===', 'action');
    
    await this.getCurrentBranch();
    
    // Switch to target branch if not already there
    if (this.currentBranch !== branch) {
      await this.switchToMain();
    }

    const pushCommand = force 
      ? `git push --force-with-lease origin ${branch}`
      : `git push origin ${branch}`;
    
    this.log(`Pushing to origin/${branch}${force ? ' (force with lease)' : ''}`, 'action');
    const result = await this.executeCommand(pushCommand);
    
    if (result.success) {
      this.log(`Successfully pushed to origin/${branch}`, 'success');
    } else {
      throw new Error(`Push failed: ${result.stderr}`);
    }

    return result;
  }

  async rebase(targetBranch = this.mainBranch, options = {}) {
    this.log('=== REBASE OPERATION ===', 'action');
    
    await this.getCurrentBranch();
    const sourceBranch = this.currentBranch;
    
    if (sourceBranch === targetBranch) {
      this.log(`Already on ${targetBranch}, no rebase needed`, 'warning');
      return { success: true, noRebaseNeeded: true };
    }

    // Create backup before rebase
    if (options.createBackup !== false) {
      await this.createBackup();
    }

    // Stash changes if needed
    let stashResult = null;
    if (this.autoStash) {
      stashResult = await this.stashChanges('Auto-stash before rebase');
    }

    try {
      // Fetch latest changes
      this.log('Fetching latest changes', 'action');
      await this.executeCommand('git fetch origin');

      // Perform rebase
      this.log(`Rebasing ${sourceBranch} onto ${targetBranch}`, 'action');
      const rebaseCommand = options.interactive 
        ? `git rebase -i origin/${targetBranch}`
        : `git rebase origin/${targetBranch}`;
      
      const result = await this.executeCommand(rebaseCommand);
      
      if (result.success) {
        this.log(`Successfully rebased ${sourceBranch} onto ${targetBranch}`, 'success');
      } else {
        throw new Error(`Rebase failed: ${result.stderr}`);
      }

      // Restore stashed changes
      if (stashResult && stashResult.stashed) {
        await this.popStash();
      }

      return result;
    } catch (error) {
      // If rebase failed and we stashed, restore the stash
      if (stashResult && stashResult.stashed) {
        await this.popStash();
      }
      throw error;
    }
  }

  async fullSync(options = {}) {
    this.log('=== FULL SYNC TO MAIN ===', 'action');
    
    try {
      // 1. Commit current changes if any
      if (await this.hasUncommittedChanges()) {
        const commitMessage = options.commitMessage || 
          `Auto-commit: ${new Date().toISOString().split('T')[0]} changes`;
        await this.commit(commitMessage, { addAll: true });
      }

      // 2. Pull latest from main
      await this.pull(this.mainBranch);

      // 3. If we're not on main, rebase onto main
      await this.getCurrentBranch();
      if (this.currentBranch !== this.mainBranch) {
        await this.rebase(this.mainBranch, options.rebaseOptions || {});
      }

      // 4. Push to main
      await this.push(this.mainBranch, options.force);

      this.log('Full sync completed successfully!', 'success');
      return { success: true };
    } catch (error) {
      this.log(`Full sync failed: ${error.message}`, 'error');
      throw error;
    }
  }

  enableExecution() {
    this.dryRun = false;
    this.log('EXECUTION MODE ENABLED - Changes will be made!', 'warning');
  }

  async validateRepository() {
    try {
      await this.executeCommand('git rev-parse --git-dir', { allowInDryRun: true });
      return true;
    } catch (error) {
      this.log('Not a git repository', 'error');
      return false;
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const operation = args[0];
  
  if (!operation) {
    console.log(`
🎯 Git Operations Manager - Blaze Intelligence Platform

Usage: node git-operations.js <operation> [options]

Operations:
  commit <message>     - Commit changes with message
  pull                 - Pull latest from main branch  
  push                 - Push current branch to origin
  rebase               - Rebase current branch onto main
  sync                 - Full sync: commit + pull + rebase + push
  status               - Show git status and branch info

Options:
  --execute           - Execute changes (default: dry run)
  --verbose           - Verbose output
  --force             - Force push (use with caution)
  --no-stash          - Don't auto-stash changes
  --branch <name>     - Target branch (default: main)

Examples:
  node git-operations.js status
  node git-operations.js commit "Add new feature" --execute
  node git-operations.js sync --execute
  node git-operations.js rebase --execute --branch main
    `);
    process.exit(0);
  }

  const options = {
    dryRun: !args.includes('--execute'),
    verbose: args.includes('--verbose'),
    autoStash: !args.includes('--no-stash'),
    force: args.includes('--force'),
    mainBranch: args.includes('--branch') ? args[args.indexOf('--branch') + 1] : 'main'
  };

  const git = new GitOperations(options);

  // Validate we're in a git repository
  if (!(await git.validateRepository())) {
    console.log('\x1b[31m❌ Not a git repository\x1b[0m');
    process.exit(1);
  }

  try {
    switch (operation) {
      case 'status':
        await git.getCurrentBranch();
        const status = await git.getGitStatus();
        console.log(`\x1b[36mCurrent branch: ${git.currentBranch}\x1b[0m`);
        console.log(`\x1b[36mGit status:\n${status || 'Working tree clean'}\x1b[0m`);
        break;

      case 'commit':
        const message = args[1];
        if (!message) {
          console.log('\x1b[31m❌ Commit message required\x1b[0m');
          process.exit(1);
        }
        await git.commit(message, { addAll: true });
        break;

      case 'pull':
        await git.pull(options.mainBranch);
        break;

      case 'push':
        await git.push(options.mainBranch, options.force);
        break;

      case 'rebase':
        await git.rebase(options.mainBranch);
        break;

      case 'sync':
        const commitMessage = args[1] || `Auto-sync: ${new Date().toISOString().split('T')[0]}`;
        await git.fullSync({ 
          commitMessage,
          force: options.force 
        });
        break;

      default:
        console.log(`\x1b[31m❌ Unknown operation: ${operation}\x1b[0m`);
        process.exit(1);
    }

    console.log('\x1b[32m\n✅ Operation completed successfully!\x1b[0m');
    
    if (git.dryRun) {
      console.log('\x1b[33m\n⚠️ DRY RUN MODE - No changes were made\x1b[0m');
      console.log('\x1b[34mAdd --execute flag to perform actual operations\x1b[0m');
    }

  } catch (error) {
    console.log(`\x1b[31m\n❌ Operation failed: ${error.message}\x1b[0m`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default GitOperations;