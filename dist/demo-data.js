(() => {
  if (typeof window === 'undefined') {
    return;
  }

  const now = new Date().toISOString();
  const teams = [
    { id: 'cardinals', name: 'St. Louis Cardinals', sport: 'MLB', record: '12-5', streak: 'W3', leverage: 91 },
    { id: 'titans', name: 'Tennessee Titans', sport: 'NFL', record: '3-1', streak: 'W2', leverage: 87 },
    { id: 'longhorns', name: 'Texas Longhorns', sport: 'NCAA', record: '5-0', streak: 'W5', leverage: 94 },
    { id: 'grizzlies', name: 'Memphis Grizzlies', sport: 'NBA', record: '7-3', streak: 'W4', leverage: 89 }
  ];

  const liveGames = [
    { id: 'mlb-cardinals', matchup: 'Cardinals vs Cubs', score: '5-3', status: 'Top 7th', winProbability: 0.72 },
    { id: 'nfl-titans', matchup: 'Titans vs Texans', score: '21-17', status: '3rd Quarter', winProbability: 0.61 },
    { id: 'ncaa-longhorns', matchup: 'Longhorns vs Sooners', score: '14-10', status: '2nd Quarter', winProbability: 0.54 },
    { id: 'nba-grizzlies', matchup: 'Grizzlies vs Mavs', score: '88-83', status: '4th Quarter', winProbability: 0.58 }
  ];

  const pressureMetrics = [
    { id: 'clutch-index', label: 'Clutch Index', value: 92, trend: 'up' },
    { id: 'grit-rating', label: 'Grit Rating', value: 89, trend: 'steady' },
    { id: 'momentum', label: 'Momentum', value: 86, trend: 'up' }
  ];

  window.BLAZE_DEMO_DATA = {
    generatedAt: now,
    teams,
    liveGames,
    pressureMetrics
  };

  window.dispatchEvent(new CustomEvent('blaze:demo-data-ready', {
    detail: window.BLAZE_DEMO_DATA
  }));

  console.info('✅ Blaze demo data loaded', window.BLAZE_DEMO_DATA);
})();
