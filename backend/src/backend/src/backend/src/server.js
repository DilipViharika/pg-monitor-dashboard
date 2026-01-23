require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 4000;

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'healthy', timestamp: result.rows[0].now });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});

// API Routes
app.use('/api/overview', require('./routes/overview'));
app.use('/api/performance', require('./routes/performance'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/reliability', require('./routes/reliability'));
app.use('/api/indexes', require('./routes/indexes'));

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`PG Monitor API server running on port ${PORT}`);
});

// Export pool for routes
module.exports = { pool };
