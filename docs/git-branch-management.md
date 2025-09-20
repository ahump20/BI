# Git Branch Management Guide

## Overview

The Git Branch Manager automates the process of catching all branches up to the main branch and managing repository branch lifecycle. This tool helps maintain a clean, organized Git repository by:

- **Merging**: Feature branches with new commits into main
- **Updating**: Branches that are behind main to stay current
- **Cleaning**: Stale branches that are no longer needed

## Quick Start

### View Branch Analysis (Dry Run)
```bash
npm run catch-branches
# or
npm run sync-branches
```

### Execute Branch Operations
```bash
npm run catch-branches-execute
# or 
npm run merge-to-main
```

## Commands

| Command | Description | Safety |
|---------|-------------|---------|
| `npm run catch-branches` | Analyze branches and show what would be done | Safe (dry-run) |
| `npm run catch-branches-execute` | Execute all branch operations | ⚠️ Makes changes |
| `npm run sync-branches` | Same as catch-branches (alias) | Safe (dry-run) |
| `npm run merge-to-main` | Same as catch-branches-execute (alias) | ⚠️ Makes changes |

## How It Works

### 1. Branch Analysis
The tool analyzes all local and remote branches and categorizes them:

- **To Merge**: Branches with commits ahead of main that should be merged
- **To Update**: Branches behind main that should be updated
- **Stale**: Old branches with no new commits that can be deleted
- **Up to Date**: Branches that are current and need no action

### 2. Merge Criteria
A branch will be automatically merged to main if:
- ✅ It has commits ahead of main
- ✅ It's a feature branch (not development/staging)
- ✅ It's less than 6 months old
- ✅ It's the current working branch (if it has commits)

### 3. Update Criteria  
A branch will be updated from main if:
- ✅ It's behind main
- ✅ It's a development branch (development, staging, dev, stage)
- ✅ It's a recent feature branch (less than 100 commits behind)

### 4. Delete Criteria
A branch will be deleted if:
- ✅ It's older than 3 months
- ✅ It has no commits ahead of main
- ✅ It's not the current working branch

## Safety Features

### Dry Run Mode
By default, all commands run in **dry-run mode** and show what would be done without making actual changes.

### Current Branch Protection
The tool never deletes or modifies the current working branch you're on.

### Backup Reports
Every run generates a detailed JSON report saved as `branch-management-report.json`.

### Error Handling
If any operation fails, it continues with other branches and reports all errors at the end.

## Branch Management Workflow

### For Feature Development
```bash
# 1. Start with analyzing current state
npm run catch-branches

# 2. If your current branch should be merged
npm run catch-branches-execute

# 3. This will merge your branch to main and update other branches
```

### For Repository Maintenance
```bash
# 1. Analyze all branches
npm run catch-branches

# 2. Review the output and execute if satisfied
npm run catch-branches-execute
```

### For Continuous Integration
```bash
# Safe analysis that can run in CI
npm run catch-branches

# Generate reports for review
cat branch-management-report.json
```

## Example Output

```
🌿 Git Branch Manager - Catching all branches up to main
============================================================
📍 Current branch: feature/new-analytics
📡 Fetching all branches from remote...
✅ Fetch complete

📊 BRANCH ANALYSIS SUMMARY
==================================================
📈 Total Branches: 5
🔄 To Merge: 2
⬆️ To Update: 1  
🗑️ Stale: 1
✅ Up to Date: 1

🔄 BRANCHES TO MERGE TO MAIN:
  • feature/new-analytics (+3 commits)
  • feature/bug-fixes (+1 commits)

⬆️ BRANCHES TO UPDATE FROM MAIN:
  • development (-5 commits)

🗑️ STALE BRANCHES TO DELETE:
  • old-feature-branch (last commit: 2024-03-15)
```

## Integration with Blaze Intelligence

This tool integrates with the existing Blaze Intelligence automation system:

- Uses the same patterns as `github-cleanup` and `github-analyze`
- Follows the established npm script conventions
- Generates reports compatible with other automation tools
- Respects the repository's branching strategy

## Troubleshooting

### Common Issues

**"Branch doesn't exist" errors:**
- Ensure you've run `git fetch --all` recently
- Check that branch names are correct

**"Permission denied" errors:**
- Verify you have push access to the repository
- Check that your GitHub credentials are configured

**"Merge conflicts" errors:**
- The tool stops on conflicts and requires manual resolution
- Resolve conflicts manually and re-run the tool

### Getting Help

1. Check the generated `branch-management-report.json` for detailed error information
2. Run with dry-run mode first to understand what will happen
3. Review the console output for specific error messages

## Advanced Usage

### Custom Configuration

The tool uses sensible defaults but can be customized by modifying `scripts/git-branch-manager.js`:

```javascript
// Adjust time thresholds
isBranchStale(lastCommitDate) {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3); // Change to 6 for stricter
  return commitDate < threeMonthsAgo;
}

// Modify merge criteria
shouldMergeBranch(branchName, commitsAhead, lastCommitDate) {
  // Add custom logic here
}
```

### Integration with CI/CD

Add to your GitHub Actions workflow:

```yaml
- name: Analyze Branches
  run: npm run catch-branches

- name: Execute Branch Management
  run: npm run catch-branches-execute
  if: github.ref == 'refs/heads/main'
```

## Best Practices

1. **Always run dry-run first** to review what will happen
2. **Review the analysis output** before executing changes
3. **Backup important branches** before large cleanup operations
4. **Use descriptive branch names** to help the tool categorize correctly
5. **Regular maintenance** - run weekly to keep repository clean

---

*Part of the Blaze Intelligence Platform - Professional Git workflow automation*