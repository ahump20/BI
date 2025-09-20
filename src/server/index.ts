import { createServer } from 'http';

import { ENV } from './config/env.js';
import { createApp } from './app.js';

const app = createApp();
const server = createServer(app);

const PORT = ENV.port;

server.listen(PORT, () => {
  console.info(`🚀 Blaze Intelligence API running on port ${PORT}`);
});

const shutdown = (signal: NodeJS.Signals) => {
  console.info(`Received ${signal}. Closing server...`);
  server.close(() => {
    console.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
