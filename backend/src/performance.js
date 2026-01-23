const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

router.get('/cluster-activity', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    
    // Generate time series with sample data
    // In production, query from a metrics history table
    const query = `
      SELECT 
        to_char(day, 'Mon DD') as date,
        1500 + (random() * 500)::int as tps,
        800 + (random() * 300)::int as qps
      FROM generate_series(
        now() - interval '${days} days',
        now(),
        interval '1 day'
      ) as day
      ORDER BY day
    `;
    
    const result = await pool.query(query);
    
    res.json({
      labels: result.rows.map(r => r.date),
      datasets: {
        qps: result.rows.map(r => parseInt(r.qps)),
        tps: result.rows.map(r => parseInt(r.tps))
      }
    });
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics', details: error.message });
  }
});

router.get('/slow-queries', async (req, res) => {
  try {
    const query = `
      SELECT 
        queryid,
        LEFT(query, 100) as query_text,
        calls,
        mean_exec_time,
        total_exec_time
      FROM pg_stat_statements
      WHERE mean_exec_time > 10
      ORDER BY mean_exec_time DESC
      LIMIT 20
    `;
    
    const result = await pool.query(query).catch(() => ({ rows: [] }));
    
    res.json({
      slowQueries: result.rows.map(row => ({
        queryId: row.queryid?.toString(),
        query: row.query_text,
        calls: parseInt(row.calls),
        avgTime: parseFloat(row.mean_exec_time).toFixed(2),
        totalTime: parseFloat(row.total_exec_time).toFixed(2)
      }))
    });
  } catch (error) {
    console.error('Slow queries error:', error);
    res.status(500).json({ error: 'Failed to fetch slow queries', details: error.message });
  }
});

module.exports = router;
