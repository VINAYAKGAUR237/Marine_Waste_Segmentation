const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { connectDB } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const predictRoutes = require('./routes/predict');
const historyRoutes = require('./routes/history');
const feedbackRoutes = require('./routes/feedback');
const metaRoutes = require('./routes/meta');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// CORS configuration for React frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Allow during local development
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api', metaRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    service: 'Marine Debris Express Backend',
    version: '1.0.0',
    status: 'running',
    fastapi_proxy: process.env.FASTAPI_URL || 'http://127.0.0.1:8000',
  });
});

// Basic Error Handling Middleware
app.use(errorHandler);

const HOST = process.env.HOST || '127.0.0.1';

const server = app.listen(PORT, HOST, () => {
  console.log(`[Express] Server running on http://${HOST}:${PORT}`);
});

module.exports = { app, server };
