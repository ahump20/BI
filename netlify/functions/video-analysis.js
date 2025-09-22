exports.handler = async () => ({
  statusCode: 501,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    error: 'not_implemented',
    detail: 'Endpoint stubbed; deployment pending',
    docs: 'mailto:ahump20@outlook.com'
  })
});
