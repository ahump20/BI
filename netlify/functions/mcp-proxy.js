exports.handler = async (event) => {
  const headers = { 'content-type': 'application/json' };

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        error: 'method_not_allowed',
        tip: 'POST a JSON-RPC 2.0 payload'
      })
    };
  }

  let payload = {};
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'invalid_json',
        detail: error.message
      })
    };
  }

  if (payload.jsonrpc !== '2.0' || !payload.method) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'bad_request',
        tip: 'Expected { "jsonrpc":"2.0", "id":"...", "method":"...", "params":{...} }'
      })
    };
  }

  // TODO: integrate with Hawk-Eye backend. For now, echo success.
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ jsonrpc: '2.0', id: payload.id ?? null, result: { ok: true } })
  };
};
