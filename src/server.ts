import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';

const startServer = async () => {
  try {
    await connectDatabase();

    const server = app.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
