// Netlify Function for Secure API Proxy
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Parse the request
  const { service, action, data } = JSON.parse(event.body || '{}');
  
  // Set up CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    let result;
    
    switch(service) {
      case 'openai':
        result = await handleOpenAI(action, data);
        break;
      
      case 'sports':
        result = await handleSportsData(action, data);
        break;
      
      case 'payment':
        result = await handlePayment(action, data);
        break;
      
      case 'crm':
        result = await handleCRM(action, data);
        break;
      
      case 'analytics':
        result = await handleAnalytics(action, data);
        break;
      
      default:
        throw new Error('Invalid service');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data: result })
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: 'Internal server error' })
    };
  }
};

async function handleOpenAI(action, data) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (action === 'chat') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: data.messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    return response.json();
  }
  
  throw new Error('Invalid OpenAI action');
}

async function handleSportsData(action, data) {
  const apiKey = process.env.SPORTSRADAR_MASTER_API_KEY;
  
  const endpoints = {
    'mlb-scores': `https://api.sportradar.us/mlb/trial/v7/en/games/${data.date}/schedule.json`,
    'nfl-scores': `https://api.sportradar.us/nfl/official/trial/v7/en/games/${data.date}/schedule.json`,
    'nba-scores': `https://api.sportradar.us/nba/trial/v8/en/games/${data.date}/schedule.json`,
    'cardinals': `https://api.sportradar.us/mlb/trial/v7/en/teams/44671792-dc02-4fdd-a5ad-f5f17edaa9d7/profile.json`
  };
  
  const url = endpoints[action];
  if (!url) throw new Error('Invalid sports data action');
  
  const response = await fetch(`${url}?api_key=${apiKey}`);
  return response.json();
}

async function handlePayment(action, data) {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  if (action === 'create-session') {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: data.product || 'Blaze Intelligence Pro',
            description: 'Annual subscription to Blaze Intelligence'
          },
          unit_amount: data.amount || 118800, // $1,188.00
          recurring: {
            interval: 'year'
          }
        },
        quantity: 1
      }],
      mode: 'subscription',
      success_url: `${data.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${data.origin}/cancel`
    });
    
    return { sessionId: session.id, url: session.url };
  }
  
  throw new Error('Invalid payment action');
}

async function handleCRM(action, data) {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  
  if (action === 'create-contact') {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          email: data.email,
          firstname: data.firstName,
          lastname: data.lastName,
          company: data.company,
          phone: data.phone,
          lead_source: 'Blaze Intelligence Website'
        }
      })
    });
    
    return response.json();
  }
  
  throw new Error('Invalid CRM action');
}

async function handleAnalytics(action, data) {
  // Use multiple AI services for analytics
  const results = {};
  
  if (action === 'analyze-performance') {
    // OpenAI Analysis
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{
          role: 'system',
          content: 'You are a sports analytics expert.'
        }, {
          role: 'user',
          content: `Analyze this performance data: ${JSON.stringify(data)}`
        }],
        temperature: 0.5
      })
    });
    
    results.openai = await openaiResponse.json();
    
    // Add more AI service calls as needed
    
    return results;
  }
  
  throw new Error('Invalid analytics action');
}