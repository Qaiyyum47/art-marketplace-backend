import express from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import artworkRoutes from './routes/artworkRoutes';
import uploadRoutes from './routes/uploadRoutes';
import { protect } from './middleware/authMiddleware';
import { errorHandler, notFound } from './middleware/errorMiddleware';
import { requestLogger } from './middleware/requestLogger';
import { rateLimitGlobal } from './middleware/rateLimiter';
import { sanitizeInputs } from './middleware/sanitizer';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

app.use(requestLogger);

app.use(sanitizeInputs);

app.use(rateLimitGlobal);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Art Marketplace API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      artworks: '/api/v1/artworks',
      upload: '/api/v1/upload',
    },
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/v1/artworks', artworkRoutes);
app.use('/api/artworks', artworkRoutes);
app.use('/api/v1', uploadRoutes);

app.get('/api/v1/protected', protect, (req, res) => {
  const userId = (req as any).userId;
  res.json({ message: `Welcome user ${userId}! You accessed a protected route.` });
});

app.use(notFound);
app.use(errorHandler);

export default app;
