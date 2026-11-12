import app from './app.js';
import { config } from './config/constants.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

/**
 * Connects the data store and starts the HTTP server.
 * @returns {Promise<void>}
 */
async function start() {
  const storage = await connectDatabase();
  const server = app.listen(config.port, () => {
    console.log(`MovieBuddy API listening on http://localhost:${config.port}${config.apiPrefix} (storage: ${storage}, auth required: ${config.requireAuth})`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((error) => {
  console.error('Failed to start the server:', error);
  process.exit(1);
});
