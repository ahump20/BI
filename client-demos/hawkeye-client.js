const { startServer } = require('../mcp-servers/hawkeye-innovations/server');

async function runDemo() {
  const server = startServer(3000);
  // wait briefly for server to start
  await new Promise(r => setTimeout(r, 100));

  const healthRes = await fetch('http://localhost:3000/health');
  const healthJson = await healthRes.json();
  console.log('GET /health =>', healthJson);

  const mockRes = await fetch('http://localhost:3000/mock-data');
  const mockJson = await mockRes.json();
  console.log('GET /mock-data =>', mockJson);

  server.close();
}

runDemo().catch(err => {
  console.error('Demo failed', err);
});
