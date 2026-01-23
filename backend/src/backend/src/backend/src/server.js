const express = require('express');
const cors = require('cors');
require('dotenv').config();

const overviewRoutes = require('./routes/overview');
const performanceRoutes = require('./routes/performance');
const resourcesRoutes = require('./routes/resources');
const reliabilityRoutes = require('./routes/reliability');
const indexesRoutes = require('./routes/indexes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'PG Monitor API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      overview: '/api/overview',
      performance: '/api/performance/cluster-activity',
      slowQueries: '/api/performance/slow-queries',
      resources: '/api/resources',
      reliability: '/api/reliability',
      indexes: '/api/indexes'
    }
  });
});

// API routes
app.use('/api/overview', overviewRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/reliability', reliabilityRoutes);
app.use('/api/indexes', indexesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log('\n🚀 PG Monitor API Server Started');
  console.log('=====================================');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`📊 Endpoints: http://localhost:${PORT}/`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('=====================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
