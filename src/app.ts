import express from 'express';
import authRoutes from './routes/authRoutes';
import artworkRoutes from './routes/artworkRoutes';
import { protect } from './middleware/authMiddleware';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Art Marketplace API');
});

app.use('/api/auth', authRoutes);
app.use('/api/artworks', artworkRoutes);

app.get('/api/protected', protect, (req, res) => {
  res.json({ message: `Welcome, user ${req.userId}! You accessed a protected route.` });
});

export default app;