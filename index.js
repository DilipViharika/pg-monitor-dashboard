const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- MOCK DATA (Migrated from Frontend) ---
const mockConnections = [
  { pid: 14023, user: 'postgres', db: 'production', app: 'pgAdmin 4', state: 'active', duration: '00:00:04', query: 'SELECT * FROM pg_stat_activity WHERE state = \'active\';', ip: '192.168.1.5' },
  { pid: 14099, user: 'app_user', db: 'production', app: 'NodeJS Backend', state: 'idle in transaction', duration: '00:15:23', query: 'UPDATE orders SET status = \'processing\' WHERE id = 4591;', ip: '10.0.0.12' },
  { pid: 15102, user: 'analytics', db: 'warehouse', app: 'Metabase', state: 'active', duration: '00:42:10', query: 'SELECT region, SUM(amount) FROM sales GROUP BY region ORDER BY 2 DESC;', ip: '10.0.0.8' },
  { pid: 15201, user: 'app_user', db: 'production', app: 'Go Worker', state: 'active', duration: '00:00:01', query: 'INSERT INTO logs (level, msg) VALUES (\'info\', \'Job started\');', ip: '10.0.0.15' },
  { pid: 15333, user: 'postgres', db: 'postgres', app: 'psql', state: 'idle', duration: '01:20:00', query: '-- idle connection', ip: 'local' },
  { pid: 15440, user: 'etl_service', db: 'warehouse', app: 'Python Script', state: 'active', duration: '00:03:45', query: 'COPY transactions FROM \'/tmp/dump.csv\' WITH CSV HEADER;', ip: '10.0.0.22' },
];

const mockErrorLogs = [
  { id: 101, type: 'Connection Timeout', timestamp: '10:42:15', user: 'app_svc', db: 'production', query: 'SELECT * FROM large_table_v2...', detail: 'Client closed connection before response' },
  { id: 102, type: 'Deadlock Detected', timestamp: '10:45:22', user: 'worker_01', db: 'warehouse', query: 'UPDATE inventory SET stock = stock - 1...', detail: 'Process 14022 waits for ShareLock on transaction 99201' },
  { id: 103, type: 'Query Timeout', timestamp: '11:01:05', user: 'analytics', db: 'warehouse', query: 'SELECT * FROM logs WHERE created_at < ...', detail: 'Canceling statement due to statement_timeout' },
  { id: 104, type: 'Connection Timeout', timestamp: '11:15:30', user: 'web_client', db: 'production', query: 'AUTH CHECK...', detail: 'terminating connection due to idle-in-transaction timeout' },
  { id: 105, type: 'Constraint Violation', timestamp: '11:20:12', user: 'api_write', db: 'production', query: 'INSERT INTO users (email) VALUES...', detail: 'Key (email)=(test@example.com) already exists' },
];

const missingIndexesData = [
  { id: 1, table: 'orders', column: 'customer_id', impact: 'Critical', scans: '1.2M', improvement: '94%', recommendation: 'Create B-Tree index concurrently on customer_id. Estimated creation time: 4s.' },
  { id: 2, table: 'transactions', column: 'created_at', impact: 'High', scans: '850k', improvement: '98%', recommendation: 'BRIN index recommended for time-series data on created_at to save space.' },
  { id: 3, table: 'audit_logs', column: 'user_id', impact: 'Medium', scans: '420k', improvement: '75%', recommendation: 'Standard index recommended. High read volume detected on user dashboard.' },
  { id: 4, table: 'products', column: 'category_id', impact: 'High', scans: '310k', improvement: '88%', recommendation: 'Foreign key column missing index. Essential for join performance.' },
];

const unusedIndexesData = [
  { id: 1, table: 'users', indexName: 'idx_users_last_login_old', size: '450MB', lastUsed: '2023-11-04', recommendation: 'Safe to drop. Index has not been accessed in over 90 days.' },
  { id: 2, table: 'orders', indexName: 'idx_orders_temp_v2', size: '1.2GB', lastUsed: 'Never', recommendation: 'High Impact: Drop immediately. 1.2GB of wasted storage and write overhead.' },
  { id: 3, table: 'inventory', indexName: 'idx_inv_warehouse_loc', size: '120MB', lastUsed: '2024-01-15', recommendation: 'Monitor for 2 more weeks. Low usage pattern detected.' },
  { id: 4, table: 'logs', indexName: 'idx_logs_composite_ts', size: '890MB', lastUsed: '2023-12-20', recommendation: 'Consider partial index instead of full composite index to reduce bloat.' },
];

const lowHitRatioData = [
  { id: 1, table: 'large_audit_logs', ratio: 12, total_scans: '5.4M', problem_query: "SELECT * FROM large_audit_logs WHERE event_data LIKE '%error%'", recommendation: 'Leading wildcard forces Seq Scan. Use Trigram Index (pg_trgm).' },
  { id: 2, table: 'payment_history', ratio: 45, total_scans: '890k', problem_query: "SELECT sum(amt) FROM payment_history WHERE created_at::date = now()::date", recommendation: 'Casting prevents index usage. Use WHERE created_at >= current_date.' },
  { id: 3, table: 'archived_orders', ratio: 28, total_scans: '1.1M', problem_query: "SELECT * FROM archived_orders ORDER BY id DESC LIMIT 50", recommendation: 'High bloat detected (45%). Run VACUUM ANALYZE immediately.' },
];

const apiQueryData = [
  { 
    id: 'api_1', 
    method: 'GET', 
    endpoint: '/api/v1/dashboard/stats', 
    avg_duration: 320, 
    calls_per_min: 850,
    db_time_pct: 85,
    queries: [
      { sql: 'SELECT count(*) FROM orders WHERE status = \'pending\'', calls: 1, duration: 120 },
      { sql: 'SELECT sum(total) FROM payments WHERE created_at > NOW() - INTERVAL \'24h\'', calls: 1, duration: 145 },
      { sql: 'SELECT * FROM notifications WHERE read = false LIMIT 5', calls: 1, duration: 15 }
    ],
    ai_insight: 'Heavy aggregation on payments table. Consider creating a materialized view for daily stats.'
  },
  { 
    id: 'api_2', 
    method: 'POST', 
    endpoint: '/api/v1/orders/create', 
    avg_duration: 180, 
    calls_per_min: 120,
    db_time_pct: 60,
    queries: [
      { sql: 'BEGIN TRANSACTION', calls: 1, duration: 2 },
      { sql: 'SELECT stock FROM products WHERE id = $1 FOR UPDATE', calls: 5, duration: 45 },
      { sql: 'INSERT INTO orders (...) VALUES (...)', calls: 1, duration: 12 },
      { sql: 'UPDATE products SET stock = stock - 1 WHERE id = $1', calls: 5, duration: 55 },
      { sql: 'COMMIT', calls: 1, duration: 5 }
    ],
    ai_insight: 'Detected N+1 Query issue. The product stock check runs 5 times in a loop. Batch these into a single query.'
  },
  { 
    id: 'api_3', 
    method: 'GET', 
    endpoint: '/api/v1/users/profile', 
    avg_duration: 45, 
    calls_per_min: 2100,
    db_time_pct: 30,
    queries: [
      { sql: 'SELECT * FROM users WHERE id = $1', calls: 1, duration: 5 },
      { sql: 'SELECT * FROM permissions WHERE role_id = $1', calls: 1, duration: 4 }
    ],
    ai_insight: 'Highly optimized. Low database footprint. Cache hit ratio is excellent.'
  },
  { 
    id: 'api_4', 
    method: 'GET', 
    endpoint: '/api/v1/search', 
    avg_duration: 850, 
    calls_per_min: 45,
    db_time_pct: 95,
    queries: [
      { sql: 'SELECT * FROM products WHERE name ILIKE \'%$1%\'', calls: 1, duration: 810 }
    ],
    ai_insight: 'Critical: Full table scan triggered by ILIKE with leading wildcard. Implement Full-Text Search (tsvector).'
  }
];

const metrics = {
  avgQueryTime: 45.2, slowQueryCount: 23, qps: 1847, tps: 892,
  selectPerSec: 1245, insertPerSec: 342, updatePerSec: 198, deletePerSec: 62,
  readWriteRatio: 68, cpuUsage: 42.5, cpuAvg: 38.2,
  memoryUsage: 67.8, memoryAllocated: 16, memoryUsed: 10.8,
  diskUsed: 54.3, diskAvailable: 456, diskTotal: 1000,
  diskIOReadRate: 245, diskIOWriteRate: 128, diskIOLatency: 8.5,
  activeConnections: 45, idleConnections: 23, maxConnections: 100, failedConnections: 12, connectionWaitTime: 125,
  uptime: 2592000, availability: 99.94, downtimeIncidents: 2,
  errorRate: 3.2, failedQueries: 18, deadlockCount: 5,
  indexHitRatio: 96.7, missingIndexes: 7, unusedIndexes: 12,
  tableScanRate: 15.3, fragmentationLevel: 23.4
};

// --- ROUTES ---

app.get('/api/metrics', (req, res) => {
  res.json(metrics);
});

app.get('/api/connections', (req, res) => {
  res.json(mockConnections);
});

app.get('/api/errors', (req, res) => {
  res.json(mockErrorLogs);
});

app.get('/api/indexes/missing', (req, res) => {
  res.json(missingIndexesData);
});

app.get('/api/indexes/unused', (req, res) => {
  res.json(unusedIndexesData);
});

app.get('/api/indexes/hit-ratio', (req, res) => {
  res.json(lowHitRatioData);
});

app.get('/api/api-stats', (req, res) => {
  res.json(apiQueryData);
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  // Mock login logic
  if (email === 'admin' && password === 'admin') {
    return res.json({
      id: 1, email: 'admin', name: 'System Administrator', role: 'Super Admin', accessLevel: 'write',
      allowedScreens: ['overview', 'performance', 'resources', 'reliability', 'indexes', 'api', 'admin']
    });
  }
  // Simple check for other users
  if (password && password.length >= 4) {
     return res.json({
       id: 2, email: email, name: 'User', role: 'User', accessLevel: 'read',
       allowedScreens: ['overview', 'performance', 'api']
     });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
