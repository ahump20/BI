exports.handler = async () => ({
  statusCode: 200,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ ok: true, service: 'blaze', ts: new Date().toISOString() })
});
