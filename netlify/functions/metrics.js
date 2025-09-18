exports.handler = async () => {
  const metrics = {
    response_time_ms: 86,
    accuracy_pct: 94.6,
    uptime_pct: 99.95,
    build_ts: new Date().toISOString()
  };

  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(metrics)
  };
};
