# 🔒 SECURE API DEPLOYMENT GUIDE
*Blaze Intelligence - Production Security Setup*

## ✅ COMPLETED SETUP

### 1. Secure Architecture Implemented
- ✅ API proxy endpoints created (`/api/proxy.js`)
- ✅ Netlify serverless functions configured
- ✅ Client-side secure API service with rate limiting
- ✅ CORS and security headers configured
- ✅ Environment variables stored in `.env.local`

### 2. Security Features Active
- **No API keys in frontend code** - All keys server-side only
- **Origin validation** - Only allowed domains can call APIs
- **Rate limiting** - Prevents API abuse
- **Caching layer** - Reduces API calls and costs
- **Error handling** - Graceful failures without exposing details

## 📋 REQUIRED: NETLIFY ENVIRONMENT SETUP

### Step 1: Open Netlify Environment Settings
Go to: https://app.netlify.com/sites/blaze-intelligence/settings/env

### Step 2: Add These Environment Variables
Copy each key from your `.env.local` file:

```bash
# AI Services (Required)
OPENAI_API_KEY=sk-proj-vwewQpz...
ANTHROPIC_API_KEY=sk-ant-api03-itk05f8...
GEMINI_API_KEY=AIzaSyCZ4tQj4QX...

# Cloud Infrastructure
CLOUDFLARE_API_TOKEN=dd21Layyk6Ix6LK...
CLOUDFLARE_ACCOUNT_ID=a12cb329d84130460...

# Sports Data
SPORTSRADAR_MASTER_API_KEY=usrUqychOBmYeQo...

# Payment Processing
STRIPE_SECRET_KEY=sk_test_51RlBWRP...
STRIPE_PUBLISHABLE_KEY=pk_test_51RlBWRP...

# CRM Integration
HUBSPOT_ACCESS_TOKEN=pat-na2-3542c7b0...

# Monitoring
SENTRY_PERSONAL_TOKEN=sntryu_15258a760b5ab...
```

### Step 3: Deploy to Netlify
After adding environment variables:
1. Trigger new deployment in Netlify
2. Or push any change to GitHub to auto-deploy

## 🌐 LIVE SITE URLS

### GitHub Pages (Static Only)
- URL: https://ahump20.github.io/BI/
- Status: Live ✅
- APIs: Limited (no server-side functions)

### Netlify (Full Features)
- URL: https://blaze-intelligence.netlify.app/
- Status: Live ✅
- APIs: Full support via serverless functions

## 🧪 TESTING API INTEGRATIONS

### Test in Browser Console
Open either live site and run:

```javascript
// Test Cardinals data loading
window.blazeAPI.getCardinalsData().then(console.log);

// Test NIL Calculator
window.blazeAPI.calculateNIL({
  sport: 'football',
  position: 'QB',
  stats: { rating: 95 },
  socialMedia: { followers: 10000 }
}).then(console.log);

// Test lead submission
window.blazeAPI.createLead({
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  company: 'Test Company'
}).then(console.log);
```

## 🔐 SECURITY BEST PRACTICES

### DO's ✅
- Store all API keys in environment variables
- Use server-side proxy for all API calls
- Implement rate limiting
- Monitor API usage regularly
- Rotate keys periodically
- Use different keys for dev/staging/production

### DON'Ts ❌
- Never commit API keys to Git
- Never expose keys in client-side code
- Never share `.env.local` file
- Never log API responses with sensitive data
- Never disable CORS in production

## 📊 API USAGE MONITORING

### Check API Usage
- **OpenAI**: https://platform.openai.com/usage
- **Stripe**: https://dashboard.stripe.com/test/dashboard
- **HubSpot**: https://app.hubspot.com/api-usage/
- **Cloudflare**: https://dash.cloudflare.com/

### Set Up Alerts
Configure alerts for:
- Unusual API usage spikes
- Failed authentication attempts
- Rate limit violations
- Error rate increases

## 🚀 DEPLOYMENT CHECKLIST

### Before Going Live
- [ ] All environment variables set in Netlify
- [ ] Test API endpoints work correctly
- [ ] Verify CORS headers are correct
- [ ] Check rate limiting is active
- [ ] Confirm no API keys in source code
- [ ] Test payment flow in test mode
- [ ] Verify lead capture works
- [ ] Check mobile responsiveness
- [ ] Test error handling

### After Deployment
- [ ] Monitor API usage for first 24 hours
- [ ] Check error logs in Netlify Functions
- [ ] Verify all features work on live site
- [ ] Test from different devices/browsers
- [ ] Monitor performance metrics

## 🆘 TROUBLESHOOTING

### API Calls Failing
1. Check Netlify environment variables are set
2. Verify function deployment in Netlify
3. Check browser console for CORS errors
4. Review Netlify function logs

### Functions Not Deploying
1. Ensure `netlify.toml` is in root
2. Check `package.json` has dependencies
3. Verify function syntax is correct
4. Check Netlify build logs

### CORS Errors
1. Update allowed origins in proxy function
2. Check request headers
3. Verify Netlify headers configuration

## 📝 NOTES

**Current Status**: 
- Architecture: ✅ Complete
- Security: ✅ Implemented
- Netlify Env: ⏳ Needs manual setup
- Testing: ⏳ Ready after env setup

**Next Action**: 
Add environment variables to Netlify dashboard, then test all API integrations on live site.

---

*For support: ahump20@outlook.com*