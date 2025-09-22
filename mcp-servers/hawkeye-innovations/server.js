const http = require('http');

function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/health') {
    res.end(JSON.stringify({ status: 'ok', data: 'hawkeye-innovations server ready' }));
  } else if (req.url === '/mock-data') {
    res.end(JSON.stringify({ status: 'ok', data: { message: 'This is a mock response' } }));
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ status: 'error', data: 'Not Found' }));
  }
}

function startServer(port = 3000) {
  const server = http.createServer(handler);
  server.listen(port, () => {
    console.log(`Hawkeye Innovations server listening on port ${port}`);
  });
  return server;
}

module.exports = { startServer };
