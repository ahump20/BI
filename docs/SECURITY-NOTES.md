# Security Notes - Blaze Intelligence X/Twitter Integration

## Critical Security Rules

### API Keys & Secrets
- **NEVER** commit API keys, tokens, or secrets to Git
- **NEVER** log secrets in console output or error messages
- **NEVER** paste secrets into GitHub issues, PRs, or comments
- **NEVER** store secrets in client-side code

### Secret Storage
Use **Cloudflare Workers Secrets** exclusively:
```bash
wrangler secret put X_CLIENT_ID
wrangler secret put X_CLIENT_SECRET
wrangler secret put X_REDIRECT_URI
wrangler secret put WEBHOOK_SIGNING_KEY
```

### Environment Variables
Create `.env.example` with placeholders only:
```env
# X/Twitter OAuth 2.0 (obtain from developer.x.com)
X_CLIENT_ID=your_client_id_here
X_CLIENT_SECRET=your_client_secret_here
X_REDIRECT_URI=https://blaze-intelligence.pages.dev/auth/callback

# Webhook Security
WEBHOOK_SIGNING_KEY=generate_random_32_char_string

# HubSpot Integration
HS_BASE_URL=
HS_API_KEY=

# Baseball Data API
BASEBALL_BASE_URL=
BASEBALL_API_KEY=
```

### X API v2 OAuth 2.0
1. **Eligibility**: Account must be 30+ days old
2. **Access Level**: Start with Essential ($100/month)
3. **Rotation**: Rotate credentials every 90 days
4. **Scopes Required**:
   - `tweet.read`
   - `tweet.write`
   - `users.read`
   - `offline.access`

### Account Security
- **2FA**: TOTP only (no SMS)
- **Password**: 20+ characters, unique
- **Recovery**: Store backup codes in 1Password/Bitwarden
- **Sessions**: Review active sessions monthly
- **Apps**: Audit connected apps quarterly

### Webhook Security
- **HMAC-SHA256** signature verification required
- **Timestamp validation** to prevent replay attacks
- **Rate limiting**: Max 100 requests per minute
- **IP allowlisting** for production (optional)

### Development Security
```bash
# Add to .gitignore
.env
.env.local
*.key
*.pem
*.cert
secrets/
credentials.json

# Pre-commit hook for secret scanning
npm install -D gitleaks
echo 'gitleaks detect --no-git --verbose' > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Incident Response
1. **If secret exposed**:
   - Immediately rotate the compromised credential
   - Audit access logs for unauthorized use
   - Update all dependent systems
   - Document incident with timestamp

2. **If account compromised**:
   - Reset password immediately
   - Revoke all app permissions
   - Generate new 2FA seed
   - Review and delete suspicious posts
   - Contact X support if needed

### Monitoring & Alerts
- **Weekly**: Check X Analytics for unusual activity
- **Monthly**: Review connected apps and sessions
- **Quarterly**: Rotate API credentials
- **Annually**: Complete security audit

### Compliance Notes
- **Data Retention**: Follow X's data retention policies
- **User Privacy**: Never log or store user DMs
- **Rate Limits**: Respect X API rate limits
- **Terms**: Comply with X Developer Agreement

### Emergency Contacts
- **X Developer Support**: https://developer.x.com/support
- **Cloudflare Support**: https://support.cloudflare.com
- **Austin Humphrey**: ahump20@outlook.com / (210) 273-5538

### Security Checklist for Deployment
- [ ] All secrets in Cloudflare Workers environment
- [ ] No hardcoded credentials in code
- [ ] HMAC verification enabled on webhook
- [ ] Rate limiting configured
- [ ] Error messages sanitized (no secret leakage)
- [ ] Logging excludes sensitive data
- [ ] CORS properly configured
- [ ] HTTPS enforced everywhere

### Regular Maintenance
- [ ] **Daily**: Monitor webhook logs for errors
- [ ] **Weekly**: Check post success rate
- [ ] **Monthly**: Review security alerts
- [ ] **Quarterly**: Rotate secrets and audit access

---
*Last Security Review*: _______________
*Next Scheduled Review*: _______________ (90 days)
*Security Officer*: Austin Humphrey
