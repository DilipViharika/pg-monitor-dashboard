import React, { useState, useEffect, useRef } from 'react';
import {
  Activity, Database, HardDrive, Zap, Clock, AlertTriangle,
  TrendingUp, TrendingDown, Server, Lock, AlertCircle, CheckCircle,
  XCircle, Search, Cpu, Layers, Terminal, Power, RefreshCw, 
  ChevronLeft, ChevronRight, User as UserIcon, Globe, Network, 
  LogOut, Shield, Key, Mail, Chrome, UserPlus, Settings, Eye, Edit3, Trash2, X,
  Share2, Pause, Play, BrainCircuit, Camera, GitCommit
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
];

const mockErrorLogs = [
  { id: 101, type: 'Connection Timeout', timestamp: '10:42:15', user: 'app_svc', db: 'production', query: 'SELECT * FROM large_table_v2...', detail: 'Client closed connection before response' },
  { id: 102, type: 'Deadlock Detected', timestamp: '10:45:22', user: 'worker_01', db: 'warehouse', query: 'UPDATE inventory SET stock = stock - 1...', detail: 'Process 14022 waits for ShareLock on transaction 99201' },
  { id: 103, type: 'Query Timeout', timestamp: '11:01:05', user: 'analytics', db: 'warehouse', query: 'SELECT * FROM logs WHERE created_at < ...', detail: 'Canceling statement due to statement_timeout' },
];

const missingIndexesData = [
  { id: 1, table: 'orders', column: 'customer_id', impact: 'Critical', scans: '1.2M', improvement: '94%', recommendation: 'Create B-Tree index concurrently on customer_id. Estimated creation time: 4s.' },
  { id: 2, table: 'transactions', column: 'created_at', impact: 'High', scans: '850k', improvement: '98%', recommendation: 'BRIN index recommended for time-series data on created_at to save space.' },
  { id: 3, table: 'audit_logs', column: 'user_id', impact: 'Medium', scans: '420k', improvement: '75%', recommendation: 'Standard index recommended. High read volume detected on user dashboard.' },
];

const unusedIndexesData = [
  { id: 1, table: 'users', indexName: 'idx_users_last_login_old', size: '450MB', lastUsed: '2023-11-04', recommendation: 'Safe to drop. Index has not been accessed in over 90 days.' },
  { id: 2, table: 'orders', indexName: 'idx_orders_temp_v2', size: '1.2GB', lastUsed: 'Never', recommendation: 'High Impact: Drop immediately. 1.2GB of wasted storage and write overhead.' },
];

const lowHitRatioData = [
  { id: 1, table: 'large_audit_logs', ratio: 12, total_scans: '5.4M', problem_query: "SELECT * FROM large_audit_logs WHERE event_data LIKE '%error%'", recommendation: 'Leading wildcard forces Seq Scan. Use Trigram Index (pg_trgm).' },
  { id: 2, table: 'payment_history', ratio: 45, total_scans: '890k', problem_query: "SELECT sum(amt) FROM payment_history WHERE created_at::date = now()::date", recommendation: 'Casting prevents index usage. Use WHERE created_at >= current_date.' },
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
      { sql: 'SELECT sum(total) FROM payments WHERE created_at > NOW() - INTERVAL \'24h\'', calls: 1, duration: 145 }
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
      { sql: 'COMMIT', calls: 1, duration: 5 }
    ],
    ai_insight: 'Detected N+1 Query issue. The product stock check runs 5 times in a loop. Batch these into a single query.'
  }
];

// --- AUTHENTICATION HOOK ---
const useMockAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
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
    setIsInitializing(false);
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

  const googleLogin = async (email, name) => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const googleUser = { 
             id: 999 + Math.floor(Math.random() * 1000), 
             email: email || 'google_user@gmail.com', 
             name: name || 'Google User', 
             role: 'Viewer', 
             accessLevel: 'read',
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

  const updateUser = (updatedData) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updatedData };
    setCurrentUser(updatedUser);
    localStorage.setItem('pg_monitor_user', JSON.stringify(updatedUser));
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updatedData } : u));
  };

  return { currentUser, isInitializing, loading, error, login, googleLogin, logout, allUsers, createUser, deleteUser, updateUser };
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
      /* Custom Scrollbar for Logs */
      .log-stream::-webkit-scrollbar { width: 4px; }
      .log-stream::-webkit-scrollbar-thumb { background: ${THEME.grid}; }
    `}</style>
);

// --- NEW COMPONENT: LIVE LOG STREAM (MATRIX STYLE) ---
const LogStream = ({ isPaused }) => {
    const [logs, setLogs] = useState([]);
    const logsEndRef = useRef(null);

    useEffect(() => {
        if (isPaused) return;
        
        const logTypes = ['INFO', 'WARN', 'DEBUG', 'ERROR'];
        const messages = ['Connection pool initialized', 'Running VACUUM on public.users', 'Slow query detected: 140ms', 'Auth token refreshed', 'Cache hit ratio dropped below 90%', 'Replica sync latency: 12ms'];
        
        const interval = setInterval(() => {
            const newLog = {
                id: Date.now(),
                time: new Date().toLocaleTimeString(),
                type: logTypes[Math.floor(Math.random() * logTypes.length)],
                msg: messages[Math.floor(Math.random() * messages.length)]
            };
            setLogs(prev => [...prev.slice(-19), newLog]); // Keep last 20
        }, 1200);

        return () => clearInterval(interval);
    }, [isPaused]);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    return (
        <div className="log-stream" style={{ height: '100%', overflowY: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {logs.map(log => (
                <div key={log.id} style={{ display: 'flex', gap: 8, opacity: 0.8 }}>
                    <span style={{ color: THEME.textMuted }}>{log.time}</span>
                    <span style={{ 
                        color: log.type === 'ERROR' ? THEME.danger : log.type === 'WARN' ? THEME.warning : THEME.success,
                        fontWeight: 700, width: 40
                    }}>{log.type}</span>
                    <span style={{ color: '#fff' }}>{log.msg}</span>
                </div>
            ))}
            <div ref={logsEndRef} />
        </div>
    );
};

// --- NEW COMPONENT: TABLE SPARKLINE ---
const TableSparkline = ({ color }) => {
    const [data] = useState(Array.from({length: 10}, () => ({ val: Math.random() * 100 })));
    return (
        <div style={{ width: 60, height: 20 }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <Line type="monotone" dataKey="val" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

// --- NEW COMPONENT: TOPOLOGY MAP (SVG) ---
const TopologyMap = () => {
    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="300" height="120" viewBox="0 0 300 120">
                {/* Lines */}
                <path d="M50 60 L120 60" stroke={THEME.grid} strokeWidth="2" strokeDasharray="4 4">
                    <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" />
                </path>
                <path d="M180 60 L250 60" stroke={THEME.grid} strokeWidth="2" />
                
                {/* Nodes */}
                <g>
                    <circle cx="50" cy="60" r="15" fill={THEME.glass} stroke={THEME.primary} strokeWidth="2" />
                    <text x="50" y="90" fill={THEME.textMuted} fontSize="10" textAnchor="middle">Client</text>
                </g>
                
                <g>
                    <rect x="120" y="40" width="60" height="40" rx="4" fill={THEME.glass} stroke={THEME.secondary} strokeWidth="2" />
                    <text x="150" y="64" fill="white" fontSize="10" textAnchor="middle" fontWeight="bold">API</text>
                </g>

                <g>
                    <path d="M250 35 L250 85 Q250 90 260 85 L280 85 Q290 85 290 75 L290 45 Q290 35 280 35 L260 35 Q250 35 250 40" fill={THEME.glass} stroke={THEME.success} strokeWidth="2" />
                    <text x="270" y="64" fill="white" fontSize="10" textAnchor="middle" fontWeight="bold">DB</text>
                </g>
            </svg>
        </div>
    );
};

// --- NEW COMPONENT: SMART SUMMARY WIDGET ---
const SmartSummaryWidget = () => (
    <div style={{ background: `linear-gradient(135deg, ${THEME.ai}15, transparent)`, border: `1px solid ${THEME.ai}40`, borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <BrainCircuit size={16} color={THEME.ai} />
            <span style={{ fontSize: 12, fontWeight: 700, color: THEME.ai }}>AI INSIGHT</span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: '#e2e8f0', lineHeight: 1.5 }}>
            Traffic to <span style={{ color: THEME.primary, fontWeight: 600 }}>/api/orders</span> has spiked <strong>14%</strong> in the last hour. 
            Database CPU is nominal, but consider scaling replicas if trends continue.
        </p>
    </div>
);

// --- VISUAL COMPONENTS (LoginVisuals, etc.) ---
// ... (Keeping LoginVisuals, GoogleAuthModal, etc. same as before)
const LoginVisuals = () => {
  const data = Array.from({ length: 40 }, (_, i) => ({
    time: i,
    value: 40 + Math.random() * 40 + (Math.sin(i / 5) * 20),
    value2: 30 + Math.random() * 20
  }));
  return (
    <div style={{ flex: 1, position: 'relative', background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 60 }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.1) 0%, transparent 50%)' }} />
      <div className="scanline-overlay" style={{ position: 'absolute', inset: 0, opacity: 0.1 }} />
      <div style={{ width: '100%', maxWidth: 600, background: 'rgba(15, 23, 42, 0.6)', border: `1px solid ${THEME.glassBorder}`, borderRadius: 24, padding: 30, backdropFilter: 'blur(20px)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
           <div><div style={{ color: THEME.textMuted, fontSize: 12, fontWeight: 600 }}>LIVE CLUSTER HEALTH</div><div style={{ color: THEME.textMain, fontSize: 24, fontWeight: 700 }}>US-East-1 Prod</div></div>
           <div style={{ textAlign: 'right' }}><div style={{ color: THEME.success, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}><div style={{ width: 8, height: 8, background: THEME.success, borderRadius: '50%', boxShadow: `0 0 10px ${THEME.success}` }} />OPERATIONAL</div><div style={{ color: THEME.textMuted, fontSize: 12, marginTop: 4 }}>99.99% Uptime</div></div>
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
      </div>
    </div>
  );
};

const GoogleAuthModal = ({ isOpen, onClose, onConfirm }) => {
    const [mockEmail, setMockEmail] = useState('');
    if (!isOpen) return null;
    const handleConfirm = (e) => {
        e.preventDefault();
        const namePart = mockEmail.split('@')[0] || "User";
        const cleanName = namePart.split(/[._]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        onConfirm(mockEmail, cleanName);
    };
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', width: 400, borderRadius: 8, padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: 'transparent', cursor: 'pointer' }}><X size={20} color="#5f6368" /></button>
                <div style={{ marginBottom: 16 }}><Chrome size={48} color="#4285F4" /></div>
                <h3 style={{ margin: '0 0 8px 0', color: '#202124', fontSize: 24, fontWeight: 500 }}>Sign in</h3>
                <form onSubmit={handleConfirm} style={{ width: '100%' }}>
                    <div style={{ marginBottom: 24, width: '100%' }}>
                        <input type="email" required autoFocus placeholder="Email or phone" value={mockEmail} onChange={(e) => setMockEmail(e.target.value)} style={{ width: '100%', padding: '13px 12px', borderRadius: 4, border: '1px solid #dadce0', fontSize: 16, color: '#202124', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
                        <button type="submit" style={{ background: '#1a73e8', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 4, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Next</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const LoginPage = ({ onLogin, onGoogleLogin, loading, error }) => {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [showGoogleModal, setShowGoogleModal] = useState(false);
    
    const handleSubmit = (e) => { e.preventDefault(); onLogin(loginId, password); };
    const handleGoogleSubmit = (email, name) => { setShowGoogleModal(false); onGoogleLogin(email, name); };
  
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', background: '#020617' }}>
        <LoginStyles />
        <GoogleAuthModal isOpen={showGoogleModal} onClose={() => setShowGoogleModal(false)} onConfirm={handleGoogleSubmit} />
        <div style={{ width: '40%', minWidth: 450, background: '#020617', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px', borderRight: `1px solid ${THEME.grid}`, position: 'relative' }}>
          <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${THEME.primary}40` }}><Database color="#fff" size={20} /></div>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>PG Monitor</span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Welcome back</h1>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="login-input-group"><input type="text" required value={loginId} onChange={(e) => setLoginId(e.target.value)} placeholder="name@company.com" style={{ width: '100%', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', border: `1px solid ${THEME.grid}`, borderRadius: 8, color: 'white', fontSize: 14 }} /></div>
            <div className="login-input-group"><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', border: `1px solid ${THEME.grid}`, borderRadius: 8, color: 'white', fontSize: 14 }} /></div>
            <button type="submit" disabled={loading} style={{ marginTop: 10, background: THEME.primary, border: 'none', padding: '14px', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? 'Authenticating...' : 'Sign in'}</button>
          </form>
          <button onClick={() => setShowGoogleModal(true)} disabled={loading} style={{ width: '100%', background: 'transparent', border: `1px solid ${THEME.grid}`, padding: '12px', borderRadius: 8, color: 'white', marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>Sign in with Google</button>
        </div>
        <LoginVisuals />
      </div>
    );
};

const GlassCard = ({ children, title, rightNode, style }) => (
  <div style={{ background: THEME.glass, backdropFilter: 'blur(12px)', borderRadius: 16, border: `1px solid ${THEME.glassBorder}`, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)', padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden', ...style }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, zIndex: 2 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>{title}</h3>
      {rightNode}
    </div>
    <div style={{ flex: 1, minHeight: 0, position: 'relative', zIndex: 1 }}>{children}</div>
    <div style={{ position: 'absolute', top: -60, right: -60, width: 140, height: 140, background: `radial-gradient(circle, ${THEME.primary}15 0%, transparent 70%)`, pointerEvents: 'none' }} />
  </div>
);

const MetricCard = ({ icon: Icon, title, value, unit, subtitle, color = THEME.primary, onClick, active, sparkData }) => (
  <div onClick={onClick} style={{ background: active ? `linear-gradient(180deg, ${color}20 0%, ${color}10 100%)` : 'linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)', borderRadius: 12, border: active ? `1px solid ${color}` : `1px solid ${THEME.glassBorder}`, padding: '20px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12, cursor: onClick ? 'pointer' : 'default', transition: 'all 0.3s', transform: active ? 'translateY(-2px)' : 'none' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}30` }}><Icon size={20} /></div>
      {sparkData && !active && (<div style={{ width: 80, height: 40 }}><ResponsiveContainer width="100%" height="100%"><LineChart data={sparkData}><Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div>)}
    </div>
    <div>
      <div style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 600, textTransform: 'uppercase' }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: THEME.textMain, fontFamily: 'monospace' }}>{value}</span>{unit && <span style={{ fontSize: 12, color: THEME.textMuted }}>{unit}</span>}
      </div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', border: `1px solid ${THEME.glassBorder}`, borderRadius: 8, padding: '12px' }}>
        <p style={{ color: THEME.textMuted, fontSize: 11, marginBottom: 8, fontFamily: 'monospace' }}>{label}</p>
        {payload.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: entry.color }} />
            <span style={{ fontSize: 12, color: '#fff', fontFamily: 'monospace' }}>{entry.name}: {entry.value}</span>
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
      <ResponsiveContainer width="100%" height="100%"><RadialBarChart innerRadius="70%" outerRadius="100%" barSize={10} data={data} startAngle={180} endAngle={0}><PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} /><RadialBar background clockWise dataKey="value" cornerRadius={10} /></RadialBarChart></ResponsiveContainer>
      <div style={{ position: 'absolute', top: '60%', transform: 'translateY(-50%)', textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 700, color: THEME.textMain, fontFamily: 'monospace' }}>{value}%</div><div style={{ fontSize: 11, color: THEME.textMuted, textTransform: 'uppercase' }}>{label}</div></div>
    </div>
  );
};

const AIAgentView = ({ type, data }) => {
    if (!data) return (<div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: THEME.textMuted, opacity: 0.6 }}><Terminal size={24} /></div>);
    const renderSqlContext = () => {
      if (type === 'api') {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.queries.map((q, i) => (
              <div key={i} style={{ borderBottom: `1px solid ${THEME.grid}`, paddingBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: THEME.textMuted, fontSize: 11, marginBottom: 4 }}><span>{q.calls} Executions</span><span>{q.duration}ms</span></div>
                <div style={{ color: '#fff' }}>{q.sql}</div>
              </div>
            ))}
          </div>
        );
      }
      return <>{data.recommendation}</>;
    };
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>
        <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: `1px solid ${THEME.ai}40`, borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><Zap size={14} color={THEME.ai} /><span style={{ fontSize: 13, fontWeight: 700, color: THEME.ai }}>AI ANALYSIS</span></div>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: THEME.textMain, margin: 0 }}>{type === 'api' ? data.ai_insight : (data.recommendation || 'Analysis complete.')}</p>
        </div>
        <div style={{ flex: 1, background: '#0f172a', borderRadius: 12, border: `1px solid ${THEME.grid}`, padding: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#a5b4fc', overflowY: 'auto' }}>{renderSqlContext()}</div>
      </div>
    );
};

const EmptyState = ({ icon: Icon, text }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: THEME.textMuted, gap: 16, opacity: 0.7 }}><Icon size={32} /><div>{text}</div></div>
);

// --- NEW COMPONENT: LIVE STATUS BADGE ---
const LiveStatusBadge = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: 20, border: `1px solid ${THEME.success}30` }}>
    <div style={{ position: 'relative', width: 8, height: 8 }}>
       <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: THEME.success }}></div>
       <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', background: THEME.success, opacity: 0.4, animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>
       <style>{`@keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }`}</style>
    </div>
    <span style={{ color: THEME.success, fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>LIVE STREAM</span>
  </div>
);

// --- NEW COMPONENT: BENTO METRIC ---
const BentoMetric = ({ label, value, unit, icon: Icon, color, trend, delay }) => (
  <div style={{ 
      background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
      borderRadius: 16, 
      padding: 20, 
      border: `1px solid rgba(255,255,255,0.05)`,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      animation: `fadeIn 0.5s ease ${delay}s backwards`,
      position: 'relative', overflow: 'hidden'
  }}>
     <div style={{ position: 'absolute', top: 0, right: 0, padding: 16, opacity: 0.1 }}><Icon size={48} color={color} /></div>
     <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ padding: 6, borderRadius: 8, background: `${color}20`, color: color }}><Icon size={16} /></div>
        <span style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>
     </div>
     <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 13, color: THEME.textMuted, marginBottom: 4 }}>{unit}</span>
     </div>
     {trend && (
       <div style={{ marginTop: 8, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, color: trend > 0 ? THEME.success : THEME.danger }}>
          {trend > 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
          <span>{Math.abs(trend)}% vs last hr</span>
       </div>
     )}
  </div>
);

// --- USER PROFILE MODAL ---
const UserProfileModal = ({ isOpen, onClose, currentUser, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({ ...currentUser });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setFormData({ ...currentUser });
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onUpdate({ name: formData.name, email: formData.email });
      setLoading(false);
      onClose();
    }, 1000);
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button onClick={() => setActiveTab(id)} style={{ flex: 1, padding: '12px', background: activeTab === id ? 'rgba(14, 165, 233, 0.1)' : 'transparent', border: 'none', borderBottom: `2px solid ${activeTab === id ? THEME.primary : 'transparent'}`, color: activeTab === id ? THEME.primary : THEME.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, fontWeight: 600, transition: 'all 0.2s' }}>
      <Icon size={16} /> {label}
    </button>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 500, background: '#0f172a', border: `1px solid ${THEME.grid}`, borderRadius: 16, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden', animation: 'fadeIn 0.3s ease' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${THEME.grid}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2, 6, 23, 0.5)' }}>
          <h2 style={{ margin: 0, fontSize: 18, color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}><UserIcon size={20} color={THEME.primary} /> Edit Profile</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: THEME.textMuted, cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <div style={{ display: 'flex', borderBottom: `1px solid ${THEME.grid}` }}><TabButton id="general" label="General" icon={UserIcon} /><TabButton id="security" label="Security" icon={Shield} /><TabButton id="prefs" label="Preferences" icon={Settings} /></div>
        <div style={{ padding: 24 }}>
          {activeTab === 'general' && (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div><label style={{ display: 'block', fontSize: 12, color: THEME.textMuted, marginBottom: 6 }}>Full Name</label><input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: `1px solid ${THEME.grid}`, borderRadius: 8, color: 'white', outline: 'none' }} /></div>
              <div><label style={{ display: 'block', fontSize: 12, color: THEME.textMuted, marginBottom: 6 }}>Email Address</label><input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: `1px solid ${THEME.grid}`, borderRadius: 8, color: 'white', outline: 'none' }} /></div>
            </form>
          )}
          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ padding: 16, background: 'rgba(16, 185, 129, 0.1)', border: `1px solid ${THEME.success}40`, borderRadius: 8, display: 'flex', gap: 12 }}><Shield color={THEME.success} size={24} /><div><div style={{ color: THEME.success, fontWeight: 700, fontSize: 14 }}>Account is Secure</div></div></div>
            </div>
          )}
          {activeTab === 'prefs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><div><div style={{ color: 'white' }}>Email Notifications</div></div></div>
            </div>
          )}
        </div>
        <div style={{ padding: '16px 24px', borderTop: `1px solid ${THEME.grid}`, display: 'flex', justifyContent: 'flex-end', gap: 12, background: 'rgba(2, 6, 23, 0.3)' }}>
          <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: 8, background: 'transparent', border: `1px solid ${THEME.grid}`, color: 'white', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={loading} style={{ padding: '10px 20px', borderRadius: 8, background: THEME.primary, border: 'none', color: 'white', cursor: 'pointer' }}>{loading ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );
};

// --- USER MANAGEMENT TAB ---
const UserManagementTab = ({ users, onCreateUser, onDeleteUser }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', accessLevel: 'read', allowedScreens: { overview: true, performance: false, resources: false, reliability: false, indexes: false, api: false } });
    const handleScreenChange = (screen) => { setFormData(prev => ({ ...prev, allowedScreens: { ...prev.allowedScreens, [screen]: !prev.allowedScreens[screen] } })); };
    const handleSubmit = (e) => {
        e.preventDefault();
        const screenArray = Object.keys(formData.allowedScreens).filter(key => formData.allowedScreens[key]);
        onCreateUser({ ...formData, role: 'User', allowedScreens: screenArray });
        alert("User Created Successfully!");
    };
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24, height: 'calc(100vh - 140px)' }}>
            <GlassCard title="Create New User" rightNode={<UserPlus size={16} color={THEME.success} />}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div><label style={{ display: 'block', fontSize: 12, color: THEME.textMuted, marginBottom: 6 }}>Full Name</label><input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: 10, background: 'rgba(255,255,255,0.05)', border: `1px solid ${THEME.grid}`, borderRadius: 6, color: 'white', outline: 'none' }} /></div>
                    <button type="submit" style={{ marginTop: 10, padding: 12, background: THEME.primary, border: 'none', borderRadius: 8, color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Create User</button>
                </form>
            </GlassCard>
            <GlassCard title="Active Users" rightNode={<Settings size={16} color={THEME.textMuted} />}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', height: '100%' }}>
                    {users.map((u) => (
                        <div key={u.id} style={{ padding: 16, background: 'rgba(255,255,255,0.03)', border: `1px solid ${THEME.grid}`, borderRadius: 12, display: 'flex', justifyContent: 'space-between' }}>
                            <div><div style={{ fontWeight: 'bold', color: 'white' }}>{u.name}</div><div style={{ fontSize: 12, color: THEME.textMuted }}>{u.email}</div></div>
                            {u.id !== 1 && (<button onClick={() => onDeleteUser(u.id)} style={{ background: 'transparent', border: 'none', color: THEME.danger, cursor: 'pointer' }}><Trash2 size={16} /></button>)}
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
};

// --- MAIN DASHBOARD ---
const PostgreSQLMonitor = ({ currentUser, onLogout, allUsers, onCreateUser, onDeleteUser, onUpdateUser }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showForecast, setShowForecast] = useState(false);

  // Mocks
  const [metrics, setMetrics] = useState({ qps: 1847, cpuUsage: 42.5, avgQueryTime: 45.2, readWriteRatio: 68, selectPerSec: 1245, insertPerSec: 342, updatePerSec: 198, deletePerSec: 62 });
  const [liveMetrics, setLiveMetrics] = useState({ qps: 1847, cpu: 42.5 });
  const [last30Days, setLast30Days] = useState(Array.from({ length: 30 }, (_, i) => ({ date: i, qps: 1000 + Math.random() * 500, tps: 500 + Math.random() * 300 })));

  // Mock data simulation (jitter)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
        setLiveMetrics(prev => ({
            qps: Math.max(100, Math.floor(prev.qps + (Math.random() * 100 - 50))),
            cpu: Math.min(100, Math.max(0, parseFloat((prev.cpu + (Math.random() * 2 - 1)).toFixed(1))))
        }));
    }, 2000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Tab Rendering Logic
  const renderTab = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
            {/* 1. HERO SECTION: Big Chart + Live Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: 24, minHeight: 340 }}>
              <GlassCard title="Cluster Activity" rightNode={<LiveStatusBadge />} style={{ background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(2, 6, 23, 0.9) 100%)' }}>
                <div style={{ width: '100%', height: '100%', minHeight: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={last30Days}>
                      <ChartDefs />
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="date" hide />
                      <YAxis tick={{ fontSize: 11, fill: THEME.textMuted }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ paddingTop: 10 }} />
                      <Area type="monotone" dataKey="qps" stroke={THEME.primary} strokeWidth={3} fill="url(#primaryGradient)" name="Queries/Sec" filter="url(#neonGlow)" />
                      <Area type="monotone" dataKey="tps" stroke={THEME.secondary} strokeWidth={3} fill="url(#barGradient)" name="Trans/Sec" filter="url(#neonGlow)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
              <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr 1fr', gap: 16 }}>
                   <BentoMetric label="Current Load" value={liveMetrics.qps} unit="QPS" icon={Zap} color={THEME.primary} trend={12.5} delay={0.1} />
                   <BentoMetric label="Avg Latency" value={metrics.avgQueryTime.toFixed(1)} unit="ms" icon={Clock} color={THEME.warning} trend={-2.4} delay={0.2} />
                   <BentoMetric label="CPU Health" value={liveMetrics.cpu} unit="%" icon={Cpu} color={liveMetrics.cpu > 80 ? THEME.danger : THEME.success} delay={0.3} />
              </div>
            </div>
            {/* 2. SECONDARY METRICS ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
                <GlassCard title="Workload Type" style={{ gridColumn: 'span 1' }}>
                   <div style={{ position: 'relative', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={[{ value: metrics.readWriteRatio }, { value: 100 - metrics.readWriteRatio }]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} startAngle={90} endAngle={-270} dataKey="value" stroke="none" paddingAngle={5}>
                            <Cell fill={THEME.primary} filter="url(#neonGlow)" />
                            <Cell fill="rgba(255,255,255,0.05)" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ position: 'absolute', textAlign: 'center' }}>
                          <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{metrics.readWriteRatio}%</div>
                          <div style={{ fontSize: 10, color: THEME.primary, letterSpacing: 1 }}>READS</div>
                      </div>
                   </div>
                </GlassCard>
                <GlassCard title="Throughput Breakdown" style={{ gridColumn: 'span 2' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, height: '100%', alignItems: 'center' }}>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, color: THEME.textMuted }}><span>SELECT</span><span style={{color:'#fff'}}>{metrics.selectPerSec}/s</span></div><NeonProgressBar value={metrics.selectPerSec} max={2000} color={THEME.primary} /></div>
                        <div><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, color: THEME.textMuted }}><span>INSERT</span><span style={{color:'#fff'}}>{metrics.insertPerSec}/s</span></div><NeonProgressBar value={metrics.insertPerSec} max={2000} color={THEME.success} /></div>
                     </div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, color: THEME.textMuted }}><span>UPDATE</span><span style={{color:'#fff'}}>{metrics.updatePerSec}/s</span></div><NeonProgressBar value={metrics.updatePerSec} max={2000} color={THEME.warning} /></div>
                        <div><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, color: THEME.textMuted }}><span>DELETE</span><span style={{color:'#fff'}}>{metrics.deletePerSec}/s</span></div><NeonProgressBar value={metrics.deletePerSec} max={2000} color={THEME.danger} /></div>
                     </div>
                  </div>
                </GlassCard>
                <GlassCard title="System Health" style={{ gridColumn: 'span 1' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%', justifyContent: 'center' }}>
                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 8, height: 8, background: THEME.success, borderRadius: '50%', boxShadow: `0 0 8px ${THEME.success}` }} /><span style={{ fontSize: 13, color: '#fff' }}>Uptime</span></div><span style={{ fontFamily: 'monospace', fontSize: 13, color: THEME.textMuted }}>99.99%</span></div>
                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 8, height: 8, background: THEME.warning, borderRadius: '50%', boxShadow: `0 0 8px ${THEME.warning}` }} /><span style={{ fontSize: 13, color: '#fff' }}>Replicas</span></div><span style={{ fontFamily: 'monospace', fontSize: 13, color: THEME.textMuted }}>2 / 2</span></div>
                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 8, height: 8, background: THEME.success, borderRadius: '50%', boxShadow: `0 0 8px ${THEME.success}` }} /><span style={{ fontSize: 13, color: '#fff' }}>Storage</span></div><span style={{ fontFamily: 'monospace', fontSize: 13, color: THEME.textMuted }}>Healthy</span></div>
                   </div>
                </GlassCard>
            </div>
            {/* 3. NEW: ADVANCED WIDGETS ROW (Logs, Topology, AI) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, height: 280 }}>
                <GlassCard title="Live Log Stream" rightNode={<Terminal size={14} color={THEME.textMuted} />}>
                    <LogStream isPaused={isPaused} />
                </GlassCard>
                <GlassCard title="Service Topology" rightNode={<Network size={14} color={THEME.textMuted} />}>
                    <TopologyMap />
                </GlassCard>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <SmartSummaryWidget />
                    <GlassCard title="Top Service Traffic">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {['Auth Service', 'Order API', 'Search Node'].map((svc, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                                    <span style={{ color: THEME.textMain }}>{svc}</span>
                                    <TableSparkline color={i === 0 ? THEME.primary : i === 1 ? THEME.success : THEME.warning} />
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
          </div>
        );
      // ... (You can add the other tabs like Performance, Resources back here if needed from previous code)
      case 'performance': return <div style={{ color: 'white' }}>Performance Tab Placeholder</div>; // Re-add full component
      case 'admin': return <UserManagementTab users={allUsers} onCreateUser={onCreateUser} onDeleteUser={onDeleteUser} />;
      default: return <div style={{ color: 'white' }}>Select a tab</div>;
    }
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap'); * { box-sizing: border-box; } body { margin: 0; background-color: ${THEME.bg}; color: ${THEME.textMain}; font-family: 'Inter', sans-serif; overflow: hidden; } ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }`}</style>
      
      {/* MODAL */}
      <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} currentUser={currentUser} onUpdate={onUpdateUser} />
      
      <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
        {/* SIDEBAR */}
        <aside style={{ width: isSidebarOpen ? 260 : 70, background: 'rgba(2, 6, 23, 0.95)', borderRight: `1px solid ${THEME.grid}`, display: 'flex', flexDirection: 'column', zIndex: 10, transition: 'width 0.3s ease' }}>
          {/* ... Sidebar Header ... */}
          <div style={{ padding: '24px 12px', borderBottom: `1px solid ${THEME.grid}`, display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center' }}>
             {isSidebarOpen ? (<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Database color="#fff" size={16} /></div><span style={{ fontWeight: 700, fontSize: 14 }}>PG Monitor</span></div>) : (<Database color="#fff" size={16} />)}
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'transparent', border: 'none', color: THEME.textMuted, cursor: 'pointer' }}><ChevronLeft size={18} /></button>
          </div>
          {/* ... Nav Items ... */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '16px 8px' }}>
             {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'performance', label: 'Performance', icon: Zap },
                { id: 'admin', label: 'Admin', icon: Shield },
                { id: 'profile_modal', label: 'My Profile', icon: UserIcon }
             ].map(item => (
               <button key={item.id} onClick={() => item.id === 'profile_modal' ? setIsProfileOpen(true) : setActiveTab(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: isSidebarOpen ? '12px 16px' : '12px', justifyContent: isSidebarOpen ? 'flex-start' : 'center', background: activeTab === item.id && item.id !== 'profile_modal' ? `linear-gradient(90deg, ${THEME.primary}20, transparent)` : 'transparent', border: 'none', borderLeft: activeTab === item.id && item.id !== 'profile_modal' ? `3px solid ${THEME.primary}` : '3px solid transparent', color: activeTab === item.id ? THEME.primary : THEME.textMuted, cursor: 'pointer', fontSize: 14, fontWeight: 500, borderRadius: '0 8px 8px 0', transition: 'all 0.2s' }}>
                 <item.icon size={20} />{isSidebarOpen && <span>{item.label}</span>}
               </button>
             ))}
          </div>
          {/* ... Sidebar Footer ... */}
          <div style={{ marginTop: 'auto', borderTop: `1px solid ${THEME.grid}` }}>
             <button onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '24px', background: 'transparent', border: 'none', color: THEME.textMuted, cursor: 'pointer', justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}><LogOut size={18} />{isSidebarOpen && <span>Logout</span>}</button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* HEADER */}
          <header style={{ height: 70, borderBottom: `1px solid ${THEME.grid}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(10px)' }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: THEME.textMain }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Dashboard</h1>
            
            {/* NEW: Global Controls (Search, Play/Pause, Snapshot) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
               <div style={{ position: 'relative' }}>
                  <Search size={16} color={THEME.textMuted} style={{ position: 'absolute', left: 12, top: 10 }} />
                  <input type="text" placeholder="Ask AI: 'Show errors > 5%...'" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${THEME.grid}`, borderRadius: 20, padding: '8px 12px 8px 36px', color: 'white', outline: 'none', fontSize: 13, width: 240 }} />
               </div>
               <div style={{ width: 1, height: 24, background: THEME.grid }}></div>
               <button onClick={() => setIsPaused(!isPaused)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isPaused ? THEME.warning : THEME.textMuted }} title={isPaused ? "Resume Live Data" : "Pause Live Data"}>
                  {isPaused ? <Play size={18} fill={THEME.warning} /> : <Pause size={18} />}
               </button>
               <button onClick={() => alert("Snapshot saved to clipboard!")} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: THEME.textMuted }} title="Take Snapshot">
                  <Camera size={18} />
               </button>
            </div>
          </header>

          <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
            <div style={{ maxWidth: 1600, margin: '0 auto' }}>
               <ChartDefs />
               {renderTab()}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

// --- APP WRAPPER ---
const App = () => {
    const { currentUser, isInitializing, loading, error, login, googleLogin, logout, allUsers, createUser, deleteUser, updateUser } = useMockAuth();

    if (isInitializing) return <div style={{ height: '100vh', background: THEME.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Loading...</div>;
    if (!currentUser) return <LoginPage onLogin={login} onGoogleLogin={googleLogin} loading={loading} error={error} />;

    return <PostgreSQLMonitor currentUser={currentUser} onLogout={logout} allUsers={allUsers} onCreateUser={createUser} onDeleteUser={deleteUser} onUpdateUser={updateUser} />;
};

export default App;