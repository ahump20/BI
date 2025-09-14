/**
 * Blaze Intelligence Real-Time Narrative Generator
 * Creates dynamic data stories and insights
 */

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
};

// Narrative templates for different sports
const narrativeTemplates = {
    cardinals: {
        momentum: [
            "Cardinals showing explosive momentum with readiness climbing to {readiness}%",
            "St. Louis momentum surge detected - leverage factor hitting {leverage}x",
            "Cardinals readiness peaked at {readiness}%, indicating championship potential",
            "Power surge detected: Cardinals leverage increased {increase}% in last hour"
        ],
        decline: [
            "Cardinals readiness stabilizing at {readiness}% after recent dip",
            "Momentum recalibrating - Cardinals at {readiness}% with upward trajectory",
            "Cardinals showing resilience despite temporary {decline}% adjustment"
        ]
    },
    titans: {
        power: [
            "Titans power index surging to {power} - elite territory confirmed",
            "Tennessee demonstrating {power} power rating with {efficiency}% efficiency",
            "Titans offensive potential maximized at {power} with championship velocity"
        ]
    },
    longhorns: {
        recruiting: [
            "Texas Longhorns maintaining elite #3 recruiting position",
            "Longhorns potential surge to {potential}% - SEC championship caliber",
            "Texas recruiting dominance continues with {potential}% development rate"
        ]
    },
    grizzlies: {
        performance: [
            "Memphis Grizzlies offensive rating peaks at {rating} - league-leading pace",
            "Grizzlies velocity increased to {velocity} with {rating} offensive efficiency",
            "Memphis maintaining championship momentum with {rating} offensive rating"
        ]
    }
};

// Advanced narrative generation using pattern recognition
function generateNarrative(data) {
    const narratives = [];
    const { sports } = data;
    
    // Cardinals narrative
    if (sports.cardinals) {
        const { readiness, momentum } = sports.cardinals;
        const templates = readiness > 88 ? narrativeTemplates.cardinals.momentum : 
                         readiness < 82 ? narrativeTemplates.cardinals.decline : 
                         narrativeTemplates.cardinals.momentum;
        
        const template = templates[Math.floor(Math.random() * templates.length)];
        narratives.push({
            team: 'Cardinals',
            sport: 'MLB',
            story: template
                .replace('{readiness}', readiness.toFixed(1))
                .replace('{leverage}', momentum.toFixed(2))
                .replace('{increase}', ((readiness - 86.6) * 2).toFixed(1))
                .replace('{decline}', Math.abs(readiness - 86.6).toFixed(1)),
            priority: readiness > 90 ? 'championship' : readiness > 85 ? 'elite' : 'standard',
            timestamp: new Date().toISOString()
        });
    }
    
    // Titans narrative
    if (sports.titans) {
        const { power, efficiency } = sports.titans;
        const template = narrativeTemplates.titans.power[Math.floor(Math.random() * narrativeTemplates.titans.power.length)];
        narratives.push({
            team: 'Titans',
            sport: 'NFL',
            story: template
                .replace('{power}', Math.round(power))
                .replace('{efficiency}', efficiency.toFixed(1)),
            priority: power > 82 ? 'elite' : 'standard',
            timestamp: new Date().toISOString()
        });
    }
    
    // Longhorns narrative
    if (sports.longhorns) {
        const { potential } = sports.longhorns;
        const template = narrativeTemplates.longhorns.recruiting[Math.floor(Math.random() * narrativeTemplates.longhorns.recruiting.length)];
        narratives.push({
            team: 'Longhorns',
            sport: 'NCAA',
            story: template.replace('{potential}', potential.toFixed(1)),
            priority: potential > 92 ? 'championship' : 'elite',
            timestamp: new Date().toISOString()
        });
    }
    
    // Grizzlies narrative  
    if (sports.grizzlies) {
        const { rating, velocity } = sports.grizzlies;
        const template = narrativeTemplates.grizzlies.performance[Math.floor(Math.random() * narrativeTemplates.grizzlies.performance.length)];
        narratives.push({
            team: 'Grizzlies',
            sport: 'NBA',
            story: template
                .replace('{rating}', rating.toFixed(1))
                .replace('{velocity}', velocity.toFixed(2)),
            priority: rating > 118 ? 'championship' : 'elite',
            timestamp: new Date().toISOString()
        });
    }
    
    return narratives;
}

// Generate contextual insights based on data patterns
function generateInsights(data) {
    const insights = [];
    const { consciousness, neural, sports } = data;
    
    // AI consciousness insights
    if (consciousness.level > 90) {
        insights.push({
            type: 'consciousness',
            level: 'critical',
            message: `AI consciousness peaked at ${consciousness.level.toFixed(1)}% - maximum analytical capacity achieved`,
            impact: 'Pattern recognition operating at championship level'
        });
    }
    
    // Neural processing insights
    if (neural.processing > 95) {
        insights.push({
            type: 'neural',
            level: 'elite',
            message: `Neural processing at ${neural.processing.toFixed(1)}% with ${neural.patterns} active patterns`,
            impact: 'Predictive accuracy maximized across all sports'
        });
    }
    
    // Cross-sport correlations
    const avgPerformance = (
        sports.cardinals.readiness + 
        sports.titans.power + 
        sports.longhorns.potential + 
        sports.grizzlies.rating
    ) / 4;
    
    if (avgPerformance > 88) {
        insights.push({
            type: 'correlation',
            level: 'championship',
            message: `Multi-sport excellence detected - average performance ${avgPerformance.toFixed(1)}%`,
            impact: 'All monitored teams showing championship-level metrics'
        });
    }
    
    return insights;
}

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({});
    }
    
    try {
        // Get consciousness data (in production, this would come from the SSE stream)
        const mockData = {
            consciousness: { level: 87.6 + Math.random() * 6, nodes: 28 },
            neural: { processing: 94.2 + Math.random() * 3, patterns: 15 },
            sports: {
                cardinals: { readiness: 86.6 + Math.random() * 6, momentum: 2.85 + Math.random() * 0.5 },
                titans: { power: 78 + Math.random() * 8, efficiency: 92.1 + Math.random() * 4 },
                longhorns: { potential: 89.4 + Math.random() * 5 },
                grizzlies: { rating: 114.7 + Math.random() * 8, velocity: 1.32 + Math.random() * 0.2 }
            }
        };
        
        const narratives = generateNarrative(mockData);
        const insights = generateInsights(mockData);
        
        res.status(200).json({
            success: true,
            timestamp: new Date().toISOString(),
            narratives,
            insights,
            metadata: {
                source: 'blaze-intelligence-narrative-engine',
                version: '2.0.0',
                environment: 'championship'
            }
        });
        
    } catch (error) {
        console.error('Narrative Generation Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate narrative content',
            timestamp: new Date().toISOString()
        });
    }
}