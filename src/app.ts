import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import artworkRoutes from './routes/artworkRoutes';
import artistRoutes from './routes/artistRoutes';
import uploadRoutes from './routes/uploadRoutes';
import adminRoutes from './routes/adminRoutes';
import { protect } from './middleware/authMiddleware';
import { errorHandler, notFound } from './middleware/errorMiddleware';
import { rateLimitGlobal } from './middleware/rateLimiter';
import { sanitizeInputs } from './middleware/sanitizer';
import { responseSizeTracker } from './utils/costMonitor';
import { env } from './config/env';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (env.CORS_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS: Origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

app.use(sanitizeInputs);

// Track response sizes for cost monitoring
app.use(responseSizeTracker);

app.use(rateLimitGlobal);

// Note: Static uploads folder removed - all images are stored in Cloudinary
// This saves server disk space and reduces hosting costs

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Art Marketplace API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      artworks: '/api/artworks',
      artists: '/api/artists',
      upload: '/api/upload',
      admin: '/api/admin',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/artworks', artworkRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', uploadRoutes);

app.get('/api/protected', protect, (req, res) => {
  const userId = req.userId;
  res.json({ message: `Welcome user ${userId}! You accessed a protected route.` });
});

app.use(notFound);
app.use(errorHandler);

export default app;
