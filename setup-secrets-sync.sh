#!/bin/bash
set -euo pipefail

# One-file script to set up secrets sync workflow
# This creates the branch, workflow, docs, and opens a PR

echo "🚀 Setting up Blaze Intelligence Secrets Sync System"
echo "======================================================"

# Create branch
echo "📌 Creating new branch for secrets sync..."
git checkout -b chore/secrets-sync || {
    echo "Branch already exists, switching to it..."
    git checkout chore/secrets-sync
}

# Create .github/workflows directory if it doesn't exist
mkdir -p .github/workflows
mkdir -p docs

# Create the secrets sync workflow
echo "📝 Creating GitHub Actions workflow..."
cat > .github/workflows/secrets-sync.yml << 'EOF'
name: Secrets Sync
on:
  workflow_dispatch:
    inputs:
      environment:
        description: "Target environment (production|preview)"
        default: "production"
        required: true
        type: choice
        options:
          - production
          - preview
      platforms:
        description: "Comma list: cloudflare,netlify,vercel,github,replit"
        default: "cloudflare,netlify,vercel,github"
        required: true

jobs:
  sync:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
      secrets: write
    env:
      # ---- Provider credentials (set these in GitHub Secrets) ----
      CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
      CF_WORKER_NAME: ${{ secrets.CF_WORKER_NAME }}
      CF_PAGES_PROJECT: ${{ secrets.CF_PAGES_PROJECT }}
      
      NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
      NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
      
      VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
      VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
      VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
      
      GH_TOKEN: ${{ secrets.GH_SYNC_TOKEN || secrets.GITHUB_TOKEN }}
      REPLIT_TOKEN: ${{ secrets.REPLIT_TOKEN }}
      
      # ---- Blaze Intelligence APP SECRETS ----
      # AI Services
      OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      OPENAI_WEBHOOK_SECRET: ${{ secrets.OPENAI_WEBHOOK_SECRET }}
      OPENAI_SERVICE_ACCOUNT_KEY: ${{ secrets.OPENAI_SERVICE_ACCOUNT_KEY }}
      OPENAI_PROJECT_ID: ${{ secrets.OPENAI_PROJECT_ID }}
      
      ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      ANTHROPIC_ADMIN_KEY: ${{ secrets.ANTHROPIC_ADMIN_KEY }}
      ANTHROPIC_ORGANIZATION_ID: ${{ secrets.ANTHROPIC_ORGANIZATION_ID }}
      
      GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
      GEMINI_API_KEY_2: ${{ secrets.GEMINI_API_KEY_2 }}
      GEMINI_API_KEY_3: ${{ secrets.GEMINI_API_KEY_3 }}
      
      XAI_API_KEY: ${{ secrets.XAI_API_KEY }}
      XAI_API_KEY_SECRET: ${{ secrets.XAI_API_KEY_SECRET }}
      XAI_BEARER_TOKEN: ${{ secrets.XAI_BEARER_TOKEN }}
      XAI_ACCESS_TOKEN: ${{ secrets.XAI_ACCESS_TOKEN }}
      XAI_ACCESS_TOKEN_SECRET: ${{ secrets.XAI_ACCESS_TOKEN_SECRET }}
      
      HUGGINGFACE_ACCESS_TOKEN: ${{ secrets.HUGGINGFACE_ACCESS_TOKEN }}
      DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
      
      # Cloudflare R2 Storage
      R2_ACCOUNT_ID: ${{ secrets.R2_ACCOUNT_ID }}
      R2_ACCESS_KEY_ID: ${{ secrets.R2_ACCESS_KEY_ID }}
      R2_SECRET_ACCESS_KEY: ${{ secrets.R2_SECRET_ACCESS_KEY }}
      R2_ENDPOINT: ${{ secrets.R2_ENDPOINT }}
      
      # Sports Data & Analytics
      SPORTSRADAR_ID: ${{ secrets.SPORTSRADAR_ID }}
      SPORTSRADAR_MASTER_API_KEY: ${{ secrets.SPORTSRADAR_MASTER_API_KEY }}
      SPORTSRADAR_VAULT_KEY: ${{ secrets.SPORTSRADAR_VAULT_KEY }}
      
      BLAZE_CLIENT_ID: ${{ secrets.BLAZE_CLIENT_ID }}
      BLAZE_CLIENT_SECRET: ${{ secrets.BLAZE_CLIENT_SECRET }}
      BLAZE_CLIENT_ID_2: ${{ secrets.BLAZE_CLIENT_ID_2 }}
      BLAZE_SECRET_KEY: ${{ secrets.BLAZE_SECRET_KEY }}
      PRODUCTION_API_KEY: ${{ secrets.PRODUCTION_API_KEY }}
      
      # Payment & Financial
      STRIPE_PUBLISHABLE_KEY: ${{ secrets.STRIPE_PUBLISHABLE_KEY }}
      STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
      PLAID_RECOVERY_CODE: ${{ secrets.PLAID_RECOVERY_CODE }}
      
      # Productivity & Collaboration
      CLICKUP_API_TOKEN: ${{ secrets.CLICKUP_API_TOKEN }}
      NOTION_INTEGRATION_SECRET: ${{ secrets.NOTION_INTEGRATION_SECRET }}
      AIRTABLE_API_KEY: ${{ secrets.AIRTABLE_API_KEY }}
      POSTMAN_API_KEY: ${{ secrets.POSTMAN_API_KEY }}
      POSTMAN_ACCESS_KEY: ${{ secrets.POSTMAN_ACCESS_KEY }}
      
      # Integrations
      HUBSPOT_ACCESS_TOKEN: ${{ secrets.HUBSPOT_ACCESS_TOKEN }}
      HUBSPOT_CLIENT_SECRET: ${{ secrets.HUBSPOT_CLIENT_SECRET }}
      ZAPIER_API_KEY: ${{ secrets.ZAPIER_API_KEY }}
      COUPLER_PERSONAL_ACCESS_TOKEN: ${{ secrets.COUPLER_PERSONAL_ACCESS_TOKEN }}
      
      # Authentication & Identity
      AUTH0_MANAGEMENT_API_TOKEN: ${{ secrets.AUTH0_MANAGEMENT_API_TOKEN }}
      
      # Development Tools
      GITHUB_TOKEN_FINE: ${{ secrets.GITHUB_TOKEN_FINE }}
      GITHUB_FINE_GRAINED_TOKEN: ${{ secrets.GITHUB_FINE_GRAINED_TOKEN }}
      GITHUB_CLIENT_SECRET: ${{ secrets.GITHUB_CLIENT_SECRET }}
      SOCKET_DEV_TOKEN: ${{ secrets.SOCKET_DEV_TOKEN }}
      CURSOR_API_KEY: ${{ secrets.CURSOR_API_KEY }}
      SENTRY_PERSONAL_TOKEN: ${{ secrets.SENTRY_PERSONAL_TOKEN }}
      SENTRY_ORGANIZATION_ID: ${{ secrets.SENTRY_ORGANIZATION_ID }}
      NGROK_API_TOKEN: ${{ secrets.NGROK_API_TOKEN }}
      
      # Media & Content
      CLOUDINARY_KEY: ${{ secrets.CLOUDINARY_KEY }}
      WIX_API_KEY: ${{ secrets.WIX_API_KEY }}
      WIX_ACCOUNT_ID: ${{ secrets.WIX_ACCOUNT_ID }}
      CUCUMBER_STUDIO_ACCESS_TOKEN: ${{ secrets.CUCUMBER_STUDIO_ACCESS_TOKEN }}
      CUCUMBER_STUDIO_CLIENT_ID: ${{ secrets.CUCUMBER_STUDIO_CLIENT_ID }}
      CUCUMBER_STUDIO_UID: ${{ secrets.CUCUMBER_STUDIO_UID }}
      
      # AWS
      AWS_ACCOUNT_ID: ${{ secrets.AWS_ACCOUNT_ID }}

    steps:
      - uses: actions/checkout@v4

      - name: Parse inputs
        id: p
        run: |
          echo "ENV_NAME=${{ github.event.inputs.environment }}" >> $GITHUB_OUTPUT
          echo "PLATFORMS=${{ github.event.inputs.platforms }}" >> $GITHUB_OUTPUT

      - name: Prepare secrets.env from declared env
        run: |
          # Write only non-empty env vars into secrets.env
          SECRETS=(
            # AI Services
            OPENAI_API_KEY OPENAI_WEBHOOK_SECRET OPENAI_SERVICE_ACCOUNT_KEY OPENAI_PROJECT_ID
            ANTHROPIC_API_KEY ANTHROPIC_ADMIN_KEY ANTHROPIC_ORGANIZATION_ID
            GEMINI_API_KEY GEMINI_API_KEY_2 GEMINI_API_KEY_3
            XAI_API_KEY XAI_API_KEY_SECRET XAI_BEARER_TOKEN XAI_ACCESS_TOKEN XAI_ACCESS_TOKEN_SECRET
            HUGGINGFACE_ACCESS_TOKEN DEEPSEEK_API_KEY
            
            # Cloudflare R2
            R2_ACCOUNT_ID R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY R2_ENDPOINT
            
            # Sports Data
            SPORTSRADAR_ID SPORTSRADAR_MASTER_API_KEY SPORTSRADAR_VAULT_KEY
            BLAZE_CLIENT_ID BLAZE_CLIENT_SECRET BLAZE_CLIENT_ID_2 BLAZE_SECRET_KEY PRODUCTION_API_KEY
            
            # Payment
            STRIPE_PUBLISHABLE_KEY STRIPE_SECRET_KEY PLAID_RECOVERY_CODE
            
            # Productivity
            CLICKUP_API_TOKEN NOTION_INTEGRATION_SECRET AIRTABLE_API_KEY
            POSTMAN_API_KEY POSTMAN_ACCESS_KEY
            
            # Integrations
            HUBSPOT_ACCESS_TOKEN HUBSPOT_CLIENT_SECRET ZAPIER_API_KEY COUPLER_PERSONAL_ACCESS_TOKEN
            
            # Auth
            AUTH0_MANAGEMENT_API_TOKEN
            
            # Development
            GITHUB_TOKEN_FINE GITHUB_FINE_GRAINED_TOKEN GITHUB_CLIENT_SECRET
            SOCKET_DEV_TOKEN CURSOR_API_KEY SENTRY_PERSONAL_TOKEN SENTRY_ORGANIZATION_ID NGROK_API_TOKEN
            
            # Media
            CLOUDINARY_KEY WIX_API_KEY WIX_ACCOUNT_ID
            CUCUMBER_STUDIO_ACCESS_TOKEN CUCUMBER_STUDIO_CLIENT_ID CUCUMBER_STUDIO_UID
            
            # AWS
            AWS_ACCOUNT_ID
          )
          : > secrets.env
          for k in "${SECRETS[@]}"; do
            v="${!k}"
            if [ -n "$v" ]; then
              printf '%s=%s\n' "$k" "$v" >> secrets.env
            fi
          done
          echo "Generated secrets.env with $(wc -l < secrets.env) entries"

      # ---------- GitHub (repo) ----------
      - name: Sync to GitHub Repo Secrets (optional)
        if: contains(steps.p.outputs.PLATFORMS, 'github')
        run: |
          while IFS='=' read -r k v; do
            gh secret set "$k" --repo "${{ github.repository }}" --body "$v"
          done < secrets.env

      # ---------- Netlify ----------
      - name: Install Netlify CLI
        if: contains(steps.p.outputs.PLATFORMS, 'netlify')
        run: npm i -g netlify-cli

      - name: Sync to Netlify
        if: contains(steps.p.outputs.PLATFORMS, 'netlify')
        run: |
          while IFS='=' read -r k v; do
            netlify env:set "$k" "$v" --site "$NETLIFY_SITE_ID"
          done < secrets.env

      # ---------- Vercel ----------
      - name: Install Vercel CLI
        if: contains(steps.p.outputs.PLATFORMS, 'vercel')
        run: npm i -g vercel

      - name: Sync to Vercel (prod)
        if: contains(steps.p.outputs.PLATFORMS, 'vercel') && steps.p.outputs.ENV_NAME == 'production'
        run: |
          while IFS='=' read -r k v; do
            printf '%s' "$v" | vercel env add "$k" production --token "$VERCEL_TOKEN" --yes
          done < secrets.env

      - name: Sync to Vercel (preview)
        if: contains(steps.p.outputs.PLATFORMS, 'vercel') && steps.p.outputs.ENV_NAME != 'production'
        run: |
          while IFS='=' read -r k v; do
            printf '%s' "$v" | vercel env add "$k" preview --token "$VERCEL_TOKEN" --yes
          done < secrets.env

      # ---------- Cloudflare (Workers/Pages) ----------
      - name: Install Wrangler
        if: contains(steps.p.outputs.PLATFORMS, 'cloudflare')
        run: npm i -g wrangler

      - name: Sync to Cloudflare Workers (secrets)
        if: contains(steps.p.outputs.PLATFORMS, 'cloudflare') && env.CF_WORKER_NAME != ''
        run: |
          while IFS='=' read -r k v; do
            echo "$v" | npx wrangler secret put "$k" --env ${{ steps.p.outputs.ENV_NAME }} --name "$CF_WORKER_NAME"
          done < secrets.env

      - name: Sync to Cloudflare Pages (project secrets)
        if: contains(steps.p.outputs.PLATFORMS, 'cloudflare') && env.CF_PAGES_PROJECT != ''
        run: |
          while IFS='=' read -r k v; do
            npx wrangler pages secret put "$k" --project-name "$CF_PAGES_PROJECT" <<EOF
$v
EOF
          done < secrets.env

      # ---------- Replit (best-effort) ----------
      - name: Write .env for Replit (manual import)
        if: contains(steps.p.outputs.PLATFORMS, 'replit')
        run: |
          cp secrets.env .env
          echo "::notice title=Replit::Wrote .env (import via Replit Secrets UI if needed)."

      - name: Clean up sensitive files
        if: always()
        run: |
          rm -f secrets.env .env
          echo "Cleaned up temporary secret files"
EOF

# Create the documentation
echo "📚 Creating documentation..."
cat > docs/secrets.md << 'EOF'
# Blaze Intelligence Secrets Sync System

## 🔐 Security-First Architecture

This system implements a **single source of truth** pattern where GitHub Secrets are synchronized to all deployment platforms automatically, eliminating manual configuration and reducing security risks.

## 🎯 Supported Platforms

- **Cloudflare** (Workers & Pages)
- **Netlify**
- **Vercel**
- **GitHub** (repo secrets)
- **Replit** (via .env export)

## 📋 Prerequisites

### 1. Platform Credentials (Store in GitHub Secrets)

#### Cloudflare
- `CLOUDFLARE_API_TOKEN` - API token with appropriate permissions
- `CLOUDFLARE_ACCOUNT_ID` - Your account ID (found in dashboard)
- `CF_WORKER_NAME` - Worker name (optional, if using Workers)
- `CF_PAGES_PROJECT` - Pages project name (e.g., "blaze-intelligence")

#### Netlify
- `NETLIFY_AUTH_TOKEN` - Personal access token from User Settings
- `NETLIFY_SITE_ID` - Site ID from Site Settings

#### Vercel
- `VERCEL_TOKEN` - Account token from Settings
- `VERCEL_ORG_ID` - Organization/team ID
- `VERCEL_PROJECT_ID` - Project ID from project settings

#### GitHub (Optional)
- `GH_SYNC_TOKEN` - PAT with repo scope (optional, uses GITHUB_TOKEN by default)

#### Replit (Optional)
- `REPLIT_TOKEN` - Replit API token (manual import often required)

### 2. Application Secrets (Store in GitHub Secrets)

All your application secrets should be added to GitHub Secrets:

#### AI Services
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`
- `XAI_API_KEY`, `HUGGINGFACE_ACCESS_TOKEN`, `DEEPSEEK_API_KEY`

#### Infrastructure
- `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`
- `AWS_ACCOUNT_ID`

#### Sports & Analytics
- `SPORTSRADAR_MASTER_API_KEY`, `BLAZE_CLIENT_ID`, `BLAZE_CLIENT_SECRET`
- `PRODUCTION_API_KEY`

#### Payments
- `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`

#### Integrations
- `NOTION_INTEGRATION_SECRET`, `AIRTABLE_API_KEY`
- `HUBSPOT_ACCESS_TOKEN`, `ZAPIER_API_KEY`

#### Monitoring
- `SENTRY_PERSONAL_TOKEN`, `SENTRY_ORGANIZATION_ID`

## 🚀 Usage

### Manual Sync (via GitHub Actions)

1. Go to **Actions** tab in your GitHub repository
2. Select **Secrets Sync** workflow
3. Click **Run workflow**
4. Configure:
   - **environment**: `production` or `preview`
   - **platforms**: Comma-separated list (e.g., `cloudflare,netlify,vercel,github`)
5. Click **Run workflow**

### Automated Sync (on secret update)

The workflow can be triggered automatically when secrets are updated by adding:

```yaml
on:
  repository_dispatch:
    types: [secrets-updated]
```

## 🔄 How It Works

1. **Collection**: Workflow reads all configured secrets from GitHub Secrets
2. **Filtering**: Only non-empty secrets are processed
3. **Distribution**: Each platform's CLI is used to set environment variables:
   - **Cloudflare**: `wrangler secret put` / `wrangler pages secret put`
   - **Netlify**: `netlify env:set`
   - **Vercel**: `vercel env add`
   - **GitHub**: `gh secret set`
   - **Replit**: Exports `.env` file for manual import

## 🛡️ Security Best Practices

### Immediate Actions Required

⚠️ **CRITICAL**: If any secrets have been exposed:

1. **Rotate all keys immediately**
2. **Update GitHub Secrets with new values**
3. **Run the sync workflow to propagate changes**
4. **Audit access logs on all platforms**

### Ongoing Security

1. **Never commit `.env` files** - Ensure `.gitignore` includes:
   ```
   .env
   .env.*
   *.dev.vars
   *.dev.vars.*
   ```

2. **Use environment-specific secrets** where possible
3. **Rotate keys regularly** (monthly recommended)
4. **Monitor API usage** for unusual activity
5. **Use least privilege** principle for API tokens
6. **Enable 2FA** on all platform accounts

## 🏗️ Platform-Specific Configuration

### Cloudflare Pages

Projects automatically receive secrets on next deployment after sync.

```bash
# Verify secrets are set
npx wrangler pages secret list --project-name=blaze-intelligence
```

### Netlify

Environment variables are available immediately for new builds.

```bash
# Verify secrets are set
netlify env:list --site YOUR_SITE_ID
```

### Vercel

Secrets are applied to the specified environment (production/preview).

```bash
# Verify secrets are set
vercel env ls
```

### GitHub Pages

While GitHub Pages doesn't support runtime secrets, this workflow can set repository secrets used by Actions that deploy to Pages.

### Replit

After sync, import the generated `.env` file through Replit's Secrets UI.

## 🔧 Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure platform tokens have appropriate scopes
2. **Secret Not Found**: Verify secret exists in GitHub Secrets
3. **Sync Fails**: Check workflow logs for specific error messages
4. **Platform Not Updated**: Some platforms cache environment variables

### Verification Commands

```bash
# Check if workflow ran successfully
gh run list --workflow=secrets-sync.yml

# View workflow logs
gh run view [RUN_ID] --log

# List repository secrets (names only)
gh secret list
```

## 📊 Monitoring

Track secret usage and sync status:

1. **GitHub Actions** - Monitor workflow runs
2. **Platform Dashboards** - Check environment variables sections
3. **API Usage** - Monitor rate limits and usage on each platform
4. **Audit Logs** - Review access logs regularly

## 🔄 Recovery Procedures

If secrets are compromised:

1. **Immediate Response**:
   ```bash
   # Disable compromised keys on all platforms
   # Then rotate and update in GitHub Secrets
   ```

2. **Run Emergency Sync**:
   ```bash
   gh workflow run secrets-sync.yml \
     -f environment=production \
     -f platforms=cloudflare,netlify,vercel,github
   ```

3. **Verify Updates**:
   - Check each platform's dashboard
   - Test deployments with new secrets
   - Monitor for unauthorized usage

## 📝 Maintenance

### Weekly
- Review workflow run history
- Check for failed syncs

### Monthly
- Rotate sensitive API keys
- Audit platform access logs
- Update platform tokens if needed

### Quarterly
- Full security audit
- Remove unused secrets
- Update documentation

## 🤝 Contributing

To add new secrets or platforms:

1. Add secret to GitHub Secrets
2. Update workflow file to include new secret in SECRETS array
3. Test sync to all platforms
4. Document in this file

## 📞 Support

For issues with the sync system:
1. Check workflow logs for errors
2. Verify platform credentials are correct
3. Ensure secrets exist in GitHub
4. Contact platform support if platform-specific issues persist

---

**Last Updated**: January 2025
**Maintained By**: Blaze Intelligence DevOps Team
**Security Contact**: security@blaze-intelligence.com
EOF

# Create enhanced .gitignore entries
echo "🔒 Updating .gitignore for security..."
cat >> .gitignore << 'EOF'

# Environment files - NEVER COMMIT
.env
.env.*
.env.local
.env.*.local
*.dev.vars
*.dev.vars.*
.env.master
.env.production
.env.staging
.env.development

# Secret files
secrets.env
*.key
*.pem
*.cert
*.crt
*.p12
*.pfx

# Platform-specific
.vercel/
.netlify/
wrangler.toml.local
EOF

# Add the helper script for adding secrets to GitHub
echo "🔧 Creating GitHub secrets helper script..."
cat > scripts/add-github-secrets.sh << 'EOF'
#!/bin/bash
# Helper script to add secrets to GitHub repository
# Usage: ./add-github-secrets.sh

set -euo pipefail

echo "📝 GitHub Secrets Configuration Helper"
echo "======================================"
echo ""
echo "This script will help you add secrets to GitHub."
echo "You'll need to manually add each secret through the GitHub UI."
echo ""
echo "Go to: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:\/]\(.*\)\.git/\1/')/settings/secrets/actions/new"
echo ""
echo "Add the following secrets:"
echo ""

# Platform Credentials
echo "=== PLATFORM CREDENTIALS ==="
echo "CLOUDFLARE_API_TOKEN"
echo "CLOUDFLARE_ACCOUNT_ID: a12cb329d84130460eed99b816e4d0d3"
echo "CF_PAGES_PROJECT: blaze-intelligence"
echo "NETLIFY_AUTH_TOKEN"
echo "NETLIFY_SITE_ID"
echo "VERCEL_TOKEN"
echo "VERCEL_ORG_ID"
echo "VERCEL_PROJECT_ID"
echo ""

# Application Secrets (you'll need to add actual values)
echo "=== APPLICATION SECRETS ==="
echo "Copy these from your secure storage after rotation:"
echo ""
cat << 'SECRETS'
OPENAI_API_KEY
ANTHROPIC_API_KEY
GEMINI_API_KEY
XAI_API_KEY
HUGGINGFACE_ACCESS_TOKEN
DEEPSEEK_API_KEY
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_ENDPOINT
SPORTSRADAR_MASTER_API_KEY
BLAZE_CLIENT_ID
BLAZE_CLIENT_SECRET
PRODUCTION_API_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
NOTION_INTEGRATION_SECRET
AIRTABLE_API_KEY
HUBSPOT_ACCESS_TOKEN
ZAPIER_API_KEY
SENTRY_PERSONAL_TOKEN
GITHUB_TOKEN_FINE
SECRETS

echo ""
echo "After adding all secrets, run the sync workflow from GitHub Actions."
EOF

chmod +x scripts/add-github-secrets.sh

# Commit all changes
echo "💾 Committing changes..."
git add -A
git commit -m "🔐 Add secrets sync workflow for multi-platform deployment

- GitHub Actions workflow to sync secrets across platforms
- Support for Cloudflare, Netlify, Vercel, GitHub, and Replit
- Comprehensive documentation and security guidelines
- Helper scripts for secret management
- Enhanced .gitignore for security

This establishes GitHub Secrets as the single source of truth
for all environment variables across deployment platforms."

# Push to remote
echo "📤 Pushing to remote..."
git push -u origin chore/secrets-sync

# Create PR
echo "🔄 Creating Pull Request..."
gh pr create \
  --title "🔐 Add secrets sync workflow for multi-platform deployment" \
  --body "## 🎯 Purpose

This PR implements a comprehensive secrets synchronization system that uses GitHub Secrets as the single source of truth for all deployment platforms.

## ✨ Features

- **Unified Secret Management**: Single source of truth in GitHub Secrets
- **Multi-Platform Support**: Cloudflare, Netlify, Vercel, GitHub, Replit
- **Automated Sync**: GitHub Actions workflow for one-click deployment
- **Security First**: No secrets in code, comprehensive documentation
- **Platform-Specific Configuration**: Optimized for each platform's requirements

## 🔐 Security Improvements

- Centralized secret rotation
- Audit trail through GitHub Actions
- No manual secret copying between platforms
- Enhanced .gitignore rules
- Security best practices documentation

## 📋 Checklist

- [ ] Rotate all existing API keys
- [ ] Add new keys to GitHub Secrets
- [ ] Test sync workflow
- [ ] Verify secrets on each platform
- [ ] Remove any local .env files

## 🚀 Next Steps

1. Merge this PR
2. Add secrets to GitHub repository settings
3. Run the Secrets Sync workflow
4. Verify deployment on all platforms

## 📚 Documentation

See \`docs/secrets.md\` for complete usage instructions and security guidelines.

---
**Security Note**: After merging, immediately rotate any keys that may have been exposed and update them in GitHub Secrets." \
  --assignee @me \
  --label "security,infrastructure,automation"

echo ""
echo "✅ Setup Complete!"
echo "=================="
echo ""
echo "📋 Next Steps:"
echo "1. Review and merge the PR at: $(gh pr view --web 2>/dev/null || echo 'Check GitHub')"
echo "2. Add your secrets to GitHub: Run './scripts/add-github-secrets.sh' for guidance"
echo "3. Run the Secrets Sync workflow from GitHub Actions"
echo "4. Verify secrets are set on each platform"
echo ""
echo "⚠️  IMPORTANT SECURITY REMINDERS:"
echo "- Rotate ALL API keys before adding to GitHub Secrets"
echo "- Never commit .env files"
echo "- Use the sync workflow to update all platforms at once"
echo "- Monitor API usage for unusual activity"
echo ""
echo "🔐 Your secrets sync system is ready for deployment!"
EOF

chmod +x setup-secrets-sync.sh

echo "✅ One-file setup script created: setup-secrets-sync.sh"
echo ""
echo "Run it with: ./setup-secrets-sync.sh"
echo ""
echo "This will:"
echo "1. Create the branch"
echo "2. Add the workflow and docs"
echo "3. Commit and push"
echo "4. Open a PR via GitHub CLI"