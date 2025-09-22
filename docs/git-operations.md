# Git Operations Documentation

## Overview

The Git Operations Manager provides a comprehensive suite of tools for managing git workflows in the Blaze Intelligence Platform. It handles commit, pull, push, and rebase operations to the main branch with built-in safety features and automation.

## Features

- **Safety First**: All operations run in dry-run mode by default
- **Auto-stashing**: Automatically stashes and restores uncommitted changes
- **Branch Management**: Intelligent handling of main branch operations
- **Backup Creation**: Creates backup branches before destructive operations
- **Error Handling**: Comprehensive error handling with rollback capabilities
- **NPM Integration**: Convenient npm scripts for common operations

## Installation

The git operations functionality is already integrated into the project. No additional installation required.

## Usage

### NPM Scripts (Recommended)

```bash
# Check git status and current branch
npm run git:status

# Commit changes (with confirmation)
npm run git:commit "Your commit message"

# Pull latest from main branch
npm run git:pull

# Push current branch to origin
npm run git:push

# Rebase current branch onto main
npm run git:rebase

# Full sync: commit + pull + rebase + push (safe mode)
npm run git:sync-safe

# Full sync with execution
npm run git:sync

# Show help
npm run git:help
```

### Direct Script Usage

```bash
# Show help and available commands
node scripts/git-operations.js

# Check status (always safe)
node scripts/git-operations.js status

# Commit changes (dry run by default)
node scripts/git-operations.js commit "Your commit message"

# Execute commit (with --execute flag)
node scripts/git-operations.js commit "Your commit message" --execute

# Full sync workflow (dry run)
node scripts/git-operations.js sync "Auto-sync changes"

# Full sync with execution
node scripts/git-operations.js sync "Auto-sync changes" --execute
```

## Operations

### 1. Status Check

Shows current branch and git status:

```bash
npm run git:status
```

**Output:**
- Current branch name
- List of modified, staged, and untracked files
- Working tree status

### 2. Commit

Stages and commits all changes with the provided message:

```bash
node scripts/git-operations.js commit "Add new feature" --execute
```

**Process:**
1. Checks current branch
2. Stages all changes (`git add .`)
3. Creates commit with provided message
4. Reports success or failure

### 3. Pull

Pulls latest changes from the main branch:

```bash
npm run git:pull
```

**Process:**
1. Switches to main branch (if not already there)
2. Stashes uncommitted changes (if any)
3. Pulls from `origin/main`
4. Restores stashed changes

### 4. Push

Pushes current branch to origin:

```bash
npm run git:push
```

**Process:**
1. Verifies current branch
2. Pushes to origin with same branch name
3. Option for force push with `--force` flag

### 5. Rebase

Rebases current branch onto main:

```bash
npm run git:rebase
```

**Process:**
1. Creates backup branch
2. Stashes uncommitted changes
3. Fetches latest changes
4. Rebases onto `origin/main`
5. Restores stashed changes

### 6. Full Sync

Complete workflow for syncing with main branch:

```bash
npm run git:sync
```

**Process:**
1. Commits any uncommitted changes
2. Pulls latest from main
3. Rebases current branch (if not on main)
4. Pushes changes to origin

## Safety Features

### Dry Run Mode

All operations run in dry-run mode by default. Add `--execute` flag to perform actual operations:

```bash
# Safe preview
node scripts/git-operations.js commit "My changes"

# Actual execution
node scripts/git-operations.js commit "My changes" --execute
```

### Auto-stashing

Automatically stashes uncommitted changes before destructive operations and restores them afterward.

### Backup Branches

Before rebasing, creates backup branches with timestamp:
- Format: `backup/{current-branch}-{timestamp}`
- Example: `backup/feature-branch-2024-01-15T10-30-00-000Z`

### Error Handling

- Validates git repository before operations
- Checks for conflicts and provides clear error messages
- Automatically restores stashed changes on failures
- Provides rollback options for failed operations

## Configuration Options

### Command Line Flags

- `--execute`: Enable actual execution (default: dry run)
- `--verbose`: Show detailed command output
- `--force`: Force push operations (use with caution)
- `--no-stash`: Disable auto-stashing
- `--branch <name>`: Specify target branch (default: main)

### Examples with Options

```bash
# Verbose output with execution
node scripts/git-operations.js sync --execute --verbose

# Force push (dangerous)
node scripts/git-operations.js push --execute --force

# Disable auto-stashing
node scripts/git-operations.js rebase --execute --no-stash

# Target different branch
node scripts/git-operations.js pull --execute --branch develop
```

## Integration with Blaze Intelligence Platform

### Package.json Scripts

The git operations are integrated into the project's npm scripts:

```json
{
  "scripts": {
    "git:status": "node scripts/git-operations.js status",
    "git:commit": "node scripts/git-operations.js commit",
    "git:pull": "node scripts/git-operations.js pull --execute",
    "git:push": "node scripts/git-operations.js push --execute",
    "git:rebase": "node scripts/git-operations.js rebase --execute",
    "git:sync": "node scripts/git-operations.js sync --execute",
    "git:sync-safe": "node scripts/git-operations.js sync",
    "git:help": "node scripts/git-operations.js"
  }
}
```

### Workflow Integration

This tool integrates with the existing Blaze Intelligence workflow:

1. **Development**: Use `npm run git:status` to check changes
2. **Staging**: Use `npm run git:commit` to stage changes
3. **Synchronization**: Use `npm run git:sync` for full workflow
4. **Deployment**: Integrates with existing deployment scripts

## Error Scenarios and Solutions

### Common Issues

1. **Merge Conflicts**
   - Script detects conflicts during pull/rebase
   - Provides clear error message
   - Restores stashed changes
   - User must resolve conflicts manually

2. **Uncommitted Changes**
   - Auto-stashing handles this automatically
   - Changes are restored after operations
   - Can be disabled with `--no-stash`

3. **Network Issues**
   - Operations fail gracefully
   - No partial state changes
   - Clear error reporting

4. **Branch Not Found**
   - Validates branch existence before operations
   - Creates local main branch from remote if needed
   - Clear error messages for missing branches

### Recovery Procedures

If operations fail:

1. Check `git status` to see current state
2. Look for backup branches: `git branch | grep backup`
3. Restore from backup if needed: `git checkout backup/branch-name`
4. Check stash: `git stash list`
5. Restore stashed changes: `git stash pop`

## Best Practices

### Development Workflow

1. Start with status check: `npm run git:status`
2. Review changes before committing
3. Use descriptive commit messages
4. Test in dry-run mode first
5. Use full sync for complete workflow

### Branch Management

1. Always work on feature branches
2. Use rebase to keep history clean
3. Create backups before destructive operations
4. Regular sync with main branch

### Safety Guidelines

1. Always preview with dry-run mode
2. Commit frequently with descriptive messages
3. Pull before pushing
4. Use backup branches for experimental work
5. Test operations in development environment first

## Troubleshooting

### Permission Issues

```bash
# If you get permission errors
chmod +x scripts/git-operations.js
```

### Module Issues

Ensure package.json has:
```json
{
  "type": "module"
}
```

### Git Configuration

Ensure git is properly configured:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Support

For issues or questions:

1. Check the help output: `npm run git:help`
2. Review error messages carefully
3. Check git status: `npm run git:status`
4. Create GitHub issue for bugs
5. Contact development team for assistance

---

**Built for Blaze Intelligence Platform**  
*Professional git workflow automation with safety and reliability*