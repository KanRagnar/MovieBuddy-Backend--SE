import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/database.js';

const PORT = process.env.PORT || 3000;

/**
 * Bootstraps database connection (or mock mode) and starts the HTTP server.
 */
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`MovieBuddy Backend API running at http://localhost:${PORT}`);
  });
};

startServer();
