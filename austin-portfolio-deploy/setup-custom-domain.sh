#!/bin/bash

# Setup Custom Domain for Cloudflare Pages
# This script connects blazesportsintel.com to the Cloudflare Pages project

echo "🔥 Setting up blazesportsintel.com custom domain for Cloudflare Pages"

# Check if wrangler is available
if ! command -v npx wrangler &> /dev/null; then
    echo "❌ Wrangler not found. Installing..."
    npm install -g wrangler
fi

echo "📋 Current deployments:"
npx wrangler pages deployment list --project-name=blazesportsintel | head -5

echo ""
echo "🌐 To connect blazesportsintel.com to your Pages project:"
echo ""
echo "MANUAL STEPS REQUIRED in Cloudflare Dashboard:"
echo "============================================="
echo "1. Go to: https://dash.cloudflare.com"
echo "2. Select your account"
echo "3. Navigate to: Pages → blazesportsintel project"
echo "4. Go to: Custom domains tab"
echo "5. Click: 'Set up a custom domain'"
echo "6. Enter: blazesportsintel.com"
echo "7. Follow the DNS setup instructions"
echo ""
echo "OR use Cloudflare API:"
echo "======================"
echo ""

# Create the custom domain via API (requires API token)
cat << 'EOF' > add-custom-domain.js
const ACCOUNT_ID = 'a12cb329d84130460eed99b816e4d0d3';
const PROJECT_NAME = 'blazesportsintel';
const CUSTOM_DOMAIN = 'blazesportsintel.com';

// You need to set your Cloudflare API token
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

if (!API_TOKEN) {
    console.error('❌ Please set CLOUDFLARE_API_TOKEN environment variable');
    process.exit(1);
}

async function addCustomDomain() {
    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/domains`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: CUSTOM_DOMAIN
            })
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Custom domain added successfully!');
            console.log('Domain:', data.result.name);
            console.log('Status:', data.result.status);
            console.log('');
            console.log('Next steps:');
            console.log('1. The domain DNS should automatically update');
            console.log('2. SSL certificate will be provisioned automatically');
            console.log('3. Wait 5-10 minutes for propagation');
        } else {
            console.error('❌ Failed to add custom domain:', data.errors);
        }
    } catch (error) {
        console.error('❌ Error adding custom domain:', error);
    }
}

addCustomDomain();
EOF

echo "To run the API setup:"
echo "1. Set your API token: export CLOUDFLARE_API_TOKEN='your-token-here'"
echo "2. Run: node add-custom-domain.js"
echo ""
echo "📝 Current Pages deployments working at:"
echo "   - https://blazesportsintel.pages.dev"
echo "   - https://b988c8ea.blazesportsintel.pages.dev"
echo ""
echo "✨ Once custom domain is connected, blazesportsintel.com will serve your latest deployment!"