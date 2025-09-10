#!/usr/bin/env node

/**
 * Blaze Intelligence Payment System
 * Stripe integration for subscriptions and usage-based billing
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BlazePaymentSystem {
  constructor() {
    this.config = {
      stripe: {
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_demo',
        secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_demo',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_demo'
      },
      products: {
        starter: {
          name: 'Blaze Starter',
          priceId: 'price_starter_monthly',
          amount: 9900, // $99.00
          interval: 'month',
          features: [
            '1 Team Monitoring',
            '50 Athletes',
            '1,000 API Calls/month',
            'Basic HAV-F Analysis',
            'Email Support'
          ],
          limits: {
            teams: 1,
            athletes: 50,
            apiCalls: 1000,
            havfCalculations: 100,
            visionAnalyses: 5
          }
        },
        pro: {
          name: 'Blaze Professional',
          priceId: 'price_pro_monthly',
          amount: 49900, // $499.00
          interval: 'month',
          features: [
            '5 Teams Monitoring',
            '500 Athletes',
            '10,000 API Calls/month',
            'Advanced HAV-F Analysis',
            'Vision AI (50 analyses/month)',
            'Custom Reports',
            'Priority Support'
          ],
          limits: {
            teams: 5,
            athletes: 500,
            apiCalls: 10000,
            havfCalculations: 1000,
            visionAnalyses: 50
          }
        },
        enterprise: {
          name: 'Blaze Enterprise',
          priceId: 'price_enterprise_monthly',
          amount: 249900, // $2,499.00
          interval: 'month',
          features: [
            'Unlimited Teams',
            'Unlimited Athletes',
            'Unlimited API Calls',
            'Full HAV-F Suite',
            'Unlimited Vision AI',
            'White Label Options',
            'Dedicated Support',
            'Custom Integrations',
            'SLA Guarantee'
          ],
          limits: {
            teams: -1,
            athletes: -1,
            apiCalls: -1,
            havfCalculations: -1,
            visionAnalyses: -1
          }
        }
      },
      addOns: {
        visionPack: {
          name: 'Vision AI Pack',
          priceId: 'price_vision_pack',
          amount: 5000, // $50.00
          description: '10 additional Vision AI analyses'
        },
        apiBoost: {
          name: 'API Boost',
          priceId: 'price_api_boost',
          amount: 9900, // $99.00
          description: '10,000 additional API calls'
        },
        customReport: {
          name: 'Custom Report',
          priceId: 'price_custom_report',
          amount: 50000, // $500.00
          description: 'Professional custom analytics report'
        }
      },
      usageMetering: {
        apiOverage: {
          priceId: 'price_api_overage',
          unitAmount: 10, // $0.10 per 100 calls
          aggregationMethod: 'sum'
        },
        visionOverage: {
          priceId: 'price_vision_overage',
          unitAmount: 500, // $5.00 per analysis
          aggregationMethod: 'sum'
        }
      }
    };

    this.customers = new Map();
    this.subscriptions = new Map();
    this.invoices = new Map();
  }

  // Create Stripe customer
  async createCustomer(userData) {
    const customer = {
      id: `cus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: userData.email,
      name: userData.name,
      metadata: {
        userId: userData.userId,
        organization: userData.organization,
        tier: userData.tier
      },
      created: Date.now() / 1000
    };

    this.customers.set(customer.id, customer);
    
    return customer;
  }

  // Create subscription
  async createSubscription(customerId, plan, paymentMethodId) {
    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const product = this.config.products[plan];
    if (!product) {
      throw new Error('Invalid plan');
    }

    const subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customer: customerId,
      status: 'active',
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      plan: {
        id: product.priceId,
        amount: product.amount,
        interval: product.interval,
        product: plan
      },
      items: [{
        id: `si_${Date.now()}`,
        price: product.priceId,
        quantity: 1
      }],
      metadata: {
        userId: customer.metadata.userId,
        tier: plan
      },
      default_payment_method: paymentMethodId,
      latest_invoice: null
    };

    this.subscriptions.set(subscription.id, subscription);

    // Create invoice
    const invoice = await this.createInvoice(subscription);
    subscription.latest_invoice = invoice.id;

    return subscription;
  }

  // Create invoice
  async createInvoice(subscription) {
    const invoice = {
      id: `in_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customer: subscription.customer,
      subscription: subscription.id,
      amount_paid: subscription.plan.amount,
      amount_due: 0,
      status: 'paid',
      created: Math.floor(Date.now() / 1000),
      lines: {
        data: [{
          description: `${subscription.plan.product} subscription`,
          amount: subscription.plan.amount,
          quantity: 1
        }]
      }
    };

    this.invoices.set(invoice.id, invoice);
    
    return invoice;
  }

  // Update subscription
  async updateSubscription(subscriptionId, newPlan) {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const product = this.config.products[newPlan];
    if (!product) {
      throw new Error('Invalid plan');
    }

    // Calculate proration
    const remainingDays = Math.floor(
      (subscription.current_period_end - Date.now() / 1000) / (24 * 60 * 60)
    );
    
    const currentDailyRate = subscription.plan.amount / 30;
    const newDailyRate = product.amount / 30;
    const prorationAmount = Math.floor((newDailyRate - currentDailyRate) * remainingDays);

    subscription.plan = {
      id: product.priceId,
      amount: product.amount,
      interval: product.interval,
      product: newPlan
    };

    subscription.metadata.tier = newPlan;

    return {
      subscription,
      proration: prorationAmount > 0 ? prorationAmount : 0
    };
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId, immediately = false) {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (immediately) {
      subscription.status = 'canceled';
      subscription.canceled_at = Math.floor(Date.now() / 1000);
    } else {
      subscription.status = 'active';
      subscription.cancel_at_period_end = true;
    }

    return subscription;
  }

  // Record usage
  async recordUsage(subscriptionId, metric, quantity) {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const usageRecord = {
      id: `mbur_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      subscription: subscriptionId,
      metric,
      quantity,
      timestamp: Math.floor(Date.now() / 1000),
      action: 'increment'
    };

    // Check if usage exceeds plan limits
    const plan = this.config.products[subscription.plan.product];
    const limit = plan.limits[metric];
    
    if (limit !== -1 && quantity > limit) {
      // Calculate overage
      const overage = quantity - limit;
      const overageConfig = this.config.usageMetering[`${metric}Overage`];
      
      if (overageConfig) {
        usageRecord.overage = {
          quantity: overage,
          amount: overage * overageConfig.unitAmount
        };
      }
    }

    return usageRecord;
  }

  // Process payment
  async processPayment(amount, paymentMethodId, customerId) {
    // Simulate payment processing
    const payment = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency: 'usd',
      customer: customerId,
      payment_method: paymentMethodId,
      status: 'succeeded',
      created: Math.floor(Date.now() / 1000)
    };

    return payment;
  }

  // Generate checkout session
  async createCheckoutSession(plan, customerId) {
    const product = this.config.products[plan];
    if (!product) {
      throw new Error('Invalid plan');
    }

    const session = {
      id: `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customer: customerId,
      mode: 'subscription',
      line_items: [{
        price: product.priceId,
        quantity: 1
      }],
      success_url: 'https://blaze-intelligence.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://blaze-intelligence.com/cancel',
      metadata: {
        plan,
        customerId
      }
    };

    return session;
  }

  // Handle webhook
  async handleWebhook(event) {
    switch (event.type) {
      case 'customer.subscription.created':
        console.log('Subscription created:', event.data.object.id);
        break;
        
      case 'customer.subscription.updated':
        console.log('Subscription updated:', event.data.object.id);
        break;
        
      case 'customer.subscription.deleted':
        console.log('Subscription canceled:', event.data.object.id);
        break;
        
      case 'invoice.payment_succeeded':
        console.log('Payment successful:', event.data.object.id);
        break;
        
      case 'invoice.payment_failed':
        console.log('Payment failed:', event.data.object.id);
        // Send notification
        break;
        
      default:
        console.log('Unhandled event:', event.type);
    }
  }

  // Generate billing portal URL
  async createBillingPortalSession(customerId) {
    return {
      id: `bps_${Date.now()}`,
      customer: customerId,
      url: `https://billing.stripe.com/session/${customerId}`,
      return_url: 'https://blaze-intelligence.com/account'
    };
  }

  // Get subscription details
  async getSubscriptionDetails(subscriptionId) {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const plan = this.config.products[subscription.plan.product];
    
    return {
      subscription,
      plan: {
        name: plan.name,
        price: plan.amount / 100,
        features: plan.features,
        limits: plan.limits
      },
      nextBillingDate: new Date(subscription.current_period_end * 1000).toISOString(),
      status: subscription.status
    };
  }

  // Calculate revenue
  async calculateRevenue(startDate, endDate) {
    const revenue = {
      total: 0,
      byPlan: {},
      byStatus: {
        active: 0,
        canceled: 0
      },
      mrr: 0, // Monthly Recurring Revenue
      arr: 0  // Annual Recurring Revenue
    };

    this.subscriptions.forEach(subscription => {
      if (subscription.status === 'active') {
        revenue.total += subscription.plan.amount;
        revenue.mrr += subscription.plan.amount;
        
        const plan = subscription.plan.product;
        if (!revenue.byPlan[plan]) {
          revenue.byPlan[plan] = 0;
        }
        revenue.byPlan[plan] += subscription.plan.amount;
        
        revenue.byStatus.active++;
      } else {
        revenue.byStatus.canceled++;
      }
    });

    revenue.arr = revenue.mrr * 12;
    revenue.total = revenue.total / 100; // Convert to dollars
    revenue.mrr = revenue.mrr / 100;
    revenue.arr = revenue.arr / 100;

    return revenue;
  }
}

// Checkout page HTML
const checkoutPageHTML = `<!DOCTYPE html>
<html>
<head>
  <title>Blaze Intelligence - Checkout</title>
  <script src="https://js.stripe.com/v3/"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: linear-gradient(135deg, #0A0A0F 0%, #1A1A2E 50%);
      color: #F8F9FA;
      min-height: 100vh;
      padding: 2rem;
    }
    
    .checkout-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(90deg, #BF5700, #FF7A00);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }
    
    .plan-card {
      background: rgba(255, 255, 255, 0.08);
      border: 2px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      padding: 2rem;
      position: relative;
      transition: all 0.3s;
    }
    
    .plan-card:hover {
      transform: translateY(-5px);
      border-color: #BF5700;
    }
    
    .plan-card.recommended {
      border-color: #BF5700;
    }
    
    .plan-card.recommended::before {
      content: 'MOST POPULAR';
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: #BF5700;
      padding: 0.25rem 1rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: bold;
    }
    
    .plan-name {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }
    
    .plan-price {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    
    .plan-price span {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.7);
    }
    
    .plan-features {
      list-style: none;
      margin: 1.5rem 0;
    }
    
    .plan-features li {
      padding: 0.5rem 0;
      display: flex;
      align-items: center;
    }
    
    .plan-features li::before {
      content: '✓';
      color: #00FF88;
      margin-right: 0.75rem;
      font-weight: bold;
    }
    
    .checkout-btn {
      width: 100%;
      padding: 1rem;
      background: #BF5700;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .checkout-btn:hover {
      background: #FF7A00;
      transform: translateY(-2px);
    }
    
    .checkout-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .payment-form {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      padding: 2rem;
      max-width: 500px;
      margin: 0 auto;
      display: none;
    }
    
    .payment-form.active {
      display: block;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    .form-input {
      width: 100%;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      color: white;
      font-size: 1rem;
    }
    
    #card-element {
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
    }
    
    #card-errors {
      color: #FF3366;
      margin-top: 0.5rem;
      font-size: 0.875rem;
    }
    
    .secure-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 1rem;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.875rem;
    }
    
    .secure-badge svg {
      width: 16px;
      height: 16px;
      margin-right: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="checkout-container">
    <div class="header">
      <h1>🔥 Choose Your Plan</h1>
      <p>Start with a 14-day free trial. Cancel anytime.</p>
    </div>
    
    <div class="plans-grid">
      <!-- Starter Plan -->
      <div class="plan-card" data-plan="starter">
        <h3 class="plan-name">Starter</h3>
        <div class="plan-price">$99<span>/month</span></div>
        <ul class="plan-features">
          <li>1 Team Monitoring</li>
          <li>50 Athletes</li>
          <li>1,000 API Calls/month</li>
          <li>Basic HAV-F Analysis</li>
          <li>Email Support</li>
        </ul>
        <button class="checkout-btn" onclick="selectPlan('starter')">
          Start Free Trial
        </button>
      </div>
      
      <!-- Pro Plan -->
      <div class="plan-card recommended" data-plan="pro">
        <h3 class="plan-name">Professional</h3>
        <div class="plan-price">$499<span>/month</span></div>
        <ul class="plan-features">
          <li>5 Teams Monitoring</li>
          <li>500 Athletes</li>
          <li>10,000 API Calls/month</li>
          <li>Advanced HAV-F Analysis</li>
          <li>Vision AI (50 analyses/month)</li>
          <li>Custom Reports</li>
          <li>Priority Support</li>
        </ul>
        <button class="checkout-btn" onclick="selectPlan('pro')">
          Start Free Trial
        </button>
      </div>
      
      <!-- Enterprise Plan -->
      <div class="plan-card" data-plan="enterprise">
        <h3 class="plan-name">Enterprise</h3>
        <div class="plan-price">$2,499<span>/month</span></div>
        <ul class="plan-features">
          <li>Unlimited Teams</li>
          <li>Unlimited Athletes</li>
          <li>Unlimited API Calls</li>
          <li>Full HAV-F Suite</li>
          <li>Unlimited Vision AI</li>
          <li>White Label Options</li>
          <li>Dedicated Support</li>
          <li>Custom Integrations</li>
        </ul>
        <button class="checkout-btn" onclick="selectPlan('enterprise')">
          Contact Sales
        </button>
      </div>
    </div>
    
    <!-- Payment Form -->
    <div id="payment-form" class="payment-form">
      <h3>Complete Your Order</h3>
      <form id="checkout-form">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" class="form-input" id="email" required>
        </div>
        
        <div class="form-group">
          <label class="form-label">Name</label>
          <input type="text" class="form-input" id="name" required>
        </div>
        
        <div class="form-group">
          <label class="form-label">Organization</label>
          <input type="text" class="form-input" id="organization" required>
        </div>
        
        <div class="form-group">
          <label class="form-label">Card Information</label>
          <div id="card-element"></div>
          <div id="card-errors"></div>
        </div>
        
        <button type="submit" class="checkout-btn" id="submit-btn">
          Start Free Trial
        </button>
        
        <div class="secure-badge">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L3.5 7v6c0 4.5 3.08 8.73 7.5 9.74 4.42-1.01 7.5-5.24 7.5-9.74V7L12 2z"/>
          </svg>
          Secured by Stripe
        </div>
      </form>
    </div>
  </div>
  
  <script>
    // Initialize Stripe
    const stripe = Stripe('pk_test_demo'); // Replace with real key
    const elements = stripe.elements();
    
    // Create card element
    const cardElement = elements.create('card', {
      style: {
        base: {
          color: '#F8F9FA',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '16px',
          '::placeholder': {
            color: 'rgba(255, 255, 255, 0.5)'
          }
        }
      }
    });
    
    cardElement.mount('#card-element');
    
    // Handle card errors
    cardElement.addEventListener('change', (event) => {
      const displayError = document.getElementById('card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });
    
    let selectedPlan = null;
    
    function selectPlan(plan) {
      selectedPlan = plan;
      
      if (plan === 'enterprise') {
        window.location.href = '/contact?plan=enterprise';
        return;
      }
      
      document.getElementById('payment-form').classList.add('active');
      document.getElementById('payment-form').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Handle form submission
    document.getElementById('checkout-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = document.getElementById('submit-btn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing...';
      
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          email: document.getElementById('email').value,
          name: document.getElementById('name').value
        }
      });
      
      if (error) {
        document.getElementById('card-errors').textContent = error.message;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Start Free Trial';
        return;
      }
      
      // Send to backend
      try {
        const response = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan: selectedPlan,
            paymentMethodId: paymentMethod.id,
            email: document.getElementById('email').value,
            name: document.getElementById('name').value,
            organization: document.getElementById('organization').value
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          window.location.href = '/success?subscription=' + result.subscriptionId;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        document.getElementById('card-errors').textContent = error.message;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Start Free Trial';
      }
    });
  </script>
</body>
</html>`;

// Export checkout page
async function exportCheckoutPage() {
  const checkoutPath = path.join(__dirname, 'blaze-checkout.html');
  await fs.writeFile(checkoutPath, checkoutPageHTML);
  console.log('✅ Checkout page exported to blaze-checkout.html');
}

// Demo
async function demo() {
  const payments = new BlazePaymentSystem();
  
  console.log('💳 Blaze Intelligence Payment System');
  console.log('=====================================\n');
  
  // Create customer
  console.log('1. Creating customer...');
  const customer = await payments.createCustomer({
    email: 'demo@blazeintelligence.com',
    name: 'John Demo',
    userId: 'user_123',
    organization: 'Demo Sports Team',
    tier: 'pro'
  });
  console.log(`✅ Customer created: ${customer.id}`);
  
  // Create subscription
  console.log('\n2. Creating subscription...');
  const subscription = await payments.createSubscription(
    customer.id,
    'pro',
    'pm_demo_123'
  );
  console.log(`✅ Subscription created: ${subscription.id}`);
  console.log(`   Plan: ${subscription.plan.product}`);
  console.log(`   Amount: $${subscription.plan.amount / 100}/month`);
  
  // Record usage
  console.log('\n3. Recording usage...');
  const usage = await payments.recordUsage(subscription.id, 'apiCalls', 500);
  console.log(`✅ Usage recorded: ${usage.quantity} API calls`);
  
  // Get subscription details
  console.log('\n4. Getting subscription details...');
  const details = await payments.getSubscriptionDetails(subscription.id);
  console.log(`✅ Subscription Details:`);
  console.log(`   Status: ${details.status}`);
  console.log(`   Plan: ${details.plan.name}`);
  console.log(`   Price: $${details.plan.price}/month`);
  console.log(`   Next billing: ${details.nextBillingDate}`);
  
  // Calculate revenue
  console.log('\n5. Calculating revenue...');
  const revenue = await payments.calculateRevenue();
  console.log(`✅ Revenue Metrics:`);
  console.log(`   MRR: $${revenue.mrr}`);
  console.log(`   ARR: $${revenue.arr}`);
  console.log(`   Active subscriptions: ${revenue.byStatus.active}`);
  
  // Export checkout page
  await exportCheckoutPage();
  
  console.log('\n✅ Payment system ready!');
  console.log('\nPricing:');
  Object.entries(payments.config.products).forEach(([key, product]) => {
    console.log(`   ${product.name}: $${product.amount / 100}/month`);
  });
}

// Run demo
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  demo().catch(console.error);
}

export default BlazePaymentSystem;