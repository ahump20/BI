# Cloudflare Pages Deployment Guide

This guide covers deploying the Blaze Intelligence platform to Cloudflare Pages using GitHub Actions.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Required Secrets](#required-secrets)
- [Setting Up Secrets](#setting-up-secrets)
- [Deployment Flow](#deployment-flow)
- [Branch Strategy](#branch-strategy)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying to Cloudflare Pages, ensure you have:

1. **Cloudflare Account**: Sign up at [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Cloudflare Pages Project**: Create a new Pages project in your Cloudflare dashboard
3. **GitHub Repository Access**: Admin access to set up secrets and workflows
4. **Node.js 20+**: For local development and testing

## Required Secrets

The GitHub Actions workflow requires three secrets to be configured:

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `CLOUDFLARE_API_TOKEN` | API token with Pages and Workers permissions | Cloudflare Dashboard → My Profile → API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account identifier | Cloudflare Dashboard → Workers & Pages → Overview (right sidebar) |
| `CLOUDFLARE_PAGES_PROJECT` | The name of your Cloudflare Pages project | The project name you created (e.g., "blaze-intelligence") |

### Creating a Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click on your profile icon → **My Profile** → **API Tokens**
3. Click **Create Token**
4. Use the **Edit Cloudflare Workers** template or create a custom token with these permissions:
   - **Account** → **Cloudflare Pages** → **Edit**
   - **Account** → **Workers Scripts** → **Edit** (if deploying Workers)
5. Set the **Account Resources** to include your account
6. Create the token and **copy it immediately** (you won't be able to see it again)

### Finding Your Account ID

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages**
3. Your Account ID is displayed in the right sidebar under **Account details**

## Setting Up Secrets

### Option 1: Using GitHub Web Interface

1. Navigate to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each of the three required secrets:
   - Name: `CLOUDFLARE_API_TOKEN`
     - Value: Your Cloudflare API token
   - Name: `CLOUDFLARE_ACCOUNT_ID`
     - Value: Your Cloudflare account ID
   - Name: `CLOUDFLARE_PAGES_PROJECT`
     - Value: Your Pages project name (e.g., "blaze-intelligence")

### Option 2: Using GitHub CLI (`gh`)

If you have the [GitHub CLI](https://cli.github.com/) installed:

```bash
# Set CLOUDFLARE_API_TOKEN
gh secret set CLOUDFLARE_API_TOKEN --body "your-cloudflare-api-token-here"

# Set CLOUDFLARE_ACCOUNT_ID
gh secret set CLOUDFLARE_ACCOUNT_ID --body "your-account-id-here"

# Set CLOUDFLARE_PAGES_PROJECT
gh secret set CLOUDFLARE_PAGES_PROJECT --body "blaze-intelligence"
```

### Verifying Secrets

After adding secrets, verify they're set correctly:

```bash
gh secret list
```

You should see all three secrets listed (values will be hidden for security).

## Deployment Flow

### Automatic Deployments

The workflow automatically deploys when:

1. **Production Deployment**: Code is pushed to the `main` branch
   - Triggers a production deployment to Cloudflare Pages
   - Environment: `production`
   - URL: Your custom domain or `*.pages.dev`

2. **Staging Deployment**: Code is pushed to the `staging` branch
   - Triggers a staging deployment to Cloudflare Pages
   - Environment: `staging`
   - URL: `staging` branch preview URL

3. **PR Validation**: Pull request is opened targeting `main`
   - Runs build and validation only (no deployment)
   - Ensures code builds successfully before merge

### Manual Deployments

You can trigger a manual deployment:

1. Go to **Actions** tab in your GitHub repository
2. Select **Deploy to Cloudflare Pages** workflow
3. Click **Run workflow**
4. Select the branch to deploy
5. Click **Run workflow** button

### Deployment Steps

Each deployment follows these steps:

```
1. Checkout code
2. Setup Node.js 20
3. Install dependencies (npm ci)
4. Build production assets (npm run build)
5. Upload build artifacts
6. Download artifacts in deploy job
7. Deploy to Cloudflare Pages with wrangler
8. Test deployment health
```

### Build Output

The build process creates:
- `dist/` directory with compiled assets
- Static HTML, CSS, and JavaScript files
- Optimized images and assets
- Configuration files (`_headers`, `_redirects`)

## Branch Strategy

### Main Branch (`main`)
- **Production environment**
- Requires PR approval before merge
- Deploys automatically on push
- Protected with branch protection rules

### Staging Branch (`staging`)
- **Staging/preview environment**
- Used for testing before production
- Deploys automatically on push
- Can be used for QA and client review

### Feature Branches
- Development work happens here
- Create PR to `main` when ready
- Build validation runs on PR creation
- No automatic deployment

### Recommended Workflow

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "Add new feature"

# 3. Push to GitHub
git push origin feature/my-feature

# 4. Create PR to main
# - GitHub Actions will validate build
# - Request review from team member

# 5. After approval, merge PR
# - Automatic deployment to production

# 6. Delete feature branch
git branch -d feature/my-feature
git push origin --delete feature/my-feature
```

## Rollback Procedures

### Quick Rollback (Recommended)

If a deployment causes issues, use Cloudflare's built-in rollback:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → Your project
3. Click on **Deployments** tab
4. Find the previous working deployment
5. Click **⋯** (three dots) → **Rollback to this deployment**
6. Confirm the rollback

This is the fastest way to restore service.

### Git Revert

To revert the last commit and redeploy:

```bash
# 1. Revert the problematic commit
git revert HEAD

# 2. Push to trigger new deployment
git push origin main

# This creates a new commit that undoes the changes
# The deployment will automatically trigger
```

### Git Reset (Use with Caution)

For more significant issues, reset to a known good commit:

```bash
# 1. Find the last good commit
git log --oneline

# 2. Reset to that commit (example: abc123)
git reset --hard abc123

# 3. Force push to trigger deployment
# WARNING: This rewrites history
git push --force origin main
```

⚠️ **Warning**: Force push should only be used in emergencies and requires temporarily disabling branch protection.

### Rollback Checklist

After any rollback:

- [ ] Verify the site is working correctly
- [ ] Check all critical functionality
- [ ] Review error logs in Cloudflare dashboard
- [ ] Notify team of the rollback
- [ ] Create incident post-mortem
- [ ] Fix the issue in a new branch
- [ ] Test thoroughly before redeploying

## Troubleshooting

### Common Issues and Solutions

#### 1. Build Fails with "npm ci" Error

**Problem**: Dependencies fail to install

**Solution**:
```bash
# Locally, regenerate package-lock.json
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push
```

#### 2. Build Fails with "npm run build" Error

**Problem**: Build script fails

**Solution**:
- Check build logs in GitHub Actions
- Test build locally: `npm run build`
- Ensure all required files are committed
- Check for missing environment variables

#### 3. Deployment Fails with "Unauthorized" Error

**Problem**: Invalid or missing Cloudflare API token

**Solution**:
1. Verify `CLOUDFLARE_API_TOKEN` secret is set correctly
2. Check token hasn't expired
3. Ensure token has correct permissions:
   - Cloudflare Pages - Edit
   - Workers Scripts - Edit (if applicable)
4. Regenerate token if needed

#### 4. Deployment Fails with "Project not found" Error

**Problem**: Cloudflare Pages project doesn't exist or name is wrong

**Solution**:
1. Verify project exists in Cloudflare Dashboard
2. Check `CLOUDFLARE_PAGES_PROJECT` secret matches exact project name
3. Ensure `CLOUDFLARE_ACCOUNT_ID` is correct

#### 5. Site Returns 404 After Deployment

**Problem**: Build output directory is incorrect

**Solution**:
- Ensure build outputs to `dist/` directory
- Check `wrangler.toml` has correct `pages_build_output_dir`
- Verify all necessary files are in build output
- Check `_redirects` file for routing rules

#### 6. Environment Variables Not Working

**Problem**: Application can't access environment variables

**Solution**:
- For build-time variables: Add to workflow `env` section
- For runtime variables: Set in Cloudflare Dashboard → Pages → Settings → Environment variables
- Remember: Secrets in GitHub Actions are separate from Cloudflare environment variables

#### 7. Deployment Succeeds But Site Doesn't Update

**Problem**: Cached version being served

**Solution**:
1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Check Cloudflare cache settings
3. Verify deployment actually completed in Cloudflare dashboard
4. Wait a few minutes for CDN propagation

#### 8. Custom Domain Not Working

**Problem**: Site doesn't load on custom domain

**Solution**:
1. Add custom domain in Cloudflare Pages settings
2. Add DNS records as instructed by Cloudflare
3. Wait for DNS propagation (can take up to 48 hours)
4. Verify SSL certificate is provisioned

### Debugging Tips

#### Check Workflow Logs

1. Go to **Actions** tab in GitHub
2. Click on the failed workflow run
3. Expand failed job step to see detailed logs
4. Look for error messages and stack traces

#### Check Cloudflare Logs

1. Go to Cloudflare Dashboard
2. Navigate to your Pages project
3. Click on the failed deployment
4. Review build logs and deployment output

#### Test Locally

Always test changes locally before pushing:

```bash
# Install dependencies
npm ci

# Run build
npm run build

# Serve locally
npm run serve

# Open http://localhost:8000
```

#### Validate Workflow YAML

Use GitHub's workflow validator:

```bash
# Install actionlint
brew install actionlint  # macOS
# or download from https://github.com/rhysd/actionlint

# Validate workflow
actionlint .github/workflows/deploy-cloudflare-pages.yml
```

### Getting Help

If you encounter issues not covered here:

1. **Check Cloudflare Documentation**: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages/)
2. **GitHub Actions Docs**: [docs.github.com/actions](https://docs.github.com/en/actions)
3. **Cloudflare Community**: [community.cloudflare.com](https://community.cloudflare.com/)
4. **GitHub Issues**: Open an issue in this repository
5. **Support Email**: austin@blazesportsintel.com

## Best Practices

1. **Always test locally** before pushing to production
2. **Use staging branch** for testing significant changes
3. **Review PR builds** to catch issues early
4. **Monitor deployments** in real-time via Cloudflare dashboard
5. **Keep secrets secure** - never commit them to the repository
6. **Document changes** in commit messages and PR descriptions
7. **Set up monitoring** and alerts for production deployments
8. **Have a rollback plan** before each deployment

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Repository Root DEPLOYMENT.md](../DEPLOYMENT.md) - Alternative deployment methods (Netlify, Docker, etc.)

---

**Last Updated**: November 2024  
**Maintained by**: Blaze Intelligence Team
