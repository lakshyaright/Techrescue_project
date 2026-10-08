const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const queryRoutes = require('./src/routes/queryRoutes');
const expertRoutes = require('./src/routes/expertRoutes');
const engineerRoutes = require('./src/routes/engineerRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/queries', queryRoutes);
app.use('/api/v1/experts', expertRoutes);
app.use('/api/v1/engineers', engineerRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/payments', paymentRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`TechRescue Backend API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

module.exports = app;
