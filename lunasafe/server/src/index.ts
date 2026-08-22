import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'InfraPulse AI - Pune Smart City Maintenance',
    timestamp: new Date().toISOString()
  });
});

// Register routes
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`🚀 InfraPulse AI Server running on http://localhost:${PORT}`);
  console.log(`📍 Monitoring Pune Municipal Corporation (PMC) Infrastructure Zones`);
});
