const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function generatePoseFrame() {
  const basePoints = [
    { name: 'head', x: 0.5, y: 0.08 },
    { name: 'neck', x: 0.5, y: 0.18 },
    { name: 'left_shoulder', x: 0.42, y: 0.22 },
    { name: 'right_shoulder', x: 0.58, y: 0.22 },
    { name: 'left_elbow', x: 0.36, y: 0.36 },
    { name: 'right_elbow', x: 0.64, y: 0.36 },
    { name: 'left_wrist', x: 0.32, y: 0.52 },
    { name: 'right_wrist', x: 0.68, y: 0.52 },
    { name: 'spine', x: 0.5, y: 0.35 },
    { name: 'hip', x: 0.5, y: 0.48 },
    { name: 'left_hip', x: 0.46, y: 0.5 },
    { name: 'right_hip', x: 0.54, y: 0.5 },
    { name: 'left_knee', x: 0.45, y: 0.68 },
    { name: 'right_knee', x: 0.55, y: 0.68 },
    { name: 'left_ankle', x: 0.44, y: 0.88 },
    { name: 'right_ankle', x: 0.56, y: 0.88 }
  ];

  const jittered = basePoints.map(point => ({
    ...point,
    x: Math.min(0.68, Math.max(0.32, point.x + (Math.random() - 0.5) * 0.02)),
    y: Math.min(0.92, Math.max(0.06, point.y + (Math.random() - 0.5) * 0.025))
  }));

  const segments = [
    ['head', 'neck'],
    ['neck', 'left_shoulder'],
    ['neck', 'right_shoulder'],
    ['left_shoulder', 'left_elbow'],
    ['right_shoulder', 'right_elbow'],
    ['left_elbow', 'left_wrist'],
    ['right_elbow', 'right_wrist'],
    ['neck', 'spine'],
    ['spine', 'hip'],
    ['hip', 'left_hip'],
    ['hip', 'right_hip'],
    ['left_hip', 'left_knee'],
    ['right_hip', 'right_knee'],
    ['left_knee', 'left_ankle'],
    ['right_knee', 'right_ankle']
  ];

  return { points: jittered, segments };
}

function buildSession(athlete, focus, zone) {
  const intensity = Math.round(Math.random() * 25 + 70);
  return {
    athlete,
    focus,
    zone,
    startTime: new Date(Date.now() - Math.floor(Math.random() * 25) * 60000).toISOString(),
    live: Math.random() > 0.35,
    intensity,
    confidence: Math.round(Math.random() * 6 + 92)
  };
}

function buildTimeline() {
  const events = [
    'Hip rotation peak synchronized with bat path window',
    'Coach overlay recommends 2° shoulder tilt adjustment',
    'Ground reaction force stabilized at 94% efficiency',
    'Neural coach shifts focus to mental reset cadence',
    'Asymmetry warning resolved after mobility cue',
    'Acceleration spike logged at stride phase entry'
  ];

  return events.slice(0, 5).map((message, index) => ({
    id: `evt-${Date.now()}-${index}`,
    message,
    emphasis: index === 0 ? 'high' : index <= 2 ? 'medium' : 'normal',
    ago: `${Math.floor(Math.random() * 5) + index * 2} min`
  }));
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'method_not_allowed', allowed: ['GET'] })
    };
  }

  const latency = Math.round(Math.random() * 18 + 36);
  const overlay = Math.round(Math.random() * 8 + 92);
  const loadIndex = Math.round(Math.random() * 10 + 86);
  const asymmetry = Math.round(Math.random() * 4 + 3);

  const responsePayload = {
    timestamp: new Date().toISOString(),
    status: 'operational',
    ar: {
      latencyMs: latency,
      overlayConfidence: overlay,
      renderStability: Math.round(Math.random() * 5 + 94),
      activeSessions: Math.round(Math.random() * 4 + 6)
    },
    biomechanics: {
      loadIndex,
      asymmetry,
      powerOutput: Math.round(Math.random() * 12 + 88),
      fatigueRisk: asymmetry > 5 ? 'watch' : 'stable',
      leadAngles: [
        { joint: 'Shoulder', value: Math.round(Math.random() * 6 + 92) },
        { joint: 'Hip', value: Math.round(Math.random() * 6 + 88) },
        { joint: 'Knee', value: Math.round(Math.random() * 6 + 90) },
        { joint: 'Ankle', value: Math.round(Math.random() * 6 + 94) }
      ],
      pose: generatePoseFrame()
    },
    sessions: [
      buildSession('Madison Reyes', 'Left-handed load sequencing', 'Diamond Lab A'),
      buildSession('Jalen Carter', 'QB release timing', 'Augmented Field'),
      buildSession('Sierra Brooks', 'Explosive first step', 'Biomech Bay 3')
    ],
    sensors: [
      { id: 'IMU-04', location: 'Lead Hip', health: Math.round(Math.random() * 5 + 94), battery: Math.round(Math.random() * 20 + 60) },
      { id: 'IMU-07', location: 'Trail Shoulder', health: Math.round(Math.random() * 4 + 91), battery: Math.round(Math.random() * 15 + 70) },
      { id: 'FORCE-02', location: 'Plant Foot', health: Math.round(Math.random() * 3 + 95), battery: Math.round(Math.random() * 10 + 75) }
    ],
    timeline: buildTimeline(),
    recommendations: [
      'Lock in hip-shoulder separation at 38° for peak torque.',
      'Tempo cue: “smooth to launch” to preserve neural efficiency.',
      'Integrate breathing cadence with AR overlay for composure resets.'
    ]
  };

  return {
    statusCode: 200,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
      ...corsHeaders
    },
    body: JSON.stringify(responsePayload)
  };
};
