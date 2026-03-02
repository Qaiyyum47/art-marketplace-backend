import express from 'express';

const app = express();

// Middlewares
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Art Marketplace API');
});

export default app;
