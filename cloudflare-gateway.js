// Minimal cloudflare-gateway function (disabled for performance optimization)
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Cloudflare gateway disabled for performance optimization',
      status: 'ok'
    })
  };
};