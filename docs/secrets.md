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
