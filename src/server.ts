import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { validateAndReportEnvironment } from './utils/envValidator';

const startServer = async () => {
  try {
    // Validate environment configuration before starting
    if (!validateAndReportEnvironment()) {
      process.exit(1);
    }

    await connectDatabase();

    const server = app.listen(env.PORT, () => {
      process.stdout.write(`Server is running on port ${env.PORT}\n`);
      process.stdout.write(`Environment: ${env.NODE_ENV}\n`);
    });

    process.on('SIGTERM', () => {
      process.stdout.write('SIGTERM signal received: closing HTTP server\n');
      server.close(() => {
        process.stdout.write('HTTP server closed\n');
        process.exit(0);
      });
    });
  } catch (error) {
    process.stderr.write(`Failed to start server: ${error}\n`);
    process.exit(1);
  }
};

startServer();