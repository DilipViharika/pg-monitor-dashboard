import React, { useState, useEffect } from 'react';
import {
  Activity, Database, HardDrive, Zap, Clock, AlertTriangle,
  TrendingUp, TrendingDown, Server, Lock, AlertCircle, CheckCircle,
  XCircle, Search, Cpu, Layers, Terminal, Power, RefreshCw, 
  ChevronLeft, ChevronRight, User as UserIcon, Globe, Network, 
  LogOut, Shield, Key, Mail, Chrome, UserPlus, Settings, Eye, Edit3
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

// --- AUTHENTICATION & USER MANAGEMENT HOOK ---
const useMockAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Default Admin User
  const defaultAdmin = { 
    id: 1, 
    email: 'admin', 
    name: 'System Administrator', 
    role: 'Super Admin', 
    accessLevel: 'write',
    // Admin sees everything including the special 'admin' tab
    allowedScreens: ['overview', 'performance', 'resources', 'reliability', 'indexes', 'api', 'admin'] 
  };

  // Mock Database of Users (Initialize from LocalStorage if available to persist data)
  const [allUsers, setAllUsers] = useState(() => {
    const saved = localStorage.getItem('pg_monitor_users_db');
    return saved ? JSON.parse(saved) : [defaultAdmin];
  });

  // Save users to LocalStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pg_monitor_users_db', JSON.stringify(allUsers));
  }, [allUsers]);

  // Check persistent session on load
  useEffect(() => {
    const storedUserRaw = localStorage.getItem('pg_monitor_user');
    if (storedUserRaw) {
      try {
        const storedUser = JSON.parse(storedUserRaw);
        // SAFETY CHECK: If stored user lacks new permission fields (from old version), force logout
        if (!storedUser.allowedScreens) {
           localStorage.removeItem('pg_monitor_user');
           setCurrentUser(null);
        } else {
           setCurrentUser(storedUser);
        }
      } catch (e) {
        localStorage.removeItem('pg_monitor_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (loginId, password) => {
    setLoading(true);
    setError(null);
    return new Promise((resolve) => {
      setTimeout(() => {
        const normalizedId = loginId.toLowerCase().trim();
        
        // Find user in our "Database"
        const foundUser = allUsers.find(u => u.email.toLowerCase() === normalizedId);
        
        // 1. Check Hardcoded Admin Password Rule
        if (normalizedId === 'admin') {
            if (password === 'admin') {
                setCurrentUser(foundUser);
                localStorage.setItem('pg_monitor_user', JSON.stringify(foundUser));
                setLoading(false);
                resolve(true);
                return;
            } else {
                setError('Invalid admin credentials.');
                setLoading(false);
                resolve(false);
                return;
            }
        }

        // 2. Check Standard Users
        // For this mock, we accept any password > 3 chars if user exists.
        if (foundUser && password.length >= 4) { 
           setCurrentUser(foundUser);
           localStorage.setItem('pg_monitor_user', JSON.stringify(foundUser));
           setLoading(false);
           resolve(true);
           return;
        }

        // 3. Fallback
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
            id: 999,
            email: 'google_user@gmail.com', 
            name: 'Google User', 
            role: 'Viewer', 
            accessLevel: 'read',
            allowedScreens: ['overview', 'resources'] // Restricted view for external login
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

  // User Creation Function
  const createUser = (newUser) => {
      setAllUsers(prev => [...prev, { ...newUser, id: Date.now() }]);
  };

  return { currentUser, loading, error, login, googleLogin, logout, allUsers, createUser };
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
  { id: 1, table: 'orders', column: 'customer_id', impact: 'Critical', scans: '1.2M', improvement: '94%' },
  { id: 2, table: 'transactions', column: 'created_at', impact: 'High', scans: '850k', improvement: '98%' },
  { id: 3, table: 'audit_logs', column: 'user_id', impact: 'Medium', scans: '420k', improvement: '75%' },
  { id: 4, table: 'products', column: 'category_id', impact: 'High', scans: '310k', improvement: '88%' },
];

const unusedIndexesData = [
  { id: 1, table: 'users', indexName: 'idx_users_last_login_old', size: '450MB', lastUsed: '2023-11-04' },
  { id: 2, table: 'orders', indexName: 'idx_orders_temp_v2', size: '1.2GB', lastUsed: 'Never' },
  { id: 3, table: 'inventory', indexName: 'idx_inv_warehouse_loc', size: '120MB', lastUsed: '2024-01-15' },
  { id: 4, table: 'logs', indexName: 'idx_logs_composite_ts', size: '890MB', lastUsed: '2023-12-20' },
];

const lowHitRatioData = [
  { id: 1, table: 'large_audit_logs', ratio: 12, total_scans: '5.4M', problem_query: "SELECT * FROM large_audit_logs WHERE event_data LIKE '%error%'", recommendation: 'Leading wildcard forces Seq Scan. Use Trigram Index.' },
  { id: 2, table: 'payment_history', ratio: 45, total_scans: '890k', problem_query: "SELECT sum(amt) FROM payment_history WHERE created_at::date = now()::date", recommendation: 'Casting prevents index usage. Use WHERE created_at >= ...' },
  { id: 3, table: 'archived_orders', ratio: 28, total_scans: '1.1M', problem_query: "SELECT * FROM archived_orders ORDER BY id DESC LIMIT 50", recommendation: 'High bloat detected. Run VACUUM ANALYZE.' },
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

// --- VISUALIZATION: LOGIN BACKGROUND ---
const LoginBackground = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Seed data
    const initialData = Array.from({ length: 40 }, (_, i) => ({ i, v1: 20 + Math.random() * 30, v2: 10 + Math.random() * 20 }));
    setData(initialData);

    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev.slice(1), { i: prev[prev.length - 1].i + 1, v1: 20 + Math.random() * 30, v2: 10 + Math.random() * 20 }];
        return newData;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.2, pointerEvents: 'none', overflow: 'hidden' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <ChartDefs />
          <Area type="monotone" dataKey="v1" stroke={THEME.primary} fill="url(#primaryGradient)" strokeWidth={2} isAnimationActive={false} />
          <Area type="monotone" dataKey="v2" stroke={THEME.secondary} fill="url(#barGradient)" strokeWidth={2} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 0%, #020617 80%)' }} />
    </div>
  );
};

// --- LOGIN PAGE COMPONENT (FIXED ALIGNMENT) ---
const LoginPage = ({ onLogin, onGoogleLogin, loading, error }) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(loginId, password);
  };

  return (
    <div style={{ 
      height: '100vh', width: '100vw', background: THEME.bg, display: 'flex', 
      alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' 
    }}>
      <LoginBackground />
      
      <div style={{ 
        width: 400, zIndex: 10, padding: 40, borderRadius: 24, 
        background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(20px)',
        border: `1px solid ${THEME.glassBorder}`, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        animation: 'fadeIn 0.8s ease-out'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ 
            width: 60, height: 60, borderRadius: 16, margin: '0 auto 16px',
            background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 20px ${THEME.primary}60`
          }}>
            <Database color="#fff" size={32} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: THEME.textMain, margin: 0 }}>PG Monitor</h1>
          <p style={{ color: THEME.textMuted, fontSize: 13, marginTop: 8 }}>Secure Database Intelligence</p>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(244, 63, 94, 0.1)', border: `1px solid ${THEME.danger}40`, 
            color: '#fca5a5', padding: 12, borderRadius: 8, fontSize: 12, marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 8 
          }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* ALIGNED INPUT GROUP 1 */}
          <div style={{ position: 'relative' }}>
            <Mail size={18} color={THEME.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input 
              type="text" 
              placeholder="Email or Login ID" 
              required
              value={loginId} 
              onChange={(e) => setLoginId(e.target.value)}
              style={{ 
                width: '100%', 
                background: 'rgba(2, 6, 23, 0.5)', 
                border: `1px solid ${THEME.grid}`,
                padding: '12px 12px 12px 44px', // Standardized Padding
                borderRadius: 8, 
                color: '#fff', 
                fontSize: 14, 
                outline: 'none',
                transition: 'border 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = THEME.primary}
              onBlur={(e) => e.target.style.borderColor = THEME.grid}
            />
          </div>

          {/* ALIGNED INPUT GROUP 2 */}
          <div style={{ position: 'relative' }}>
            <Key size={18} color={THEME.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input 
              type="password" 
              placeholder="Password" 
              required
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%', 
                background: 'rgba(2, 6, 23, 0.5)', 
                border: `1px solid ${THEME.grid}`,
                padding: '12px 12px 12px 44px', // Standardized Padding
                borderRadius: 8, 
                color: '#fff', 
                fontSize: 14, 
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = THEME.primary}
              onBlur={(e) => e.target.style.borderColor = THEME.grid}
            />
          </div>

          <button 
            type="submit" disabled={loading}
            style={{ 
              background: `linear-gradient(90deg, ${THEME.primary}, ${THEME.secondary})`,
              border: 'none', padding: 14, borderRadius: 8, color: '#fff', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, marginTop: 8,
              opacity: loading ? 0.7 : 1, transition: 'transform 0.1s'
            }}
            onMouseDown={(e) => !loading && (e.target.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => !loading && (e.target.style.transform = 'scale(1)')}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: THEME.grid }} />
          <span style={{ color: THEME.textMuted, fontSize: 11 }}>OR CONTINUE WITH</span>
          <div style={{ flex: 1, height: 1, background: THEME.grid }} />
        </div>

        <button 
          onClick={onGoogleLogin} disabled={loading}
          style={{ 
            width: '100%', background: 'white', border: 'none', padding: 12, borderRadius: 8,
            color: '#1e293b', fontWeight: 600, cursor: 'pointer', fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            opacity: loading ? 0.7 : 1
          }}
        >
          <Chrome size={18} fill="#1e293b" />
          Google
        </button>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: THEME.success }}>
            <Shield size={12} /> Secure Connection
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: THEME.textMuted }}>
            <Lock size={12} /> End-to-End Encrypted
          </div>
        </div>
      </div>
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
          <span style={{ fontSize: 11, color: THEME.textMuted, fontFamily: 'monospace' }}>DETAILS.sql</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></div>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }}></div>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }}></div>
          </div>
        </div>
        <div style={{ padding: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#a5b4fc', lineHeight: 1.6, flex: 1, overflowY: 'auto' }}>
          {type === 'api' ? (
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
          ) : (
             <>{data.problem_query || "Query optimization suggested..."}</>
          )}
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

// --- TAB COMPONENT: USER MANAGEMENT (ADMIN) ---
const UserManagementTab = ({ users, onCreateUser }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        accessLevel: 'read', // 'read' or 'write'
        allowedScreens: {
            overview: true,
            performance: false,
            resources: false,
            reliability: false,
            indexes: false,
            api: false
        }
    });

    const handleScreenChange = (screen) => {
        setFormData(prev => ({
            ...prev,
            allowedScreens: { ...prev.allowedScreens, [screen]: !prev.allowedScreens[screen] }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Convert screen object to array of strings
        const screenArray = Object.keys(formData.allowedScreens).filter(key => formData.allowedScreens[key]);
        
        onCreateUser({
            name: formData.name,
            email: formData.email,
            role: 'User',
            accessLevel: formData.accessLevel,
            allowedScreens: screenArray
        });
        
        // Reset form
        setFormData({
            name: '', email: '', password: '', accessLevel: 'read',
            allowedScreens: { overview: true, performance: false, resources: false, reliability: false, indexes: false, api: false }
        });
        alert("User Created Successfully!");
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24, height: 'calc(100vh - 140px)' }}>
            
            {/* LEFT: CREATE USER FORM */}
            <GlassCard title="Create New User" rightNode={<UserPlus size={16} color={THEME.success} />}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, color: THEME.textMuted, marginBottom: 6 }}>Full Name</label>
                        <input 
                            required type="text" placeholder="John Doe"
                            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                            style={{ width: '100%', padding: 10, background: 'rgba(255,255,255,0.05)', border: `1px solid ${THEME.grid}`, borderRadius: 6, color: 'white', outline: 'none' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, color: THEME.textMuted, marginBottom: 6 }}>Login ID / Email</label>
                        <input 
                            required type="text" placeholder="john.d"
                            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                            style={{ width: '100%', padding: 10, background: 'rgba(255,255,255,0.05)', border: `1px solid ${THEME.grid}`, borderRadius: 6, color: 'white', outline: 'none' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, color: THEME.textMuted, marginBottom: 6 }}>Access Level</label>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button 
                                type="button"
                                onClick={() => setFormData({...formData, accessLevel: 'read'})}
                                style={{ flex: 1, padding: 10, borderRadius: 6, border: `1px solid ${formData.accessLevel === 'read' ? THEME.primary : THEME.grid}`, background: formData.accessLevel === 'read' ? 'rgba(14, 165, 233, 0.2)' : 'transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                            >
                                <Eye size={14} /> Read Only
                            </button>
                            <button 
                                type="button"
                                onClick={() => setFormData({...formData, accessLevel: 'write'})}
                                style={{ flex: 1, padding: 10, borderRadius: 6, border: `1px solid ${formData.accessLevel === 'write' ? THEME.success : THEME.grid}`, background: formData.accessLevel === 'write' ? 'rgba(16, 185, 129, 0.2)' : 'transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                            >
                                <Edit3 size={14} /> Read & Write
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <label style={{ display: 'block', fontSize: 12, color: THEME.textMuted, marginBottom: 10 }}>Allowed Screen Access</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {Object.keys(formData.allowedScreens).map(key => (
                                <div 
                                    key={key} 
                                    onClick={() => handleScreenChange(key)}
                                    style={{ 
                                        padding: '8px 12px', borderRadius: 6, cursor: 'pointer',
                                        border: `1px solid ${formData.allowedScreens[key] ? THEME.secondary : THEME.grid}`,
                                        background: formData.allowedScreens[key] ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                                        display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'white', textTransform: 'capitalize'
                                    }}
                                >
                                    <div style={{ width: 14, height: 14, borderRadius: 3, border: `1px solid ${THEME.textMuted}`, background: formData.allowedScreens[key] ? THEME.secondary : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {formData.allowedScreens[key] && <CheckCircle size={10} color="white" />}
                                    </div>
                                    {key}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button type="submit" style={{ marginTop: 10, padding: 12, background: THEME.primary, border: 'none', borderRadius: 8, color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                        Create User
                    </button>
                </form>
            </GlassCard>

            {/* RIGHT: USER LIST - READ ONLY */}
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
                            <div style={{ textAlign: 'right', maxWidth: 150 }}>
                                <div style={{ fontSize: 10, color: THEME.textMuted, marginBottom: 4 }}>ACCESS</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end' }}>
                                    {u.allowedScreens.slice(0, 4).map(screen => (
                                        <div key={screen} style={{ width: 6, height: 6, borderRadius: '50%', background: THEME.secondary, title: screen }} />
                                    ))}
                                    {u.allowedScreens.length > 4 && <span style={{ fontSize: 8, color: THEME.textMuted }}>+{u.allowedScreens.length - 4}</span>}
                                </div>
                                <div style={{ fontSize: 10, color: THEME.textMuted, marginTop: 4 }}>
                                    {u.allowedScreens.length} Screens
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
};

// --- MAIN DASHBOARD COMPONENT ---
const PostgreSQLMonitor = ({ currentUser, onLogout, allUsers, onCreateUser }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Calculate available tabs based on permissions
  const availableTabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'resources', label: 'Resources', icon: HardDrive },
    { id: 'reliability', label: 'Reliability', icon: CheckCircle },
    { id: 'indexes', label: 'Indexes', icon: Layers },
    { id: 'api', label: 'API Tracing', icon: Network },
    { id: 'admin', label: 'System Admin', icon: Shield }
  ].filter(tab => currentUser?.allowedScreens?.includes(tab.id));

  // Ensure active tab is valid for current user
  const [activeTab, setActiveTab] = useState(availableTabs[0]?.id || 'overview');
  useEffect(() => {
    if (!availableTabs.find(t => t.id === activeTab)) {
        setActiveTab(availableTabs[0]?.id || 'overview');
    }
  }, [currentUser]);

  // --- Sub-components moved inside to access state ---
  const ApiQueriesTab = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 24, height: 'calc(100vh - 140px)', animation: 'fadeIn 0.5s ease' }}>
        <GlassCard title="API Endpoints" rightNode={<Network size={16} color={THEME.textMuted} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%', overflowY: 'auto', paddingRight: 4 }}>
                {apiQueryData.map(api => (
                    <div
                        key={api.id}
                        // Placeholder for click handler if needed
                        style={{
                            padding: 16,
                            borderRadius: 12,
                            background: 'rgba(255,255,255,0.03)',
                            border: `1px solid rgba(255,255,255,0.05)`,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ 
                                    fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4,
                                    background: api.method === 'GET' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(249, 115, 22, 0.2)',
                                    color: api.method === 'GET' ? THEME.success : THEME.warning
                                }}>{api.method}</span>
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
        
        {/* Placeholder Right Panel */}
        <GlassCard title="Query Analysis" rightNode={<Cpu size={16} color={THEME.ai} />}>
             <AIAgentView type="api" data={apiQueryData[0]} />
        </GlassCard>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: THEME.bg, color: THEME.textMain }}>
        {/* SIDEBAR */}
        <aside style={{ width: isSidebarOpen ? 260 : 70, background: 'rgba(2, 6, 23, 0.95)', borderRight: `1px solid ${THEME.grid}`, display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease' }}>
            <div style={{ padding: '24px 12px', borderBottom: `1px solid ${THEME.grid}`, display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center' }}>
                {isSidebarOpen && <span style={{ fontWeight: 700, fontSize: 14 }}>PG Monitor</span>}
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'transparent', border: 'none', color: THEME.textMuted, cursor: 'pointer' }}><ChevronLeft size={18} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '16px 8px' }}>
                {availableTabs.map(item => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: isSidebarOpen ? '12px 16px' : '12px', justifyContent: isSidebarOpen ? 'flex-start' : 'center', background: activeTab === item.id ? `linear-gradient(90deg, ${THEME.primary}20, transparent)` : 'transparent', border: 'none', borderLeft: activeTab === item.id ? `3px solid ${THEME.primary}` : '3px solid transparent', color: activeTab === item.id ? THEME.primary : THEME.textMuted, cursor: 'pointer', borderRadius: '0 8px 8px 0' }}>
                    <item.icon size={20} />
                    {isSidebarOpen && <span>{item.label}</span>}
                </button>
                ))}
            </div>
            
            <div style={{ marginTop: 'auto', borderTop: `1px solid ${THEME.grid}` }}>
                <button onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '24px', background: 'transparent', border: 'none', color: THEME.textMuted, cursor: 'pointer', justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}>
                    <LogOut size={18} /> {isSidebarOpen && <span>Logout</span>}
                </button>
                {isSidebarOpen && <div style={{ padding: '0 24px 24px', fontSize: 10, color: THEME.textMuted }}>User: {currentUser.name}<br/>Level: {currentUser.accessLevel}</div>}
            </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <header style={{ height: 70, borderBottom: `1px solid ${THEME.grid}`, display: 'flex', alignItems: 'center', padding: '0 32px' }}>
                <h1 style={{ fontSize: 20, fontWeight: 600 }}>{availableTabs.find(t => t.id === activeTab)?.label || 'Dashboard'}</h1>
            </header>
            <div style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
                <ChartDefs />
                
                {/* Simplified content rendering for clarity */}
                {activeTab === 'overview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 24 }}>
                        <GlassCard title="Cluster Activity"><ResponsiveContainer width="100%" height={300}><AreaChart data={Array.from({length:10},(_,i)=>({v:Math.random()*100}))}><Area type="monotone" dataKey="v" stroke={THEME.primary} fill="url(#primaryGradient)"/></AreaChart></ResponsiveContainer></GlassCard>
                        <GlassCard title="Status"><div style={{fontSize:24, fontWeight:'bold', color:THEME.success}}>Healthy</div></GlassCard>
                    </div>
                )}
                
                {activeTab === 'api' && <ApiQueriesTab />}
                {activeTab === 'admin' && <UserManagementTab users={allUsers} onCreateUser={onCreateUser} />}
                
                {/* Fallback for other tabs */}
                {['performance', 'resources', 'reliability', 'indexes'].includes(activeTab) && (
                    <GlassCard title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}>
                        <div style={{color: THEME.textMuted}}>Content for {activeTab} would go here...</div>
                    </GlassCard>
                )}
            </div>
        </main>
    </div>
  );
};

// --- APP ROOT ---
const App = () => {
    const { currentUser, loading, error, login, googleLogin, logout, allUsers, createUser } = useMockAuth();

    if (loading && !currentUser) {
        return <div style={{ height: '100vh', background: THEME.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Loading System...</div>;
    }

    if (!currentUser) {
        return <LoginPage onLogin={login} onGoogleLogin={googleLogin} loading={loading} error={error} />;
    }

    return <PostgreSQLMonitor currentUser={currentUser} onLogout={logout} allUsers={allUsers} onCreateUser={createUser} />;
};

export default App;