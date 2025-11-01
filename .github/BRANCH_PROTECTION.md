# Branch Protection Setup Guide

This document provides step-by-step instructions for setting up branch protection rules to ensure code quality and safe deployments for the Blaze Intelligence repository.

## Why Branch Protection?

Branch protection rules help maintain code quality and prevent accidental or malicious changes to important branches by:

- Requiring code review before merging
- Ensuring all tests pass before deployment
- Preventing force pushes that could rewrite history
- Enforcing a consistent workflow across the team

## Recommended Protection Rules

### Main Branch Protection

The `main` branch should have the following protections enabled:

#### 1. Require Pull Request Reviews

- **Minimum 1 approval required** before merging
- **Dismiss stale pull request approvals when new commits are pushed**
- **Require review from code owners** (if CODEOWNERS file exists)

**Why**: Ensures at least one other team member reviews changes before they go to production.

#### 2. Require Status Checks to Pass

The following status checks should be required before merging:

- `Build` - Ensures the code builds successfully
- `Test Deployment` - Verifies deployment configuration is valid

**Why**: Prevents broken code from being merged and deployed to production.

#### 3. Require Branches to be Up to Date

- **Require branches to be up to date before merging**

**Why**: Ensures the PR has the latest changes from main and there are no conflicts.

#### 4. Disallow Force Pushes

- **Do not allow force pushes**

**Why**: Prevents rewriting Git history which can cause issues for other developers and break deployments.

#### 5. Disallow Deletions

- **Do not allow branch deletion**

**Why**: Prevents accidental deletion of the main branch.

## Setting Up Branch Protection (GitHub Web Interface)

### Step 1: Navigate to Branch Protection Settings

1. Go to your repository on GitHub: `https://github.com/ahump20/BI`
2. Click on **Settings** tab
3. Click on **Branches** in the left sidebar
4. Under "Branch protection rules", click **Add branch protection rule**

### Step 2: Configure Main Branch Protection

1. **Branch name pattern**: Enter `main`

2. **Protect matching branches**: Check the following options:

   - ☑️ **Require a pull request before merging**
     - ☑️ Require approvals: **1**
     - ☑️ Dismiss stale pull request approvals when new commits are pushed
     - ☐ Require review from Code Owners (optional, requires CODEOWNERS file)
     - ☐ Require approval of the most recent reviewable push

   - ☑️ **Require status checks to pass before merging**
     - ☑️ Require branches to be up to date before merging
     - **Status checks that are required:**
       - Search for and add: `build`
       - Search for and add: `deploy` (if applicable)

   - ☑️ **Require conversation resolution before merging**
     - Ensures all PR comments are addressed

   - ☐ **Require signed commits** (optional, for additional security)

   - ☑️ **Require linear history** (optional, prevents merge commits)

   - ☐ **Require merge queue** (optional, for high-traffic repos)

   - ☐ **Require deployments to succeed before merging** (optional)

   - ☑️ **Lock branch** (optional, for read-only branches)

   - ☐ **Do not allow bypassing the above settings** (recommended for enforcing rules)

   - ☑️ **Restrict who can push to matching branches** (optional)
     - Select specific teams or users if needed

3. Click **Create** or **Save changes**

### Step 3: Configure Staging Branch Protection (Optional)

Repeat the above steps for the `staging` branch with potentially relaxed rules:

1. **Branch name pattern**: Enter `staging`
2. Use the same settings as main, or optionally:
   - Reduce minimum approvals to 0 for faster iteration
   - Make status checks optional
   - Keep force push disabled

### Step 4: Verify Protection Rules

1. Go back to **Settings** → **Branches**
2. You should see your protection rules listed
3. Click **Edit** on any rule to modify settings

## Setting Up Branch Protection (GitHub CLI)

If you prefer using the command line, you can set up branch protection using the GitHub CLI:

### Prerequisites

```bash
# Install GitHub CLI if not already installed
# macOS
brew install gh

# Windows
winget install --id GitHub.cli

# Linux
# See https://github.com/cli/cli#installation
```

### Authenticate

```bash
gh auth login
```

### Create Branch Protection Rule for Main

```bash
gh api repos/ahump20/BI/branches/main/protection \
  --method PUT \
  --header "Accept: application/vnd.github+json" \
  --field "required_status_checks[strict]=true" \
  --field "required_status_checks[contexts][]=build" \
  --field "required_pull_request_reviews[required_approving_review_count]=1" \
  --field "required_pull_request_reviews[dismiss_stale_reviews]=true" \
  --field "enforce_admins=false" \
  --field "restrictions=null" \
  --field "allow_force_pushes=false" \
  --field "allow_deletions=false" \
  --field "required_conversation_resolution=true"
```

### Verify Protection Rule

```bash
gh api repos/ahump20/BI/branches/main/protection
```

## Workflow with Branch Protection

With branch protection enabled, the typical workflow is:

### For Contributors

```bash
# 1. Create a feature branch
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "Add new feature"

# 3. Push to GitHub
git push origin feature/my-feature

# 4. Create Pull Request on GitHub
# - Go to repository on GitHub
# - Click "Compare & pull request"
# - Fill in PR title and description
# - Request review from team member

# 5. Wait for:
#    - Approval from reviewer
#    - All status checks to pass (build, tests)
#    - Any requested changes to be addressed

# 6. Merge the PR (Squash and merge recommended)
# - GitHub will automatically trigger deployment
```

### For Reviewers

1. **Review the code changes**
   - Check for bugs, security issues, code quality
   - Ensure tests are added for new features
   - Verify documentation is updated

2. **Test locally if needed**
   ```bash
   git fetch origin
   git checkout feature/my-feature
   npm ci
   npm run build
   npm run serve
   ```

3. **Request changes or approve**
   - Click "Review changes" on PR
   - Select "Request changes" or "Approve"
   - Add comments explaining feedback

4. **Verify status checks pass**
   - All required checks should be green ✅
   - If checks fail, ask contributor to fix

## Bypassing Protection Rules (Emergency Only)

In rare emergencies, administrators may need to bypass protection rules:

### Temporary Disable (Not Recommended)

1. Go to **Settings** → **Branches**
2. Click **Edit** on the protection rule
3. Uncheck protections temporarily
4. Make emergency changes
5. **Immediately re-enable** all protections

### Better Approach: Hotfix Branch

```bash
# Create hotfix branch from main
git checkout -b hotfix/critical-fix main

# Make minimal fix
git add .
git commit -m "Hotfix: Fix critical production issue"

# Push and create PR
git push origin hotfix/critical-fix

# Get expedited review
# Merge immediately after approval
```

## Testing Branch Protection

After setting up branch protection, test it works:

### Test 1: Direct Push to Main (Should Fail)

```bash
git checkout main
echo "test" >> test.txt
git add test.txt
git commit -m "Test direct push"
git push origin main
# Should fail with: "protected branch hook declined"
```

### Test 2: PR Without Approval (Should Block)

1. Create feature branch and PR
2. Try to merge without approval
3. Merge button should be disabled with message about required reviews

### Test 3: PR Without Status Checks (Should Block)

1. Create PR that fails build
2. Try to merge
3. Merge button should be disabled with message about required status checks

## Troubleshooting

### Issue: Can't merge PR even with approval

**Possible causes:**
- Status checks haven't passed yet (wait for green checkmark)
- Branch is not up to date (click "Update branch" button)
- Required conversation not resolved (resolve all comments)

### Issue: Status checks not showing up

**Solution:**
1. Ensure workflow file is on the main branch
2. Check workflow is configured to run on pull_request events
3. Check "Status checks that are required" has exact job name
4. Re-run the workflow if needed

### Issue: Can't push to main branch

**This is expected behavior!** Use the PR workflow:
1. Create a feature branch
2. Push changes to feature branch
3. Open PR to main
4. Get approval and merge

### Issue: Need to disable protection temporarily

**Only administrators can do this:**
1. Settings → Branches → Edit rule
2. Uncheck protections
3. Make changes
4. **Immediately re-enable protections**

## Best Practices

1. **Always use pull requests** - Even for small changes
2. **Review thoroughly** - Take time to understand changes
3. **Test locally when possible** - Don't rely solely on CI
4. **Keep PRs small** - Easier to review and less risky
5. **Write good commit messages** - Help reviewers understand changes
6. **Add tests** - Every feature should have tests
7. **Update documentation** - Keep docs in sync with code
8. **Resolve conflicts carefully** - Test after resolving merge conflicts

## Additional Resources

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Pull Requests](https://docs.github.com/en/pull-requests)
- [Code Review Best Practices](https://google.github.io/eng-practices/review/)

## Support

For questions or issues with branch protection:

- **GitHub Issues**: Open an issue in this repository
- **Team Discussion**: Ask in team chat or standup
- **Documentation**: Refer to GitHub's official documentation
- **Administrator**: Contact repository administrator for permission issues

---

**Last Updated**: November 2024  
**Review Status**: Ready for Implementation
