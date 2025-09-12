/**
 * Blaze Intelligence Contact Form API
 * Cloudflare Worker for handling contact form submissions
 * 
 * Features:
 * - Form validation and sanitization
 * - Email notification via SendGrid
 * - Data storage in D1 database
 * - Rate limiting and spam protection
 */

export default {
    async fetch(request, env, ctx) {
        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        // Handle preflight requests
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // Only allow POST requests
        if (request.method !== 'POST') {
            return new Response('Method not allowed', { 
                status: 405,
                headers: corsHeaders 
            });
        }

        try {
            // Parse request data
            const formData = await request.json();
            
            // Validate required fields
            const validation = validateContactForm(formData);
            if (!validation.valid) {
                return new Response(JSON.stringify({
                    success: false,
                    error: validation.error,
                    code: 'VALIDATION_ERROR'
                }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders
                    }
                });
            }

            // Rate limiting check
            const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
            const rateLimitCheck = await checkRateLimit(env, clientIP);
            if (!rateLimitCheck.allowed) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Too many submissions. Please try again later.',
                    code: 'RATE_LIMIT_EXCEEDED',
                    retryAfter: rateLimitCheck.retryAfter
                }), {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': rateLimitCheck.retryAfter.toString(),
                        ...corsHeaders
                    }
                });
            }

            // Store in database
            const submissionId = crypto.randomUUID();
            const submission = {
                id: submissionId,
                name: sanitizeInput(formData.name),
                email: sanitizeInput(formData.email),
                organization: sanitizeInput(formData.organization || ''),
                interest: sanitizeInput(formData.interest || ''),
                message: sanitizeInput(formData.message || ''),
                ip_address: clientIP,
                user_agent: request.headers.get('User-Agent') || '',
                submitted_at: new Date().toISOString(),
                status: 'pending'
            };

            await storeSubmission(env, submission);

            // Send email notification
            try {
                await sendEmailNotification(env, submission);
                
                // Update submission status
                await updateSubmissionStatus(env, submissionId, 'sent');
                
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
                
                // Update submission status but don't fail the request
                await updateSubmissionStatus(env, submissionId, 'email_failed');
            }

            // Track submission in analytics
            await trackSubmission(env, submission);

            return new Response(JSON.stringify({
                success: true,
                message: 'Thank you for your interest! We will get back to you within 24 hours.',
                submissionId: submissionId
            }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders
                }
            });

        } catch (error) {
            console.error('Contact form error:', error);
            
            return new Response(JSON.stringify({
                success: false,
                error: 'An unexpected error occurred. Please try again or email us directly at ahump20@outlook.com.',
                code: 'INTERNAL_ERROR'
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders
                }
            });
        }
    }
};

/**
 * Validate contact form data
 */
function validateContactForm(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('Name is required and must be at least 2 characters');
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Valid email address is required');
    }
    
    if (data.name && data.name.length > 100) {
        errors.push('Name must be less than 100 characters');
    }
    
    if (data.message && data.message.length > 5000) {
        errors.push('Message must be less than 5000 characters');
    }
    
    if (data.organization && data.organization.length > 200) {
        errors.push('Organization name must be less than 200 characters');
    }
    
    return {
        valid: errors.length === 0,
        error: errors.join('; ')
    };
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Sanitize user input
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.trim().substring(0, 5000);
}

/**
 * Check rate limiting
 */
async function checkRateLimit(env, clientIP) {
    try {
        const key = `rate_limit:${clientIP}`;
        const current = await env.BLAZE_KV.get(key, 'json');
        const now = Date.now();
        const windowMs = 60000; // 1 minute window
        const maxRequests = 3; // 3 requests per minute
        
        if (!current) {
            await env.BLAZE_KV.put(key, JSON.stringify({
                count: 1,
                windowStart: now
            }), { expirationTtl: 3600 });
            
            return { allowed: true };
        }
        
        if (now - current.windowStart > windowMs) {
            // Reset window
            await env.BLAZE_KV.put(key, JSON.stringify({
                count: 1,
                windowStart: now
            }), { expirationTtl: 3600 });
            
            return { allowed: true };
        }
        
        if (current.count >= maxRequests) {
            const retryAfter = Math.ceil((windowMs - (now - current.windowStart)) / 1000);
            return { 
                allowed: false,
                retryAfter: retryAfter
            };
        }
        
        // Increment count
        await env.BLAZE_KV.put(key, JSON.stringify({
            count: current.count + 1,
            windowStart: current.windowStart
        }), { expirationTtl: 3600 });
        
        return { allowed: true };
        
    } catch (error) {
        console.error('Rate limit check failed:', error);
        // Allow request on error to avoid blocking legitimate users
        return { allowed: true };
    }
}

/**
 * Store submission in D1 database
 */
async function storeSubmission(env, submission) {
    try {
        const query = `
            INSERT INTO contact_submissions (
                id, name, email, organization, interest, message, 
                ip_address, user_agent, submitted_at, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await env.BLAZE_DB.prepare(query).bind(
            submission.id,
            submission.name,
            submission.email,
            submission.organization,
            submission.interest,
            submission.message,
            submission.ip_address,
            submission.user_agent,
            submission.submitted_at,
            submission.status
        ).run();
        
    } catch (error) {
        console.error('Database storage failed:', error);
        throw error;
    }
}

/**
 * Update submission status
 */
async function updateSubmissionStatus(env, submissionId, status) {
    try {
        const query = `UPDATE contact_submissions SET status = ? WHERE id = ?`;
        await env.BLAZE_DB.prepare(query).bind(status, submissionId).run();
    } catch (error) {
        console.error('Status update failed:', error);
    }
}

/**
 * Send email notification
 */
async function sendEmailNotification(env, submission) {
    const emailData = {
        personalizations: [{
            to: [{ email: 'ahump20@outlook.com', name: 'Austin Humphrey' }]
        }],
        from: { 
            email: 'noreply@blaze-intelligence.com', 
            name: 'Blaze Intelligence Contact Form' 
        },
        subject: `New Contact Form Submission - ${submission.interest || 'General Inquiry'}`,
        content: [{
            type: 'text/html',
            value: generateEmailTemplate(submission)
        }]
    };
    
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
    });
    
    if (!response.ok) {
        throw new Error(`SendGrid API failed: ${response.status}`);
    }
}

/**
 * Generate email template
 */
function generateEmailTemplate(submission) {
    return `
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #BF5700 0%, #FF8C00 100%); color: white; padding: 20px; text-align: center;">
                <h1>New Contact Form Submission</h1>
                <p>Blaze Intelligence Platform</p>
            </div>
            
            <div style="padding: 20px; background: #f8f9fa;">
                <h2>Contact Details</h2>
                <p><strong>Name:</strong> ${submission.name}</p>
                <p><strong>Email:</strong> ${submission.email}</p>
                <p><strong>Organization:</strong> ${submission.organization || 'Not provided'}</p>
                <p><strong>Interest Level:</strong> ${submission.interest || 'Not specified'}</p>
                <p><strong>Submitted:</strong> ${new Date(submission.submitted_at).toLocaleString()}</p>
                
                <h3>Message</h3>
                <div style="background: white; padding: 15px; border-left: 4px solid #BF5700; border-radius: 4px;">
                    <p>${submission.message || 'No message provided'}</p>
                </div>
                
                <h3>Technical Details</h3>
                <p><strong>Submission ID:</strong> ${submission.id}</p>
                <p><strong>IP Address:</strong> ${submission.ip_address}</p>
                <p><strong>User Agent:</strong> ${submission.user_agent}</p>
            </div>
            
            <div style="background: #343a40; color: white; padding: 15px; text-align: center; font-size: 12px;">
                <p>This email was generated automatically by the Blaze Intelligence contact form system.</p>
                <p>Reply directly to this email to respond to ${submission.name}</p>
            </div>
        </body>
        </html>
    `;
}

/**
 * Track submission analytics
 */
async function trackSubmission(env, submission) {
    try {
        // Store analytics data
        const analyticsKey = `analytics:submissions:${new Date().toISOString().split('T')[0]}`;
        const existing = await env.BLAZE_KV.get(analyticsKey, 'json') || { count: 0, submissions: [] };
        
        existing.count += 1;
        existing.submissions.push({
            id: submission.id,
            interest: submission.interest,
            timestamp: submission.submitted_at,
            organization: submission.organization ? 'provided' : 'not_provided'
        });
        
        await env.BLAZE_KV.put(analyticsKey, JSON.stringify(existing), { expirationTtl: 86400 * 30 }); // 30 days
        
    } catch (error) {
        console.error('Analytics tracking failed:', error);
        // Don't fail the request for analytics issues
    }
}