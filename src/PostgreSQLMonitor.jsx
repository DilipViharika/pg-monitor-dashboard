import React, { useState, useEffect } from 'react';
import {
  Activity, Database, HardDrive, Zap, Clock, AlertTriangle,
  TrendingUp, TrendingDown, Server, Lock, AlertCircle, CheckCircle,
  XCircle, Search, Cpu, Layers, Terminal, Power, RefreshCw, 
  ChevronLeft, ChevronRight, User as UserIcon, Globe, Network, 
  LogOut, Shield, Key, Mail, Chrome, UserPlus, Settings, Eye, Edit3, Trash2
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';

// --- THEME & CONSTANTS ---
const THEME = {
  bg: '#020617', // Deep Ink Black
  glass: 'rgba(15, 23, 42, 0.6)',
  glassBorder: 'rgba(56, 189, 248, 0.1)',
  textMain: '#F8FAFC',
  textMuted: '#94A3B8',
  primary: '#0EA5E9', // Sky Blue
  secondary: '#8B5CF6', // Violet
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber
  danger: '#F43F5E', // Rose
  grid: '#1E293B',
  ai: '#a855f7' // Purple for AI
};

// --- MOCK DATA ---
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

// --- AUTHENTICATION HOOK ---
const useMockAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [allUsers, setAllUsers] = useState([
    { 
      id: 1, email: 'admin', name: 'System Administrator', role: 'Super Admin', accessLevel: 'write',
      allowedScreens: ['overview', 'performance', 'resources', 'reliability', 'indexes', 'api', 'admin'] 
    },
    { 
      id: 2, email: 'analyst@sys.local', name: 'Data Analyst', role: 'User', accessLevel: 'read',
      allowedScreens: ['overview', 'performance', 'api'] 
    }
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem('pg_monitor_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (loginId, password) => {
    setLoading(true);
    setError(null);
    return new Promise((resolve) => {
      setTimeout(() => {
        if (loginId === 'admin' && password === 'admin') {
           const admin = allUsers.find(u => u.email === 'admin');
           setCurrentUser(admin);
           localStorage.setItem('pg_monitor_user', JSON.stringify(admin));
           setLoading(false);
           resolve(true);
           return;
        }
        const foundUser = allUsers.find(u => u.email === loginId);
        if (foundUser && password.length >= 4) { 
           setCurrentUser(foundUser);
           localStorage.setItem('pg_monitor_user', JSON.stringify(foundUser));
           setLoading(false);
           resolve(true);
           return;
        }
        setError('Invalid credentials or access denied.');
        setLoading(false);
        resolve(false);
      }, 1000); 
    });
  };

  const googleLogin = async () => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const googleUser = { 
             id: 999, email: 'google_user@gmail.com', name: 'Google User', role: 'Viewer', accessLevel: 'read',
             allowedScreens: ['overview', 'resources'] 
        };
        setCurrentUser(googleUser);
        localStorage.setItem('pg_monitor_user', JSON.stringify(googleUser));
        setLoading(false);
        resolve(true);
      }, 1500);
    });
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pg_monitor_user');
  };

  const createUser = (newUser) => {
      setAllUsers(prev => [...prev, { ...newUser, id: prev.length + 10 }]);
  };

  const deleteUser = (userId) => {
    if (userId === 1) {
        alert("Cannot delete the root System Administrator.");
        return;
    }
    setAllUsers(prev => prev.filter(u => u.id !== userId));
  };

  return { currentUser, loading, error, login, googleLogin, logout, allUsers, createUser, deleteUser };
};

// --- GLOBAL SVG FILTERS ---
const ChartDefs = () => (
  <svg style={{ height: 0, width: 0, position: 'absolute' }}>
    <defs>
      <filter id="neonGlow" height="300%" width="300%" x="-75%" y="-75%">
        <feGaussianBlur stdDeviation="5" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.4} />
        <stop offset="100%" stopColor={THEME.primary} stopOpacity={0} />
      </linearGradient>
      <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={THEME.success} stopOpacity={0.4} />
        <stop offset="100%" stopColor={THEME.success} stopOpacity={0} />
      </linearGradient>
      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={THEME.secondary} stopOpacity={1} />
        <stop offset="100%" stopColor={THEME.secondary} stopOpacity={0.3} />
      </linearGradient>
    </defs>
  </svg>
);

// --- STYLES ---
const LoginStyles = () => (
    <style>{`
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      .login-input-group:focus-within label {
        color: ${THEME.primary};
      }
      .scanline-overlay {
        background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.3) 51%);
        background-size: 100% 4px;
        pointer-events: none;
      }
    `}</style>
);

// --- LOGIN VISUALS COMPONENT ---
const LoginVisuals = () => {
  const data = Array.from({ length: 40 }, (_, i) => ({
    time: i,
    value: 40 + Math.random() * 40 + (Math.sin(i / 5) * 20),
    value2: 30 + Math.random() * 20
  }));

  return (
    <div style={{ 
      flex: 1, 
      position: 'relative', 
      background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 60
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.1) 0%, transparent 50%)' }} />
      <div className="scanline-overlay" style={{ position: 'absolute', inset: 0, opacity: 0.1 }} />
      
      <div style={{ 
        width: '100%', 
        maxWidth: 600,
        background: 'rgba(15, 23, 42, 0.6)',
        border: `1px solid ${THEME.glassBorder}`,
        borderRadius: 24,
        padding: 30,
        backdropFilter: 'blur(20px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
           <div>
             <div style={{ color: THEME.textMuted, fontSize: 12, fontWeight: 600 }}>LIVE CLUSTER HEALTH</div>
             <div style={{ color: THEME.textMain, fontSize: 24, fontWeight: 700 }}>US-East-1 Prod</div>
           </div>
           <div style={{ textAlign: 'right' }}>
             <div style={{ color: THEME.success, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
               <div style={{ width: 8, height: 8, background: THEME.success, borderRadius: '50%', boxShadow: `0 0 10px ${THEME.success}` }} />
               OPERATIONAL
             </div>
             <div style={{ color: THEME.textMuted, fontSize: 12, marginTop: 4 }}>99.99% Uptime</div>
           </div>
        </div>

        <div style={{ height: 200, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="loginGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={THEME.primary} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke={THEME.primary} strokeWidth={3} fillOpacity={1} fill="url(#loginGradient)" filter="url(#neonGlow)" />
              <Area type="monotone" dataKey="value2" stroke={THEME.secondary} strokeWidth={2} fill="none" strokeDasharray="5 5" opacity={0.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div style={{ display: 'flex', gap: 16, marginTop: 20, paddingTop: 20, borderTop: `1px solid ${THEME.grid}` }}>
           <div style={{ flex: 1 }}>
             <div style={{ color: THEME.textMuted, fontSize: 11 }}>ACTIVE QUERIES</div>
             <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>1,842</div>
           </div>
           <div style={{ flex: 1 }}>
             <div style={{ color: THEME.textMuted, fontSize: 11 }}>WRITE LATENCY</div>
             <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>4.2ms</div>
           </div>
           <div style={{ flex: 1 }}>
             <div style={{ color: THEME.textMuted, fontSize: 11 }}>ANOMALIES</div>
             <div style={{ color: THEME.success, fontSize: 18, fontWeight: 600 }}>0</div>
           </div>
        </div>
      </div>

      <div style={{ marginTop: 40, textAlign: 'center', zIndex: 10 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 10 }}>Total Observability. Zero Overhead.</h2>
        <p style={{ color: THEME.textMuted, fontSize: 16, maxWidth: 500, lineHeight: 1.5 }}>
          Monitor your PostgreSQL clusters with granular query analysis, index recommendations, and AI-driven insights.
        </p>
      </div>
    </div>
  );
};

// --- SPLIT SCREEN LOGIN PAGE ---
const LoginPage = ({ onLogin, onGoogleLogin, loading, error }) => {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    
    const handleSubmit = (e) => {
      e.preventDefault();
      onLogin(loginId, password);
    };
  
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', background: '#020617' }}>
        <LoginStyles />
        
        {/* LEFT SIDE: FUNCTIONAL */}
        <div style={{ 
          width: '40%', minWidth: 450, background: '#020617', 
          display: 'flex', flexDirection: 'column', justifyContent: 'center', 
          padding: '0 80px', borderRight: `1px solid ${THEME.grid}`, position: 'relative'
        }}>
          
          <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: 40, height: 40, borderRadius: 10, 
              background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 20px ${THEME.primary}40`
            }}>
              <Database color="#fff" size={20} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>PG Monitor</span>
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Welcome back</h1>
          <p style={{ color: THEME.textMuted, marginBottom: 40 }}>Enter your credentials to access the workspace.</p>
  
          {error && (
            <div style={{ 
              background: 'rgba(244, 63, 94, 0.1)', border: `1px solid ${THEME.danger}40`, 
              color: '#fca5a5', padding: '12px 16px', borderRadius: 8, fontSize: 13, 
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24
            }}>
              <AlertTriangle size={16} /> {error}
            </div>
          )}
  
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="login-input-group" style={{ position: 'relative' }}>
               <label style={{ display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 600, color: THEME.textMuted }}>WORK EMAIL</label>
               <input 
                 type="text" required
                 value={loginId} onChange={(e) => setLoginId(e.target.value)}
                 placeholder="name@company.com"
                 style={{ 
                   width: '100%', padding: '12px 16px', 
                   background: 'rgba(255, 255, 255, 0.03)', border: `1px solid ${THEME.grid}`, 
                   borderRadius: 8, color: 'white', fontSize: 14, outline: 'none',
                   transition: 'all 0.2s'
                 }}
                 onFocus={(e) => { e.target.style.borderColor = THEME.primary; }}
                 onBlur={(e) => { e.target.style.borderColor = THEME.grid; }}
               />
            </div>
  
            <div className="login-input-group" style={{ position: 'relative' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                 <label style={{ fontSize: 12, fontWeight: 600, color: THEME.textMuted }}>PASSWORD</label>
                 <a href="#" style={{ fontSize: 12, color: THEME.primary, textDecoration: 'none' }}>Forgot password?</a>
               </div>
               <input 
                 type="password" required
                 value={password} onChange={(e) => setPassword(e.target.value)}
                 placeholder="••••••••"
                 style={{ 
                   width: '100%', padding: '12px 16px', 
                   background: 'rgba(255, 255, 255, 0.03)', border: `1px solid ${THEME.grid}`, 
                   borderRadius: 8, color: 'white', fontSize: 14, outline: 'none',
                   transition: 'all 0.2s'
                 }}
                 onFocus={(e) => { e.target.style.borderColor = THEME.primary; }}
                 onBlur={(e) => { e.target.style.borderColor = THEME.grid; }}
               />
            </div>
  
            <button 
              type="submit" disabled={loading}
              style={{ 
                marginTop: 10, background: THEME.primary, border: 'none', padding: '14px', borderRadius: 8, 
                color: '#fff', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14,
                opacity: loading ? 0.7 : 1, transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => !loading && (e.target.style.background = '#0284c7')}
              onMouseLeave={(e) => !loading && (e.target.style.background = THEME.primary)}
            >
              {loading ? 'Authenticating...' : 'Sign in'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '30px 0' }}>
            <div style={{ flex: 1, height: 1, background: THEME.grid }} />
            <span style={{ color: THEME.textMuted, fontSize: 12 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: THEME.grid }} />
          </div>

          <button 
            onClick={onGoogleLogin} disabled={loading}
            style={{ 
              width: '100%', background: 'transparent', border: `1px solid ${THEME.grid}`, padding: '12px', borderRadius: 8,
              color: 'white', fontWeight: 500, cursor: 'pointer', fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <Chrome size={18} />
            Sign in with Google
          </button>
          
          <div style={{ marginTop: 'auto', paddingTop: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
             <div style={{ width: 6, height: 6, borderRadius: '50%', background: THEME.success, boxShadow: `0 0 5px ${THEME.success}` }} />
             <span style={{ color: THEME.textMuted, fontSize: 12 }}>All systems operational</span>
          </div>
        </div>
  
        {/* RIGHT SIDE: VISUALS (Hide on small screens via CSS media queries if needed) */}
        <LoginVisuals />
      </div>
    );
};

// --- REUSABLE COMPONENTS ---
const GlassCard = ({ children, title, rightNode, style }) => (
  <div
    style={{
      background: THEME.glass,
      backdropFilter: 'blur(12px)',
      borderRadius: 16,
      border: `1px solid ${THEME.glassBorder}`,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      ...style
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, zIndex: 2 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
        {title}
      </h3>
      {rightNode}
    </div>
    <div style={{ flex: 1, minHeight: 0, position: 'relative', zIndex: 1 }}>{children}</div>
    <div style={{ position: 'absolute', top: -60, right: -60, width: 140, height: 140, background: `radial-gradient(circle, ${THEME.primary}15 0%, transparent 70%)`, pointerEvents: 'none' }} />
  </div>
);

const MetricCard = ({ icon: Icon, title, value, unit, subtitle, color = THEME.primary, onClick, active, sparkData }) => (
  <div
    onClick={onClick}
    style={{
      background: active 
        ? `linear-gradient(180deg, ${color}20 0%, ${color}10 100%)`
        : 'linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
      borderRadius: 12,
      border: active ? `1px solid ${color}` : `1px solid ${THEME.glassBorder}`,
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 12,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: active ? 'translateY(-2px)' : 'none',
      boxShadow: active ? `0 10px 25px -5px ${color}30` : 'none'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}30`, boxShadow: `0 0 15px ${color}20` }}>
        <Icon size={20} />
      </div>
      {active && <div style={{ fontSize: 10, background: color, color: '#fff', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>SELECTED</div>}
      {sparkData && !active && (
        <div style={{ width: 80, height: 40 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} filter="url(#neonGlow)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
    
    <div>
      <div style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: THEME.textMain, fontFamily: 'monospace', letterSpacing: '-0.5px' }}>{value}</span>
        {unit && <span style={{ fontSize: 12, color: THEME.textMuted }}>{unit}</span>}
      </div>
      {subtitle && <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>{subtitle}</div>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', border: `1px solid ${THEME.glassBorder}`, borderRadius: 8, padding: '12px', boxShadow: '0 0 20px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}>
        <p style={{ color: THEME.textMuted, fontSize: 11, marginBottom: 8, fontFamily: 'monospace' }}>{label}</p>
        {payload.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}` }} />
            <span style={{ fontSize: 12, color: '#fff', fontFamily: 'monospace' }}>
              {entry.name}: <span style={{ fontWeight: 700 }}>{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const NeonProgressBar = ({ value, max, color = THEME.primary }) => {
  const percent = Math.min((value / max) * 100, 100);
  return (
    <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ width: `${percent}%`, height: '100%', background: color, borderRadius: 4, boxShadow: `0 0 10px ${color}80`, transition: 'width 0.5s ease' }} />
    </div>
  );
};

const ResourceGauge = ({ label, value, color }) => {
  const data = [{ name: 'L', value: value, fill: color }];
  return (
    <div style={{ position: 'relative', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="70%" outerRadius="100%" barSize={10} data={data} startAngle={180} endAngle={0}>
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar background clockWise dataKey="value" cornerRadius={10} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div style={{ position: 'absolute', top: '60%', transform: 'translateY(-50%)', textAlign: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: THEME.textMain, fontFamily: 'monospace' }}>{value}%</div>
        <div style={{ fontSize: 11, color: THEME.textMuted, textTransform: 'uppercase' }}>{label}</div>
      </div>
    </div>
  );
};

const AIAgentView = ({ type, data }) => {
    if (!data) return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: THEME.textMuted, flexDirection: 'column', gap: 12, textAlign: 'center', opacity: 0.6 }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Terminal size={24} />
        </div>
        <p style={{ fontSize: 13 }}>Select an item to analyze.</p>
      </div>
    );
  
    const renderSqlContext = () => {
      if (type === 'api') {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.queries.map((q, i) => (
              <div key={i} style={{ borderBottom: `1px solid ${THEME.grid}`, paddingBottom: 12, marginBottom: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: THEME.textMuted, fontSize: 11, marginBottom: 4 }}>
                  <span>{q.calls} Executions</span>
                  <span>{q.duration}ms</span>
                </div>
                <div style={{ color: '#fff' }}>{q.sql}</div>
              </div>
            ))}
          </div>
        );
      }
      
      if (type === 'missing') {
        return (
          <>
            <div style={{ color: THEME.textMuted, marginBottom: 8 }}>-- Suggested Fix: Create Index</div>
            <div style={{ color: THEME.success }}>
              CREATE INDEX CONCURRENTLY idx_{data.table}_{data.column} <br/>
              ON {data.table} ({data.column});
            </div>
            <div style={{ color: THEME.textMuted, marginTop: 16 }}>-- Impact Analysis</div>
            <div>Scans Reduced: {data.improvement}</div>
            <div>Est. Storage: ~24MB</div>
          </>
        );
      }
  
      if (type === 'unused') {
        return (
          <>
            <div style={{ color: THEME.textMuted, marginBottom: 8 }}>-- Suggested Fix: Drop Unused Index</div>
            <div style={{ color: THEME.danger }}>
              DROP INDEX CONCURRENTLY {data.indexName};
            </div>
            <div style={{ color: THEME.textMuted, marginTop: 16 }}>-- Storage Reclaimed</div>
            <div>Size: {data.size}</div>
            <div>Last Access: {data.lastUsed}</div>
          </>
        );
      }
      return <>{data.problem_query || "Query optimization suggested..."}</>;
    };
  
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>
        <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: `1px solid ${THEME.ai}40`, borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 24, height: 24, background: THEME.ai, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 10px ${THEME.ai}60` }}>
              <Zap size={14} color="white" fill="white" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: THEME.ai, letterSpacing: '0.5px' }}>AI ANALYSIS</span>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: THEME.textMain, margin: 0 }}>
             {type === 'api' ? data.ai_insight : (data.recommendation || 'Analysis complete.')}
          </p>
        </div>
  
        <div style={{ flex: 1, background: '#0f172a', borderRadius: 12, border: `1px solid ${THEME.grid}`, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#1e293b', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${THEME.grid}` }}>
            <span style={{ fontSize: 11, color: THEME.textMuted, fontFamily: 'monospace' }}>CONTEXT.sql</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></div>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }}></div>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }}></div>
            </div>
          </div>
          <div style={{ padding: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#a5b4fc', lineHeight: 1.6, flex: 1, overflowY: 'auto' }}>
             {renderSqlContext()}
          </div>
        </div>
      </div>
    );
};

const EmptyState = ({ icon: Icon, text }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: THEME.textMuted, gap: 16, opacity: 0.7 }}>
    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={32} />
    </div>
    <div>{text}</div>
  </div>
);

// --- TABS ---
const UserManagementTab = ({ users, onCreateUser, onDeleteUser }) => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', accessLevel: 'read',
        allowedScreens: { overview: true, performance: false, resources: false, reliability: false, indexes: false, api: false }
    });

    const handleScreenChange = (screen) => {
        setFormData(prev => ({ ...prev, allowedScreens: { ...prev.allowedScreens, [screen]: !prev.allowedScreens[screen] } }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const screenArray = Object.keys(formData.allowedScreens).filter(key => formData.allowedScreens[key]);
        onCreateUser({ ...formData, role: 'User', allowedScreens: screenArray });
        setFormData({ name: '', email: '', password: '', accessLevel: 'read', allowedScreens: { overview: true, performance: false, resources: false, reliability: false, indexes: false, api: false } });
        alert("User Created Successfully!");
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24, height: 'calc(100vh - 140px)' }}>
            <GlassCard title="Create New User" rightNode={<UserPlus size={16} color={THEME.success} />}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, color: THEME.textMuted, marginBottom: 6 }}>Full Name</label>
                        <input required type="text" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: 10, background: 'rgba(255,255,255,0.05)', border: `1px solid ${THEME.grid}`, borderRadius: 6, color: 'white', outline: 'none' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, color: THEME.textMuted, marginBottom: 6 }}>Login ID / Email</label>
                        <input required type="text" placeholder="john.d" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: 10, background: 'rgba(255,255,255,0.05)', border: `1px solid ${THEME.grid}`, borderRadius: 6, color: 'white', outline: 'none' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, color: THEME.textMuted, marginBottom: 6 }}>Access Level</label>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button type="button" onClick={() => setFormData({...formData, accessLevel: 'read'})} style={{ flex: 1, padding: 10, borderRadius: 6, border: `1px solid ${formData.accessLevel === 'read' ? THEME.primary : THEME.grid}`, background: formData.accessLevel === 'read' ? 'rgba(14, 165, 233, 0.2)' : 'transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <Eye size={14} /> Read Only
                            </button>
                            <button type="button" onClick={() => setFormData({...formData, accessLevel: 'write'})} style={{ flex: 1, padding: 10, borderRadius: 6, border: `1px solid ${formData.accessLevel === 'write' ? THEME.success : THEME.grid}`, background: formData.accessLevel === 'write' ? 'rgba(16, 185, 129, 0.2)' : 'transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <Edit3 size={14} /> Read & Write
                            </button>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, color: THEME.textMuted, marginBottom: 10 }}>Allowed Screen Access</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {Object.keys(formData.allowedScreens).map(key => (
                                <div key={key} onClick={() => handleScreenChange(key)} style={{ padding: '8px 12px', borderRadius: 6, cursor: 'pointer', border: `1px solid ${formData.allowedScreens[key] ? THEME.secondary : THEME.grid}`, background: formData.allowedScreens[key] ? 'rgba(139, 92, 246, 0.2)' : 'transparent', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'white', textTransform: 'capitalize' }}>
                                    <div style={{ width: 14, height: 14, borderRadius: 3, border: `1px solid ${THEME.textMuted}`, background: formData.allowedScreens[key] ? THEME.secondary : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{formData.allowedScreens[key] && <CheckCircle size={10} color="white" />}</div>
                                    {key}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button type="submit" style={{ marginTop: 10, padding: 12, background: THEME.primary, border: 'none', borderRadius: 8, color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Create User</button>
                </form>
            </GlassCard>
            <GlassCard title="Active Users" rightNode={<Settings size={16} color={THEME.textMuted} />}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', height: '100%', paddingRight: 4 }}>
                    {users.map((u) => (
                        <div key={u.id} style={{ padding: 16, background: 'rgba(255,255,255,0.03)', border: `1px solid ${THEME.grid}`, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: 14, color: 'white' }}>{u.name}</div>
                                <div style={{ fontSize: 12, color: THEME.textMuted, marginBottom: 6 }}>{u.email}</div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: u.accessLevel === 'write' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(14, 165, 233, 0.2)', color: u.accessLevel === 'write' ? THEME.success : THEME.primary, border: '1px solid rgba(255,255,255,0.1)' }}>
                                        {u.accessLevel === 'write' ? 'Read & Write' : 'Read Only'}
                                    </span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end', maxWidth: 100 }}>
                                    {u.allowedScreens.slice(0, 4).map(screen => (<div key={screen} style={{ width: 6, height: 6, borderRadius: '50%', background: THEME.secondary }} />))}
                                    {u.allowedScreens.length > 4 && <span style={{ fontSize: 8, color: THEME.textMuted }}>+{u.allowedScreens.length - 4}</span>}
                                </div>
                                {u.id !== 1 && (
                                    <button onClick={() => { if(window.confirm(`Delete user ${u.name}?`)) onDeleteUser(u.id); }} style={{ background: 'rgba(244, 63, 94, 0.1)', border: `1px solid ${THEME.danger}40`, borderRadius: 6, padding: 6, cursor: 'pointer', color: THEME.danger }}>
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
};

// --- MAIN DASHBOARD COMPONENT ---
const PostgreSQLMonitor = ({ currentUser, onLogout, allUsers, onCreateUser, onDeleteUser }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [indexViewMode, setIndexViewMode] = useState(null); 
  const [selectedIndexItem, setSelectedIndexItem] = useState(null); 
  const [reliabilityViewMode, setReliabilityViewMode] = useState(null); 
  const [selectedReliabilityItem, setSelectedReliabilityItem] = useState(null);
  const [selectedApiItem, setSelectedApiItem] = useState(null); 

  const [metrics, setMetrics] = useState({
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
  });

  const [last30Days, setLast30Days] = useState([]);
  const [queryTimeDistribution, setQueryTimeDistribution] = useState([]);
  const [tableGrowth, setTableGrowth] = useState([]);
  const [topErrors, setTopErrors] = useState([]);
  const [sparklineData, setSparklineData] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);

  useEffect(() => {
    setLast30Days(Array.from({ length: 30 }, (_, i) => ({
      date: new Date(new Date().setDate(new Date().getDate() - (29 - i))).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      qps: Math.floor(Math.random() * 800) + 1200, tps: Math.floor(Math.random() * 400) + 600,
      avgQuery: Math.random() * 30 + 30, errors: Math.floor(Math.random() * 15)
    })));
    setQueryTimeDistribution([
      { range: '0-10ms', count: 45230 }, { range: '10-50ms', count: 18920 },
      { range: '50-100ms', count: 5430 }, { range: '100-500ms', count: 2120 },
      { range: '500ms-1s', count: 890 }, { range: '>1s', count: 310 }
    ]);
    setTableGrowth(Array.from({ length: 12 }, (_, i) => ({
      month: new Date(new Date().setMonth(new Date().getMonth() - (11 - i))).toLocaleDateString('en-US', { month: 'short' }),
      orders: 150 + i * 10, customers: 80 + i * 5, products: 40 + i * 2, transactions: 200 + i * 15
    })));
    setTopErrors([
      { type: 'Connection Timeout', count: 145, percentage: 38 }, { type: 'Deadlock Detected', count: 89, percentage: 23 },
      { type: 'Query Timeout', count: 67, percentage: 17 }, { type: 'Lock Wait Timeout', count: 45, percentage: 12 },
      { type: 'Constraint Violation', count: 38, percentage: 10 }
    ]);
    setRecentAlerts([
      { severity: 'critical', message: 'CPU usage exceeded 90%', time: '5m ago' },
      { severity: 'warning', message: 'High slow queries detected', time: '12m ago' },
    ]);
    setSparklineData(Array.from({ length: 20 }, () => ({ value: Math.random() * 100 })));
  }, []);

  const formatUptime = seconds => `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;

  const ApiQueriesTab = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 24, height: 'calc(100vh - 140px)', animation: 'fadeIn 0.5s ease' }}>
        <GlassCard title="API Endpoints" rightNode={<Network size={16} color={THEME.textMuted} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%', overflowY: 'auto', paddingRight: 4 }}>
                {apiQueryData.map(api => (
                    <div key={api.id} onClick={() => setSelectedApiItem(api)} style={{ padding: 16, borderRadius: 12, background: selectedApiItem?.id === api.id ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${selectedApiItem?.id === api.id ? THEME.primary : 'rgba(255,255,255,0.05)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: api.method === 'GET' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(249, 115, 22, 0.2)', color: api.method === 'GET' ? THEME.success : THEME.warning }}>{api.method}</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: THEME.textMain }}>{api.endpoint}</span>
                            </div>
                            <span style={{ fontSize: 11, color: THEME.textMuted }}>{api.avg_duration}ms</span>
                        </div>
                        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: THEME.textMuted }}>
                            <span>{api.calls_per_min} rpm</span>
                            <span style={{ color: api.db_time_pct > 80 ? THEME.danger : THEME.textMuted }}>{api.db_time_pct}% DB Time</span>
                        </div>
                    </div>
                ))}
            </div>
        </GlassCard>
        {selectedApiItem ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
                <GlassCard title="Query Analysis" rightNode={<Cpu size={16} color={THEME.ai} />}>
                    <AIAgentView type="api" data={selectedApiItem} />
                </GlassCard>
            </div>
        ) : (
            <GlassCard title="Deep Dive" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EmptyState icon={Network} text="Select an API endpoint to trace its SQL queries." />
            </GlassCard>
        )}
    </div>
  );

  const OverviewTab = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: 24, marginBottom: 24 }}>
        <GlassCard title="Cluster Activity (30 Days)">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={last30Days} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <ChartDefs />
              <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: THEME.textMuted }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 11, fill: THEME.textMuted }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              <Area type="monotone" dataKey="qps" stroke={THEME.primary} strokeWidth={3} fill="url(#primaryGradient)" name="QPS" filter="url(#neonGlow)" />
              <Area type="monotone" dataKey="tps" stroke={THEME.success} strokeWidth={3} fill="url(#successGradient)" name="TPS" filter="url(#neonGlow)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <MetricCard icon={Clock} title="Avg Query" value={metrics.avgQueryTime.toFixed(1)} unit="ms" color={THEME.warning} sparkData={sparklineData} />
          <MetricCard icon={Zap} title="Current QPS" value={metrics.qps} color={THEME.primary} />
          <MetricCard icon={Cpu} title="CPU Load" value={metrics.cpuUsage.toFixed(1)} unit="%" color={THEME.danger} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        <GlassCard title="Operations Breakdown">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { label: 'SELECT', value: metrics.selectPerSec, color: THEME.primary },
              { label: 'INSERT', value: metrics.insertPerSec, color: THEME.success },
              { label: 'UPDATE', value: metrics.updatePerSec, color: THEME.warning },
              { label: 'DELETE', value: metrics.deletePerSec, color: THEME.danger }
            ].map((row) => (
              <div key={row.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, color: THEME.textMain }}>
                  <span>{row.label}</span>
                  <span style={{ fontFamily: 'monospace' }}>{row.value}/s</span>
                </div>
                <NeonProgressBar value={row.value} max={2000} color={row.color} />
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard title="Read / Write Ratio">
          <div style={{ position: 'relative', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{ value: metrics.readWriteRatio }, { value: 100 - metrics.readWriteRatio }]} cx="50%" cy="50%" innerRadius={70} outerRadius={90} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                  <Cell fill={THEME.primary} filter="url(#neonGlow)" />
                  <Cell fill="#1e293b" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: THEME.textMain }}>{metrics.readWriteRatio}%</div>
              <div style={{ fontSize: 11, color: THEME.primary, letterSpacing: 2 }}>READS</div>
            </div>
          </div>
        </GlassCard>
      </div>
    </>
  );

  const PerformanceTab = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, marginBottom: 24 }}>
        <GlassCard title="Query Execution Time Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={queryTimeDistribution} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <ChartDefs />
              <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: THEME.textMuted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: THEME.textMuted }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="url(#barGradient)" radius={[4, 4, 0, 0]} filter="url(#neonGlow)" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
        <GlassCard title="Performance KPIs">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
             <MetricCard icon={Clock} title="Avg Query Time" value={metrics.avgQueryTime.toFixed(1)} unit="ms" color={THEME.warning} />
             <MetricCard icon={AlertTriangle} title="Latency > 1s" value={metrics.slowQueryCount} color={THEME.danger} />
             <MetricCard icon={Activity} title="Transactions/Sec" value={metrics.tps} color={THEME.success} />
          </div>
        </GlassCard>
      </div>
      <GlassCard title="Performance Trends (10 Days)">
         <ResponsiveContainer width="100%" height={280}>
            <LineChart data={last30Days.slice(-10)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <ChartDefs />
                <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: THEME.textMuted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: THEME.textMuted }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="avgQuery" stroke={THEME.primary} strokeWidth={3} dot={{r:4, fill:THEME.bg, strokeWidth:2}} name="Avg Query (ms)" filter="url(#neonGlow)" />
                <Line type="monotone" dataKey="errors" stroke={THEME.danger} strokeWidth={3} dot={{r:4, fill:THEME.bg, strokeWidth:2}} name="Errors" filter="url(#neonGlow)" />
            </LineChart>
         </ResponsiveContainer>
      </GlassCard>
    </>
  );

  const ResourcesTab = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 24 }}>
        <GlassCard title="CPU Usage"><ResourceGauge label="Core Load" value={metrics.cpuUsage.toFixed(1)} color={metrics.cpuUsage > 80 ? THEME.danger : THEME.primary} /></GlassCard>
        <GlassCard title="Memory Usage"><ResourceGauge label={`${metrics.memoryUsed}GB Used`} value={metrics.memoryUsage.toFixed(1)} color={THEME.secondary} /></GlassCard>
        <GlassCard title="Disk Capacity"><ResourceGauge label={`${metrics.diskAvailable}GB Free`} value={metrics.diskUsed.toFixed(1)} color={THEME.warning} /></GlassCard>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
        <GlassCard title="Table Growth History">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={tableGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <ChartDefs />
              <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: THEME.textMuted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: THEME.textMuted }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="orders" stackId="1" stroke={THEME.primary} fill={THEME.primary} fillOpacity={0.3} name="Orders" />
              <Area type="monotone" dataKey="customers" stackId="1" stroke={THEME.success} fill={THEME.success} fillOpacity={0.3} name="Customers" />
              <Area type="monotone" dataKey="products" stackId="1" stroke={THEME.secondary} fill={THEME.secondary} fillOpacity={0.3} name="Products" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
        <GlassCard title="Disk I/O Operations">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Read Rate', value: metrics.diskIOReadRate, unit: 'ops/sec', icon: TrendingUp, color: THEME.primary },
              { label: 'Write Rate', value: metrics.diskIOWriteRate, unit: 'ops/sec', icon: TrendingDown, color: THEME.success },
              { label: 'I/O Latency', value: metrics.diskIOLatency.toFixed(1), unit: 'ms avg', icon: Clock, color: THEME.warning },
            ].map((io, idx) => (
              <div key={idx} style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontSize: 12, color: THEME.textMuted, textTransform: 'uppercase' }}>{io.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 600, color: THEME.textMain, marginTop: 4, fontFamily: 'monospace' }}>{io.value}</div>
                  <div style={{ fontSize: 10, color: THEME.textMuted }}>{io.unit}</div>
                </div>
                <io.icon size={28} color={io.color} style={{ filter: `drop-shadow(0 0 8px ${io.color})` }} />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </>
  );

  const ReliabilityTab = () => {
    const getListItems = () => {
      if (reliabilityViewMode === 'active') return mockConnections.filter(c => c.state === 'active');
      if (reliabilityViewMode === 'idle') return mockConnections.filter(c => c.state.includes('idle'));
      if (reliabilityViewMode === 'errors') return mockErrorLogs;
      return [];
    };

    const ConnectionDetailPanel = ({ data }) => {
      if (!data) return <EmptyState icon={Server} text="Select a connection to view details" />;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 24, animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 10, color: THEME.primary, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>PID: {data.pid}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: THEME.textMain }}>{data.app}</div>
              <div style={{ fontSize: 12, color: THEME.textMuted, display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}><Globe size={12} /> {data.ip}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: data.state === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: data.state === 'active' ? THEME.success : THEME.warning, border: `1px solid ${data.state === 'active' ? THEME.success : THEME.warning}40` }}>{data.state.toUpperCase()}</div>
              <div style={{ fontSize: 12, color: THEME.textMain, marginTop: 6, fontFamily: 'monospace' }}>{data.duration}</div>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 8, fontWeight: 600 }}>LAST QUERY</div>
            <div style={{ flex: 1, background: '#0f172a', borderRadius: 8, border: `1px solid ${THEME.grid}`, padding: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, lineHeight: 1.6, color: '#94a3b8', overflowY: 'auto' }}>{data.query}</div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
            <button style={{ flex: 1, padding: 12, borderRadius: 8, border: `1px solid ${THEME.danger}40`, background: 'rgba(244, 63, 94, 0.15)', color: THEME.danger, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Power size={16} /> Terminate</button>
          </div>
        </div>
      );
    };

    const ErrorDetailPanel = ({ data }) => {
      if (!data) return <EmptyState icon={AlertTriangle} text="Select an error to view stack trace" />;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 24, animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
               <div style={{ fontSize: 10, color: THEME.danger, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>ERROR LOG #{data.id}</div>
               <div style={{ fontSize: 18, fontWeight: 700, color: THEME.textMain }}>{data.type}</div>
               <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 4 }}>{data.timestamp} • {data.user}</div>
            </div>
            <AlertTriangle size={24} color={THEME.danger} />
          </div>
          <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: `1px solid ${THEME.danger}40`, padding: 16, borderRadius: 8 }}>
             <div style={{ fontSize: 11, color: THEME.danger, fontWeight: 700, marginBottom: 4 }}>ERROR DETAIL</div>
             <div style={{ fontSize: 13, color: '#fca5a5' }}>{data.detail}</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 8, fontWeight: 600 }}>CAUSING QUERY</div>
            <div style={{ flex: 1, background: '#0f172a', borderRadius: 8, border: `1px solid ${THEME.grid}`, padding: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, lineHeight: 1.6, color: '#94a3b8', overflowY: 'auto' }}>{data.query}</div>
          </div>
        </div>
      );
    };

    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <MetricCard icon={CheckCircle} title="Availability" value={metrics.availability} unit="%" color={THEME.success} />
          <MetricCard icon={XCircle} title="Downtime Incidents" value={metrics.downtimeIncidents} color={THEME.danger} />
          <MetricCard icon={AlertCircle} title="Error Rate" value={metrics.errorRate.toFixed(1)} unit="/min" color={THEME.warning} />
          <MetricCard icon={Lock} title="Deadlocks" value={metrics.deadlockCount} color={THEME.secondary} />
        </div>
        {!reliabilityViewMode ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, animation: 'fadeIn 0.5s ease' }}>
            <GlassCard title="Connection Health">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div onClick={() => { setReliabilityViewMode('active'); setSelectedReliabilityItem(null); }} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: THEME.textMain }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span>Active Connections</span><div style={{ fontSize: 9, background: THEME.primary, color: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>VIEW LIST</div></div>
                    <span style={{ fontFamily: 'monospace' }}>{metrics.activeConnections} / {metrics.maxConnections}</span>
                  </div>
                  <NeonProgressBar value={metrics.activeConnections} max={metrics.maxConnections} color={THEME.primary} />
                </div>
                <div onClick={() => { setReliabilityViewMode('idle'); setSelectedReliabilityItem(null); }} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: THEME.textMain }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span>Idle Connections</span><div style={{ fontSize: 9, background: THEME.textMuted, color: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>VIEW LIST</div></div>
                    <span style={{ fontFamily: 'monospace' }}>{metrics.idleConnections} / {metrics.maxConnections}</span>
                  </div>
                  <NeonProgressBar value={metrics.idleConnections} max={metrics.maxConnections} color={THEME.textMuted} />
                </div>
              </div>
            </GlassCard>
            <GlassCard title="Top Error Types">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {topErrors.map((error, idx) => (
                  <div key={idx} onClick={() => { setReliabilityViewMode('errors'); setSelectedReliabilityItem(null); }} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}><span style={{ color: THEME.textMain }}>{error.type}</span><span style={{ color: THEME.danger }}>{error.percentage}%</span></div>
                      <NeonProgressBar value={error.percentage} max={100} color={THEME.danger} />
                    </div>
                    <div style={{ fontSize: 11, color: THEME.textMuted, width: 50, textAlign: 'right' }}>{error.count}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr', gap: 24, height: 450, animation: 'slideUp 0.3s ease' }}>
            <GlassCard title={reliabilityViewMode === 'active' ? "Active Sessions" : reliabilityViewMode === 'idle' ? "Idle Sessions" : "Recent Errors"} rightNode={<button onClick={() => { setReliabilityViewMode(null); setSelectedReliabilityItem(null); }} style={{ background: 'transparent', border: 'none', color: THEME.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}><ChevronLeft size={14} /> Back</button>}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', height: '100%', paddingRight: 4 }}>
                {getListItems().map(item => (
                  <div key={item.id || item.pid} onClick={() => setSelectedReliabilityItem(item)} style={{ padding: 12, borderRadius: 8, background: (selectedReliabilityItem?.id === item.id || selectedReliabilityItem?.pid === item.pid) ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${(selectedReliabilityItem?.id === item.id || selectedReliabilityItem?.pid === item.pid) ? THEME.primary : 'rgba(255,255,255,0.05)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                    {reliabilityViewMode === 'errors' ? (
                        <>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: 13, fontWeight: 600, color: THEME.danger }}>{item.type}</span><span style={{ fontSize: 11, color: THEME.textMuted }}>{item.timestamp}</span></div>
                           <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>{item.detail.substring(0, 40)}...</div>
                        </>
                    ) : (
                        <>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: item.state === 'active' ? THEME.success : THEME.warning, boxShadow: `0 0 8px ${item.state === 'active' ? THEME.success : THEME.warning}` }} /><span style={{ fontSize: 13, fontWeight: 600, color: THEME.textMain }}>{item.pid}</span></div><span style={{ fontFamily: 'monospace', fontSize: 12, color: THEME.textMain }}>{item.duration}</span></div>
                           <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.query}</div>
                        </>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
            <GlassCard title="Inspector Details" rightNode={<RefreshCw size={14} color={THEME.textMuted} style={{ cursor: 'pointer' }} />}>
              {reliabilityViewMode === 'errors' ? <ErrorDetailPanel data={selectedReliabilityItem} /> : <ConnectionDetailPanel data={selectedReliabilityItem} />}
            </GlassCard>
          </div>
        )}
      </>
    );
  };

  const IndexesTab = () => {
    const renderIndexDetailList = () => {
        let data = [];
        if (indexViewMode === 'missing') data = missingIndexesData;
        else if (indexViewMode === 'unused') data = unusedIndexesData;
        else if (indexViewMode === 'hitRatio') data = lowHitRatioData;
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%', overflowY: 'auto', paddingRight: 4 }}>
            {data.map((item) => (
              <div key={item.id} onClick={() => setSelectedIndexItem(item)} style={{ padding: 16, borderRadius: 12, background: selectedIndexItem?.id === item.id ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${selectedIndexItem?.id === item.id ? THEME.primary : 'rgba(255,255,255,0.05)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: THEME.textMain }}>{item.table}</span>
                  {indexViewMode === 'missing' && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 700, background: item.impact === 'Critical' ? 'rgba(244,63,94,0.2)' : 'rgba(245,158,11,0.2)', color: item.impact === 'Critical' ? THEME.danger : THEME.warning }}>{item.impact}</span>}
                  {indexViewMode === 'unused' && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 700, background: 'rgba(148,163,184,0.2)', color: THEME.textMuted }}>{item.size}</span>}
                  {indexViewMode === 'hitRatio' && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 700, background: item.ratio < 30 ? 'rgba(244,63,94,0.2)' : 'rgba(245,158,11,0.2)', color: item.ratio < 30 ? THEME.danger : THEME.warning }}>{item.ratio}% Ratio</span>}
                </div>
                <div style={{ fontSize: 12, color: THEME.textMuted, fontFamily: 'monospace' }}>
                  {indexViewMode === 'missing' && `Column: ${item.column}`}
                  {indexViewMode === 'unused' && item.indexName}
                  {indexViewMode === 'hitRatio' && `${item.total_scans} Total Scans`}
                </div>
              </div>
            ))}
          </div>
        );
    };

    return (
        <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 24 }}>
            <MetricCard icon={TrendingUp} title="Index Hit Ratio" value={metrics.indexHitRatio.toFixed(1)} unit="%" color={THEME.success} active={indexViewMode === 'hitRatio'} onClick={() => { setIndexViewMode(indexViewMode === 'hitRatio' ? null : 'hitRatio'); setSelectedIndexItem(null); }} subtitle={indexViewMode === 'hitRatio' ? "Click to close details" : "Click to analyze low ratios"} />
            <MetricCard icon={AlertTriangle} title="Missing Indexes" value={metrics.missingIndexes} color={THEME.warning} active={indexViewMode === 'missing'} onClick={() => { setIndexViewMode(indexViewMode === 'missing' ? null : 'missing'); setSelectedIndexItem(null); }} subtitle={indexViewMode === 'missing' ? "Click to close details" : "Click to view tables"} />
            <MetricCard icon={Layers} title="Unused Indexes" value={metrics.unusedIndexes} color={THEME.danger} active={indexViewMode === 'unused'} onClick={() => { setIndexViewMode(indexViewMode === 'unused' ? null : 'unused'); setSelectedIndexItem(null); }} subtitle={indexViewMode === 'unused' ? "Click to close details" : "Click to view candidates"} />
        </div>

        {indexViewMode === null ? (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, animation: 'fadeIn 0.5s ease' }}>
                <GlassCard title="Scan vs Index Usage">
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={[{ name: 'Stats', scan: metrics.tableScanRate, index: metrics.indexHitRatio }]} barSize={50}>
                            <ChartDefs />
                            <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} vertical={false} />
                            <YAxis tick={{ fontSize: 11, fill: THEME.textMuted }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="scan" name="Table Scan Rate" fill={THEME.warning} radius={[4, 4, 0, 0]} filter="url(#neonGlow)" />
                            <Bar dataKey="index" name="Index Hit Ratio" fill={THEME.success} radius={[4, 4, 0, 0]} filter="url(#neonGlow)" />
                        </BarChart>
                    </ResponsiveContainer>
                </GlassCard>
                <GlassCard title="Fragmentation Status">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                        <div style={{ width: 140, height: 140, borderRadius: '50%', border: `8px solid ${metrics.fragmentationLevel > 30 ? THEME.danger : THEME.success}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 30px ${metrics.fragmentationLevel > 30 ? THEME.danger : THEME.success}40` }}>
                            <span style={{ fontSize: 32, fontWeight: 700, color: THEME.textMain, fontFamily: 'monospace' }}>{metrics.fragmentationLevel}%</span>
                        </div>
                        <div style={{ marginTop: 24 }}>
                            <h4 style={{ margin: 0, color: THEME.textMain }}>Table Fragmentation</h4>
                            <p style={{ margin: '8px 0 0 0', fontSize: 12, color: THEME.textMuted, padding: '0 20px', lineHeight: 1.5 }}>{metrics.fragmentationLevel > 30 ? 'Critical levels detected. Schedule VACUUM FULL.' : 'Fragmentation within healthy operational limits.'}</p>
                        </div>
                    </div>
                </GlassCard>
            </div>
        ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 24, height: 400, animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                <GlassCard title={indexViewMode === 'missing' ? "Tables needing indexes" : indexViewMode === 'unused' ? "Unused index candidates" : "Tables with Low Hit Ratio"} rightNode={<div style={{ fontSize: 11, color: THEME.textMuted }}>{indexViewMode === 'missing' ? missingIndexesData.length : indexViewMode === 'unused' ? unusedIndexesData.length : lowHitRatioData.length} Items</div>}>
                    {renderIndexDetailList()}
                </GlassCard>
                <GlassCard title="AI Optimization Agent" rightNode={<Cpu size={16} color={THEME.ai} />}>
                    <AIAgentView type={indexViewMode} data={selectedIndexItem} />
                </GlassCard>
            </div>
        )}
        </>
    );
  }

  const availableTabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'resources', label: 'Resources', icon: HardDrive },
    { id: 'reliability', label: 'Reliability', icon: CheckCircle },
    { id: 'indexes', label: 'Indexes', icon: Layers },
    { id: 'api', label: 'API Tracing', icon: Network },
    { id: 'admin', label: 'System Admin', icon: Shield }
  ].filter(tab => currentUser?.allowedScreens?.includes(tab.id));

  const [activeTab, setActiveTab] = useState(availableTabs[0]?.id || 'overview');
  useEffect(() => {
    if (!availableTabs.find(t => t.id === activeTab)) {
        setActiveTab(availableTabs[0]?.id || 'overview');
    }
  }, [currentUser]);

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
          * { box-sizing: border-box; }
          body { margin: 0; background-color: ${THEME.bg}; color: ${THEME.textMain}; font-family: 'Inter', sans-serif; overflow: hidden; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        `}
      </style>
      
      <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
        <aside style={{ width: isSidebarOpen ? 260 : 70, background: 'rgba(2, 6, 23, 0.95)', borderRight: `1px solid ${THEME.grid}`, display: 'flex', flexDirection: 'column', zIndex: 10, transition: 'width 0.3s ease' }}>
          <div style={{ padding: '24px 12px', borderBottom: `1px solid ${THEME.grid}`, display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center' }}>
             {isSidebarOpen && (<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Database color="#fff" size={16} /></div><div><div style={{ fontWeight: 700, fontSize: 14 }}>PG Monitor</div><div style={{ fontSize: 10, color: THEME.success }}>Online</div></div></div>)}
             {!isSidebarOpen && (<div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Database color="#fff" size={16} /></div>)}
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'transparent', border: 'none', color: THEME.textMuted, cursor: 'pointer', display: isSidebarOpen ? 'block' : 'none' }}><ChevronLeft size={18} /></button>
          </div>
          {!isSidebarOpen && (<button onClick={() => setIsSidebarOpen(true)} style={{ marginTop: 12, background: 'transparent', border: 'none', color: THEME.textMuted, cursor: 'pointer', alignSelf: 'center' }}><ChevronRight size={18} /></button>)}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '16px 8px' }}>
             {availableTabs.map(item => (
               <button key={item.id} onClick={() => { setActiveTab(item.id); setIndexViewMode(null); setReliabilityViewMode(null); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: isSidebarOpen ? '12px 16px' : '12px', justifyContent: isSidebarOpen ? 'flex-start' : 'center', background: activeTab === item.id ? `linear-gradient(90deg, ${THEME.primary}20, transparent)` : 'transparent', border: 'none', borderLeft: activeTab === item.id ? `3px solid ${THEME.primary}` : '3px solid transparent', color: activeTab === item.id ? THEME.primary : THEME.textMuted, cursor: 'pointer', fontSize: 14, fontWeight: 500, borderRadius: '0 8px 8px 0', transition: 'all 0.2s', position: 'relative' }} title={!isSidebarOpen ? item.label : ''}>
                 <item.icon size={20} />{isSidebarOpen && <span>{item.label}</span>}
               </button>
             ))}
          </div>
          <div style={{ marginTop: 'auto', borderTop: `1px solid ${THEME.grid}` }}>
             <button onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '24px', background: 'transparent', border: 'none', color: THEME.textMuted, cursor: 'pointer', justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}>
                <LogOut size={18} />{isSidebarOpen && <span>Logout</span>}
             </button>
             {isSidebarOpen && (
                <div style={{ padding: '0 24px 24px' }}>
                   <div style={{ fontSize: 11, color: THEME.textMuted, fontFamily: 'monospace' }}>Uptime: {formatUptime(metrics.uptime)}</div>
                   <div style={{ fontSize: 10, color: THEME.textMuted, marginTop: 4 }}>User: {currentUser?.name}</div>
                   <div style={{ fontSize: 10, color: currentUser?.accessLevel === 'write' ? THEME.success : THEME.warning }}>{currentUser?.accessLevel === 'write' ? '• Read & Write' : '• Read Only'}</div>
                </div>
             )}
          </div>
        </aside>
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <header style={{ height: 70, borderBottom: `1px solid ${THEME.grid}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(10px)' }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: THEME.textMain, letterSpacing: '-0.5px' }}>{activeTab === 'api' ? 'API Tracing' : activeTab === 'admin' ? 'System Administration' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Dashboard</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
               <div style={{ display: 'flex', gap: 8 }}>
                 {recentAlerts.map((alert, i) => (<div key={i} style={{ padding: '6px 12px', borderRadius: 20, border: `1px solid ${THEME.warning}40`, background: `${THEME.warning}10`, color: THEME.warning, fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={12} /><span>{alert.message}</span></div>))}
               </div>
               <div style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${THEME.grid}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Search size={16} color={THEME.textMuted} /></div>
            </div>
          </header>
          <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
            <div style={{ maxWidth: 1600, margin: '0 auto' }}>
               <ChartDefs />
               {activeTab === 'overview' && <OverviewTab />}
               {activeTab === 'performance' && <PerformanceTab />}
               {activeTab === 'resources' && <ResourcesTab />}
               {activeTab === 'reliability' && <ReliabilityTab />}
               {activeTab === 'indexes' && <IndexesTab />}
               {activeTab === 'api' && <ApiQueriesTab />}
               {activeTab === 'admin' && <UserManagementTab users={allUsers} onCreateUser={onCreateUser} onDeleteUser={onDeleteUser} />}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

// --- APP WRAPPER ---
const App = () => {
    const { currentUser, loading, error, login, googleLogin, logout, allUsers, createUser, deleteUser } = useMockAuth();

    if (loading && !currentUser) {
        return (
            <div style={{ height: '100vh', width: '100vw', background: THEME.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 40, height: 40, border: `3px solid ${THEME.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!currentUser) {
        return <LoginPage onLogin={login} onGoogleLogin={googleLogin} loading={loading} error={error} />;
    }

    return <PostgreSQLMonitor currentUser={currentUser} onLogout={logout} allUsers={allUsers} onCreateUser={createUser} onDeleteUser={deleteUser} />;
};

export default App;