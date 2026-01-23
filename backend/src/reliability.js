const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

router.get('/', async (req, res) => {
  try {
    // Replication lag
    const replicationQuery = `
      SELECT 
        client_addr,
        state,
        sync_state,
        COALESCE(EXTRACT(EPOCH FROM (now() - backend_start)), 0) as lag_seconds
      FROM pg_stat_replication
    `;
    
    // Deadlocks and conflicts
    const conflictsQuery = `
      SELECT 
        sum(deadlocks) as total_deadlocks,
        sum(conflicts) as total_conflicts
      FROM pg_stat_database
      WHERE datname = current_database()
    `;
    
    // WAL stats
    const walQuery = `
      SELECT 
        pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0') as wal_bytes
    `;
    
    // Transaction stats
    const txQuery = `
      SELECT 
        sum(xact_commit) as commits,
        sum(xact_rollback) as rollbacks,
        sum(xact_commit) * 100.0 / NULLIF(sum(xact_commit + xact_rollback), 0) as commit_ratio
      FROM pg_stat_database
      WHERE datname = current_database()
    `;

    const [replicationResult, conflictsResult, walResult, txResult] = await Promise.all([
      pool.query(replicationQuery).catch(() => ({ rows: [] })),
      pool.query(conflictsQuery),
      pool.query(walQuery),
      pool.query(txQuery)
    ]);

    res.json({
      replication: {
        replicas: replicationResult.rows.map(r => ({
          client: r.client_addr,
          state: r.state,
          syncState: r.sync_state,
          lagSeconds: parseFloat(r.lag_seconds)
        })),
        count: replicationResult.rows.length,
        healthy: replicationResult.rows.length > 0 && replicationResult.rows.every(r => r.state === 'streaming')
      },
      conflicts: {
        deadlocks: parseInt(conflictsResult.rows[0].total_deadlocks || 0),
        conflicts: parseInt(conflictsResult.rows[0].total_conflicts || 0)
      },
      wal: {
        bytesGenerated: parseInt(walResult.rows[0].wal_bytes),
        bytesFormatted: `${(parseInt(walResult.rows[0].wal_bytes) / 1024 / 1024 / 1024).toFixed(2)} GB`
      },
      transactions: {
        commits: parseInt(txResult.rows[0].commits || 0),
        rollbacks: parseInt(txResult.rows[0].rollbacks || 0),
        commitRatio: parseFloat(txResult.rows[0].commit_ratio || 100).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Reliability metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch reliability metrics', details: error.message });
  }
});

module.exports = router;
