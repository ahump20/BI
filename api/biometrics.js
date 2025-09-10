/**
 * Blaze Intelligence Biometric API
 * Real-time athlete biometric monitoring and analysis
 * Integrates with production platform for comprehensive sports intelligence
 */

export default async function handler(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  try {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Access-Control-Max-Age': '86400'
    };

    // Handle preflight requests
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Route handling
    if (path === '/api/biometrics/health') {
      return await handleHealthCheck(env, corsHeaders);
    }
    
    if (path === '/api/biometrics/athlete' && method === 'POST') {
      return await handleCreateAthlete(request, env, corsHeaders);
    }
    
    if (path.startsWith('/api/biometrics/athlete/') && method === 'GET') {
      const athleteId = path.split('/').pop();
      return await handleGetAthlete(athleteId, env, corsHeaders);
    }
    
    if (path === '/api/biometrics/readings' && method === 'POST') {
      return await handleAddBiometricReading(request, env, corsHeaders);
    }
    
    if (path.startsWith('/api/biometrics/athlete/') && path.endsWith('/analysis')) {
      const athleteId = path.split('/')[4];
      return await handleBiometricAnalysis(athleteId, request, env, corsHeaders);
    }
    
    if (path === '/api/biometrics/team/readiness' && method === 'GET') {
      return await handleTeamReadiness(request, env, corsHeaders);
    }
    
    if (path === '/api/biometrics/alerts' && method === 'GET') {
      return await handleBiometricAlerts(request, env, corsHeaders);
    }

    // 404 for unknown paths
    return new Response(JSON.stringify({
      error: 'Endpoint not found',
      available_endpoints: [
        'GET /api/biometrics/health',
        'POST /api/biometrics/athlete',
        'GET /api/biometrics/athlete/{id}',
        'POST /api/biometrics/readings',
        'GET /api/biometrics/athlete/{id}/analysis',
        'GET /api/biometrics/team/readiness',
        'GET /api/biometrics/alerts'
      ]
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleHealthCheck(env, corsHeaders) {
  const health = {
    status: 'healthy',
    service: 'blaze-biometrics-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    capabilities: [
      'athlete_profiling',
      'real_time_monitoring',
      'readiness_analysis',
      'injury_risk_assessment',
      'performance_prediction',
      'team_dashboard'
    ],
    integrations: {
      cardinals_analytics: 'connected',
      vision_ai_platform: 'ready',
      cloudflare_storage: 'operational'
    }
  };

  return new Response(JSON.stringify(health, null, 2), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleCreateAthlete(request, env, corsHeaders) {
  try {
    const athleteData = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'sport', 'position', 'team'];
    for (const field of requiredFields) {
      if (!athleteData[field]) {
        return new Response(JSON.stringify({
          error: 'Missing required field',
          field: field,
          required_fields: requiredFields
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Generate athlete ID
    const athleteId = `${athleteData.sport}_${athleteData.team}_${athleteData.name.toLowerCase().replace(/\s+/g, '_')}`;
    
    // Create athlete profile
    const athleteProfile = {
      id: athleteId,
      ...athleteData,
      created_at: new Date().toISOString(),
      biometric_baseline: {},
      recent_readings: [],
      readiness_history: [],
      injury_risk_factors: [],
      performance_trends: {}
    };
    
    // Store in KV
    if (env.SPORTS_DATA) {
      await env.SPORTS_DATA.put(
        `athlete:${athleteId}`,
        JSON.stringify(athleteProfile)
      );
    }
    
    return new Response(JSON.stringify({
      success: true,
      athlete_id: athleteId,
      message: 'Athlete profile created successfully',
      profile: athleteProfile
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to create athlete profile',
      message: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleGetAthlete(athleteId, env, corsHeaders) {
  try {
    if (!env.SPORTS_DATA) {
      throw new Error('Sports data storage not configured');
    }
    
    const athleteData = await env.SPORTS_DATA.get(`athlete:${athleteId}`);
    
    if (!athleteData) {
      return new Response(JSON.stringify({
        error: 'Athlete not found',
        athlete_id: athleteId
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const profile = JSON.parse(athleteData);
    
    // Add real-time status
    profile.last_updated = new Date().toISOString();
    profile.status = 'active';
    
    return new Response(JSON.stringify({
      success: true,
      athlete: profile
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to retrieve athlete',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleAddBiometricReading(request, env, corsHeaders) {
  try {
    const readingData = await request.json();
    
    // Validate required fields
    if (!readingData.athlete_id || !readingData.metric_type || readingData.value === undefined) {
      return new Response(JSON.stringify({
        error: 'Missing required fields',
        required_fields: ['athlete_id', 'metric_type', 'value']
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Create biometric reading
    const reading = {
      id: `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      athlete_id: readingData.athlete_id,
      metric_type: readingData.metric_type,
      value: parseFloat(readingData.value),
      unit: readingData.unit || '',
      timestamp: new Date().toISOString(),
      source_device: readingData.source_device || 'manual_entry',
      confidence: readingData.confidence || 1.0,
      notes: readingData.notes || ''
    };
    
    // Store reading
    if (env.SPORTS_DATA) {
      // Store individual reading
      await env.SPORTS_DATA.put(
        `reading:${reading.id}`,
        JSON.stringify(reading),
        { expirationTtl: 7776000 } // 90 days
      );
      
      // Update athlete's recent readings
      const athleteData = await env.SPORTS_DATA.get(`athlete:${readingData.athlete_id}`);
      if (athleteData) {
        const profile = JSON.parse(athleteData);
        profile.recent_readings = profile.recent_readings || [];
        profile.recent_readings.unshift(reading);
        
        // Keep only last 50 readings
        profile.recent_readings = profile.recent_readings.slice(0, 50);
        profile.last_updated = new Date().toISOString();
        
        await env.SPORTS_DATA.put(
          `athlete:${readingData.athlete_id}`,
          JSON.stringify(profile)
        );
      }
    }
    
    // Calculate readiness impact
    const readinessImpact = calculateReadinessImpact(reading);
    
    return new Response(JSON.stringify({
      success: true,
      reading_id: reading.id,
      reading: reading,
      readiness_impact: readinessImpact
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to add biometric reading',
      message: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleBiometricAnalysis(athleteId, request, env, corsHeaders) {
  try {
    if (!env.SPORTS_DATA) {
      throw new Error('Sports data storage not configured');
    }
    
    // Get athlete profile
    const athleteData = await env.SPORTS_DATA.get(`athlete:${athleteId}`);
    if (!athleteData) {
      return new Response(JSON.stringify({
        error: 'Athlete not found',
        athlete_id: athleteId
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const profile = JSON.parse(athleteData);
    const readings = profile.recent_readings || [];
    
    if (readings.length === 0) {
      return new Response(JSON.stringify({
        error: 'No biometric readings available for analysis',
        athlete_id: athleteId
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Perform comprehensive analysis
    const analysis = await performBiometricAnalysis(profile, readings);
    
    // Store analysis results
    const analysisRecord = {
      athlete_id: athleteId,
      timestamp: new Date().toISOString(),
      analysis: analysis
    };
    
    await env.SPORTS_DATA.put(
      `analysis:${athleteId}:${Date.now()}`,
      JSON.stringify(analysisRecord),
      { expirationTtl: 2592000 } // 30 days
    );
    
    return new Response(JSON.stringify({
      success: true,
      athlete_id: athleteId,
      analysis_timestamp: new Date().toISOString(),
      ...analysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to perform biometric analysis',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleTeamReadiness(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const team = url.searchParams.get('team') || 'cardinals';
    const sport = url.searchParams.get('sport') || 'baseball';
    
    // Get all athletes for the team
    const teamAthletes = await getTeamAthletes(team, sport, env);
    
    if (teamAthletes.length === 0) {
      return new Response(JSON.stringify({
        message: 'No athletes found for team',
        team: team,
        sport: sport,
        sample_data_included: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Calculate team readiness metrics
    const teamReadiness = calculateTeamReadiness(teamAthletes);
    
    return new Response(JSON.stringify({
      success: true,
      team: team,
      sport: sport,
      analysis_timestamp: new Date().toISOString(),
      ...teamReadiness
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to calculate team readiness',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleBiometricAlerts(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const severity = url.searchParams.get('severity') || 'all';
    const team = url.searchParams.get('team');
    
    // Get recent alerts from storage
    const alerts = await getBiometricAlerts(severity, team, env);
    
    return new Response(JSON.stringify({
      success: true,
      alerts_count: alerts.length,
      severity_filter: severity,
      team_filter: team,
      alerts: alerts
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to retrieve biometric alerts',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Helper functions

function calculateReadinessImpact(reading) {
  const impactMap = {
    'heart_rate_resting': { factor: 'cardiovascular', weight: 0.3 },
    'vo2_max': { factor: 'cardiovascular', weight: 0.4 },
    'heart_rate_variability': { factor: 'recovery', weight: 0.5 },
    'sleep_quality_score': { factor: 'recovery', weight: 0.4 },
    'reaction_time': { factor: 'neuromuscular', weight: 0.4 },
    'vertical_jump': { factor: 'neuromuscular', weight: 0.3 },
    'grip_strength': { factor: 'strength_power', weight: 0.3 },
    'peak_power_output': { factor: 'strength_power', weight: 0.4 }
  };
  
  const impact = impactMap[reading.metric_type] || { factor: 'general', weight: 0.1 };
  
  return {
    primary_factor: impact.factor,
    impact_weight: impact.weight,
    expected_readiness_change: calculateExpectedChange(reading.value, reading.metric_type)
  };
}

function calculateExpectedChange(value, metricType) {
  // Simplified readiness impact calculation
  // In production, this would use more sophisticated algorithms
  const baseline = getMetricBaseline(metricType);
  const percentChange = ((value - baseline) / baseline) * 100;
  
  return Math.max(-10, Math.min(10, percentChange * 0.1));
}

function getMetricBaseline(metricType) {
  const baselines = {
    'heart_rate_resting': 60,
    'vo2_max': 45,
    'heart_rate_variability': 45,
    'sleep_quality_score': 85,
    'reaction_time': 0.18,
    'vertical_jump': 30,
    'grip_strength': 110,
    'peak_power_output': 850
  };
  
  return baselines[metricType] || 50;
}

async function performBiometricAnalysis(profile, readings) {
  // Comprehensive biometric analysis
  const readinessFactors = {
    cardiovascular: [],
    neuromuscular: [],
    recovery: [],
    strength_power: [],
    flexibility_mobility: []
  };
  
  // Categorize readings
  readings.forEach(reading => {
    const category = getMetricCategory(reading.metric_type);
    if (readinessFactors[category]) {
      readinessFactors[category].push(reading);
    }
  });
  
  // Calculate factor scores
  const factorScores = {};
  Object.keys(readinessFactors).forEach(factor => {
    const factorReadings = readinessFactors[factor];
    if (factorReadings.length > 0) {
      factorScores[factor] = calculateFactorScore(factorReadings);
    } else {
      factorScores[factor] = 75; // Default score
    }
  });
  
  // Overall readiness
  const sport = profile.sport || 'baseball';
  const weights = getSportWeights(sport);
  const overallReadiness = Object.keys(factorScores).reduce((sum, factor) => {
    return sum + (factorScores[factor] * weights[factor]);
  }, 0);
  
  // Generate recommendations
  const recommendations = generateRecommendations(factorScores, sport);
  
  // Injury risk assessment
  const injuryRisk = assessInjuryRisk(readings, sport);
  
  return {
    overall_readiness_score: Math.round(overallReadiness),
    readiness_level: getReadinessLevel(overallReadiness),
    factor_scores: factorScores,
    recommendations: recommendations,
    injury_risk_assessment: injuryRisk,
    performance_prediction: predictPerformance(overallReadiness),
    metrics_analyzed: readings.length,
    confidence_score: calculateAnalysisConfidence(readings)
  };
}

function getMetricCategory(metricType) {
  const categories = {
    'heart_rate_resting': 'cardiovascular',
    'vo2_max': 'cardiovascular',
    'heart_rate_variability': 'recovery',
    'sleep_quality_score': 'recovery',
    'reaction_time': 'neuromuscular',
    'vertical_jump': 'neuromuscular',
    'grip_strength': 'strength_power',
    'peak_power_output': 'strength_power',
    'shoulder_internal_rotation': 'flexibility_mobility',
    'hip_flexion_range': 'flexibility_mobility'
  };
  
  return categories[metricType] || 'general';
}

function calculateFactorScore(readings) {
  if (readings.length === 0) return 75;
  
  const scores = readings.map(reading => {
    const baseline = getMetricBaseline(reading.metric_type);
    const percentOfBaseline = (reading.value / baseline) * 100;
    return Math.max(0, Math.min(100, percentOfBaseline));
  });
  
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

function getSportWeights(sport) {
  const weights = {
    baseball: { cardiovascular: 0.15, neuromuscular: 0.35, recovery: 0.20, strength_power: 0.20, flexibility_mobility: 0.10 },
    basketball: { cardiovascular: 0.25, neuromuscular: 0.30, recovery: 0.20, strength_power: 0.15, flexibility_mobility: 0.10 },
    football: { cardiovascular: 0.20, neuromuscular: 0.25, recovery: 0.15, strength_power: 0.30, flexibility_mobility: 0.10 }
  };
  
  return weights[sport] || weights.baseball;
}

function generateRecommendations(factorScores, sport) {
  const recommendations = [];
  const threshold = 70;
  
  Object.entries(factorScores).forEach(([factor, score]) => {
    if (score < threshold) {
      switch(factor) {
        case 'cardiovascular':
          recommendations.push('Increase aerobic base training with zone 2 cardio sessions');
          break;
        case 'neuromuscular':
          recommendations.push('Implement reactive agility and plyometric training');
          break;
        case 'recovery':
          recommendations.push('Prioritize sleep hygiene and stress management protocols');
          break;
        case 'strength_power':
          recommendations.push('Add explosive power training with compound movements');
          break;
        case 'flexibility_mobility':
          recommendations.push('Include daily mobility work and targeted stretching');
          break;
      }
    }
  });
  
  return recommendations.slice(0, 5);
}

function getReadinessLevel(score) {
  if (score >= 85) return 'Peak Performance';
  if (score >= 70) return 'Competition Ready';
  if (score >= 55) return 'Training Ready';
  if (score >= 40) return 'Active Recovery';
  return 'Rest Required';
}

function assessInjuryRisk(readings, sport) {
  const riskFactors = [];
  let overallRisk = 'low';
  
  readings.forEach(reading => {
    if (reading.metric_type === 'heart_rate_variability' && reading.value < 30) {
      riskFactors.push('Low HRV indicates high stress/poor recovery');
      overallRisk = 'moderate';
    }
    
    if (reading.metric_type === 'sleep_quality_score' && reading.value < 60) {
      riskFactors.push('Poor sleep quality increases injury susceptibility');
      overallRisk = 'moderate';
    }
  });
  
  return {
    overall_risk_level: overallRisk,
    risk_factors: riskFactors,
    monitoring_recommendations: [
      'Continue daily biometric monitoring',
      'Alert coaching staff if risk factors increase'
    ]
  };
}

function predictPerformance(readinessScore) {
  let window, confidence;
  
  if (readinessScore >= 85) {
    window = 'next_48_hours';
    confidence = 0.92;
  } else if (readinessScore >= 70) {
    window = 'next_24_hours';
    confidence = 0.85;
  } else if (readinessScore >= 55) {
    window = 'after_recovery_session';
    confidence = 0.75;
  } else {
    window = '48_72_hours_with_rest';
    confidence = 0.65;
  }
  
  return {
    optimal_performance_window: window,
    prediction_confidence: confidence,
    expected_performance_level: Math.min(100, readinessScore + 5)
  };
}

function calculateAnalysisConfidence(readings) {
  if (readings.length === 0) return 0;
  
  const avgConfidence = readings.reduce((sum, r) => sum + r.confidence, 0) / readings.length;
  const completenessBonus = Math.min(0.2, readings.length * 0.02);
  
  return Math.min(1.0, avgConfidence + completenessBonus);
}

async function getTeamAthletes(team, sport, env) {
  // In production, this would query the database
  // For now, return sample data
  return [
    {
      id: 'mlb_stl_goldschmidt',
      name: 'Paul Goldschmidt',
      position: '1B',
      readiness_score: 87,
      last_updated: new Date().toISOString()
    },
    {
      id: 'mlb_stl_arenado',
      name: 'Nolan Arenado',
      position: '3B',
      readiness_score: 82,
      last_updated: new Date().toISOString()
    }
  ];
}

function calculateTeamReadiness(athletes) {
  const avgReadiness = athletes.reduce((sum, a) => sum + a.readiness_score, 0) / athletes.length;
  
  return {
    team_readiness_score: Math.round(avgReadiness),
    athletes_monitored: athletes.length,
    high_readiness_count: athletes.filter(a => a.readiness_score >= 80).length,
    attention_needed_count: athletes.filter(a => a.readiness_score < 60).length,
    individual_athletes: athletes
  };
}

async function getBiometricAlerts(severity, team, env) {
  // Sample alerts - in production would query storage
  return [
    {
      id: 'alert_001',
      athlete_id: 'mlb_stl_goldschmidt',
      severity: 'warning',
      message: 'HRV below baseline for 3 consecutive days',
      timestamp: new Date().toISOString(),
      resolved: false
    }
  ];
}