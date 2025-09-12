# 🔐 Blaze Intelligence - Platform Secrets Setup Guide

## ✅ Setup Complete!

Your secrets synchronization system has been successfully configured and pushed to GitHub.

## 📋 Immediate Next Steps

### 1️⃣ Create the Pull Request

**Open this link in Chrome to create the PR:**
👉 https://github.com/ahump20/BI/compare/main...chore/secrets-sync?quick_pull=1

### 2️⃣ Add Secrets to GitHub (One-Time Setup)

**Go to:** https://github.com/ahump20/BI/settings/secrets/actions/new

Add each secret below. Copy the name and value exactly:

#### 🔧 Platform Credentials

```
CLOUDFLARE_API_TOKEN = dd21Layyk6Ix6LKRWZUDDVygObagQbeVIjojHrEJ
CLOUDFLARE_ACCOUNT_ID = a12cb329d84130460eed99b816e4d0d3
CF_PAGES_PROJECT = blaze-intelligence
```

#### 🤖 AI Services (Rotate these first!)

```
OPENAI_API_KEY = [Get new key from platform.openai.com/api-keys]
ANTHROPIC_API_KEY = [Get new key from console.anthropic.com]
GEMINI_API_KEY = [Get new key from Google AI Studio]
XAI_API_KEY = [Get new key from X.AI]
HUGGINGFACE_ACCESS_TOKEN = [Get from huggingface.co/settings/tokens]
DEEPSEEK_API_KEY = [Get from platform.deepseek.com]
```

#### 💾 Storage & Infrastructure

```
R2_ACCOUNT_ID = a12cb329d84130460eed99b816e4d0d3
R2_ACCESS_KEY_ID = dafe9d6e5448406759631b8d101c3901
R2_SECRET_ACCESS_KEY = d82d1ab05af875d9a6da33f06e0a8d4efb43e72119ff500f35badff4afe811b9
R2_ENDPOINT = https://a12cb329d84130460eed99b816e4d0d3.r2.cloudflarestorage.com
```

#### 🏈 Sports & Analytics

```
SPORTSRADAR_MASTER_API_KEY = usrUqychOBmYeQogGbZ5DG6eKv1hLyVrfCMp6dnH
BLAZE_CLIENT_ID = X252EXMZ5BD2XZNIU804XVGYM9A6KXG4
BLAZE_CLIENT_SECRET = 4252V9LMU8NHY4KN7WIVR3RVNW4WXHV3456ZNE6XGUNEOR3BHE3NPD1JXE62WNHG
PRODUCTION_API_KEY = blaze_live_83453667ea265aa73a3ccae226cc0003ba006b27a36fe8470828e65f6c7871f5
```

#### 💳 Payment Services

```
STRIPE_PUBLISHABLE_KEY = [Get from Stripe Dashboard - Developers > API Keys]
STRIPE_SECRET_KEY = [Get from Stripe Dashboard - Developers > API Keys]
```

#### 🔗 Integrations

```
NOTION_INTEGRATION_SECRET = [Get from Notion - Settings > Integrations]
AIRTABLE_API_KEY = [Get from Airtable Account Settings]
HUBSPOT_ACCESS_TOKEN = [Get from HubSpot - Settings > Integrations > Private Apps]
ZAPIER_API_KEY = [Get from Zapier Developer Dashboard]
```

#### 🛠️ Development Tools

```
GITHUB_TOKEN_FINE = [Create at github.com/settings/tokens]
GITHUB_FINE_GRAINED_TOKEN = [Create at github.com/settings/personal-access-tokens]
SENTRY_PERSONAL_TOKEN = [Get from Sentry - Settings > Auth Tokens]
CURSOR_API_KEY = [Get from Cursor Settings]
```

### 3️⃣ Run the Sync Workflow

After adding ALL secrets above:

1. **Go to:** https://github.com/ahump20/BI/actions
2. **Click:** "Secrets Sync" workflow (on the left)
3. **Click:** "Run workflow" button (on the right)
4. **Configure:**
   - Environment: `production`
   - Platforms: `cloudflare,netlify,vercel,github`
5. **Click:** Green "Run workflow" button

## 🎯 What Happens Next?

The workflow will automatically:
- ✅ Read all secrets from GitHub
- ✅ Connect to each platform using provider tokens
- ✅ Set environment variables on Cloudflare Pages
- ✅ Configure secrets for your deployments
- ✅ Make them available for all future builds

## 🔍 Verification

### Check Workflow Status
https://github.com/ahump20/BI/actions/workflows/secrets-sync.yml

### Verify Cloudflare Pages
https://dash.cloudflare.com/a12cb329d84130460eed99b816e4d0d3/pages/view/blaze-intelligence/settings/environment-variables

### Test Deployment
```bash
cd austin-portfolio-deploy
npx wrangler pages deploy . --project-name=blaze-intelligence
```

## 🚨 Important Security Notes

1. **⚠️ ROTATE THESE KEYS IMMEDIATELY:**
   - OpenAI API Key
   - Anthropic API Key
   - Any key that was in your local .env file

2. **🔒 After Setup:**
   - Delete ALL local .env files
   - Never commit secrets to code
   - Use the sync workflow for all updates

3. **📅 Monthly Maintenance:**
   - Rotate sensitive API keys
   - Review access logs
   - Update expired tokens

## 💡 Pro Tips

### Update a Single Secret
```bash
# After updating in GitHub Secrets, run:
gh workflow run secrets-sync.yml -f environment=production -f platforms=cloudflare
```

### Emergency Key Rotation
1. Revoke old key on provider's dashboard
2. Generate new key
3. Update in GitHub Secrets
4. Run sync workflow immediately

### Add New Platforms Later

For **Netlify**:
```
NETLIFY_AUTH_TOKEN = [Get from User Settings]
NETLIFY_SITE_ID = [Get from Site Settings]
```

For **Vercel**:
```
VERCEL_TOKEN = [Get from Account Settings]
VERCEL_ORG_ID = [Get from Team Settings]
VERCEL_PROJECT_ID = [Get from Project Settings]
```

## ✅ Success Indicators

You'll know it's working when:
- ✅ Workflow shows green checkmark
- ✅ Cloudflare Pages builds without "missing environment variable" errors
- ✅ API calls in your app work correctly
- ✅ No secrets appear in your code repository

## 🆘 Troubleshooting

### If Workflow Fails
- Check the logs for specific error
- Verify platform tokens are correct
- Ensure secret names match exactly

### If Secrets Not Available
- Trigger a new deployment on Cloudflare Pages
- Check environment setting (production vs preview)
- Verify secret was added to GitHub

### Common Issues
- **"Permission denied"**: Platform token needs more permissions
- **"Secret not found"**: Name mismatch (case-sensitive!)
- **"Invalid token"**: Token expired or incorrect

## 📞 Quick Links

- [GitHub Secrets Settings](https://github.com/ahump20/BI/settings/secrets/actions)
- [Cloudflare Dashboard](https://dash.cloudflare.com)
- [GitHub Actions](https://github.com/ahump20/BI/actions)
- [PR Creation](https://github.com/ahump20/BI/compare/main...chore/secrets-sync)

---

**Status**: 🟢 Ready for deployment
**Created**: January 2025
**Next Step**: Add secrets to GitHub and run workflow

Remember: This is a one-time setup. Once configured, all future deployments will automatically have access to these secrets!