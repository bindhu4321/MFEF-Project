const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const { validateApiKey, requireApiKey } = require('./middleware/apiKey.middleware');
const { createSecureServer } = require('./config/certs');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    return callback(new Error('CORS Policy restriction: Origin not allowed.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// HTTP Request Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global API Key validation middleware
app.use(validateApiKey);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    system: 'Small Business Financial Management System API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Dedicated API Key Verification Endpoint (for Postman & Security verification)
app.get('/api/verify-api-key', requireApiKey, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Key is valid and authorized.'
  });
});

// Mount Application Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/revenue', require('./routes/revenue.routes'));
app.use('/api/expenses', require('./routes/expense.routes'));
app.use('/api/investments', require('./routes/investment.routes'));
app.use('/api/cashflow', require('./routes/cashflow.routes'));
app.use('/api/reports', require('./routes/report.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/user', require('./routes/user.routes'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});

if (require.main === module) {
  const secureServer = createSecureServer(app);

  if (secureServer) {
    secureServer.listen(PORT, () => {
      console.log(`[Server] Secure HTTPS server running on port ${PORT}`);
    });
  } else {
    app.listen(PORT, () => {
      console.log(`[Server] Small Business Finance REST API running on http://localhost:${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  }
}

module.exports = app;
