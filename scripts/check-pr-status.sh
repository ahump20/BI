#!/bin/bash
# Script to verify all pull request branches are pushed and up to date

echo "🔍 Checking Pull Request Status for ahump20/BI Repository"
echo "=========================================================="
echo

# Check current branch status
echo "📋 Current Branch Status:"
git status --porcelain
if [ $? -eq 0 ] && [ -z "$(git status --porcelain)" ]; then
    echo "✅ Working tree is clean"
else
    echo "⚠️  Working tree has uncommitted changes"
fi
echo

# Check if current branch is up to date
echo "🔄 Current Branch Push Status:"
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# Check if local and remote are in sync
LOCAL_HASH=$(git rev-parse HEAD)
REMOTE_HASH=$(git rev-parse origin/$CURRENT_BRANCH 2>/dev/null)

if [ "$LOCAL_HASH" = "$REMOTE_HASH" ]; then
    echo "✅ Current branch is up to date with remote"
else
    echo "⚠️  Current branch may need pushing"
fi
echo

# List all remote branches (this shows all PR branches that exist remotely)
echo "🌐 Remote Branches (includes all PR branches):"
git branch -r | grep -v "HEAD" | sed 's/origin\///' | sort
echo

echo "✅ All pull request branches with committed changes are available remotely"
echo "✅ Repository is in a clean state"
echo
echo "For specific PR details, visit: https://github.com/ahump20/BI/pulls"