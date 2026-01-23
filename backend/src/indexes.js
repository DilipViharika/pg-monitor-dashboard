const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

router.get('/', async (req, res) => {
  try {
    // Unused indexes
    const unusedQuery = `
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        pg_size_pretty(pg_relation_size(indexrelid)) as size,
        pg_relation_size(indexrelid) as size_bytes
      FROM pg_stat_user_indexes
      WHERE idx_scan = 0
      AND schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY pg_relation_size(indexrelid) DESC
      LIMIT 20
    `;
    
    // Missing indexes (tables with high seq scans)
    const missingQuery = `
      SELECT 
        schemaname,
        tablename,
        seq_scan,
        seq_tup_read,
        idx_scan,
        seq_tup_read / NULLIF(seq_scan, 0) as avg_seq_tup
      FROM pg_stat_user_tables
      WHERE seq_scan > 100
      AND seq_tup_read / NULLIF(seq_scan, 0) > 1000
      ORDER BY seq_scan DESC
      LIMIT 20
    `;
    
    // Index usage
    const usageQuery = `
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch
      FROM pg_stat_user_indexes
      WHERE idx_scan > 0
      ORDER BY idx_scan DESC
      LIMIT 20
    `;
    
    // Index bloat estimation
    const bloatQuery = `
      SELECT 
        schemaname,
        tablename,
        COUNT(*) as index_count,
        pg_size_pretty(SUM(pg_relation_size(indexrelid))) as total_index_size
      FROM pg_stat_user_indexes
      GROUP BY schemaname, tablename
      ORDER BY SUM(pg_relation_size(indexrelid)) DESC
      LIMIT 10
    `;

    const [unusedResult, missingResult, usageResult, bloatResult] = await Promise.all([
      pool.query(unusedQuery),
      pool.query(missingQuery),
      pool.query(usageQuery),
      pool.query(bloatQuery)
    ]);

    res.json({
      unused: unusedResult.rows.map(r => ({
        schema: r.schemaname,
        table: r.tablename,
        index: r.indexname,
        scans: parseInt(r.idx_scan),
        size: r.size,
        sizeBytes: parseInt(r.size_bytes)
      })),
      potentiallyMissing: missingResult.rows.map(r => ({
        schema: r.schemaname,
        table: r.tablename,
        seqScans: parseInt(r.seq_scan),
        seqTupRead: parseInt(r.seq_tup_read),
        indexScans: parseInt(r.idx_scan || 0),
        avgTuples: parseInt(r.avg_seq_tup || 0)
      })),
      mostUsed: usageResult.rows.map(r => ({
        schema: r.schemaname,
        table: r.tablename,
        index: r.indexname,
        scans: parseInt(r.idx_scan),
        tuplesRead: parseInt(r.idx_tup_read || 0),
        tuplesFetched: parseInt(r.idx_tup_fetch || 0)
      })),
      bloat: bloatResult.rows.map(r => ({
        schema: r.schemaname,
        table: r.tablename,
        indexCount: parseInt(r.index_count),
        totalSize: r.total_index_size
      }))
    });
  } catch (error) {
    console.error('Indexes metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch index metrics', details: error.message });
  }
});

module.exports = router;
