import React, { useState, useEffect } from 'react';
import {
  Activity, Database, HardDrive, Zap, Clock, AlertTriangle,
  TrendingUp, TrendingDown, Server, Lock, AlertCircle, CheckCircle,
  XCircle, Search, Cpu, Layers, Terminal, PlusCircle, Trash2,
  Power, RefreshCw, ChevronLeft, ChevronRight, User as UserIcon, Globe,
  Menu, Code, FileText, Network, ArrowRight, Settings, Plug, LogIn
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';

// --- 1. THEME & CONSTANTS ---
const THEMES = {
  PostgreSQL: { primary: '#0EA5E9', secondary: '#8B5CF6', bg: '#020617', glassBorder: 'rgba(56, 189, 248, 0.1)' },
  MySQL: { primary: '#F59E0B', secondary: '#0EA5E9', bg: '#0f172a', glassBorder: 'rgba(245, 158, 11, 0.1)' },
  SQLite: { primary: '#10B981', secondary: '#64748B', bg: '#052e16', glassBorder: 'rgba(16, 185, 129, 0.1)' },
  Oracle: { primary: '#EF4444', secondary: '#F59E0B', bg: '#2b0a0a', glassBorder: 'rgba(239, 68, 68, 0.1)' },
  SQLServer: { primary: '#A855F7', secondary: '#EC4899', bg: '#2e1065', glassBorder: 'rgba(168, 85, 247, 0.1)' },
  Default: { primary: '#0EA5E9', secondary: '#8B5CF6', bg: '#020617', glassBorder: 'rgba(56, 189, 248, 0.1)' }
};

// --- 2. CONNECTION PARSER ---
const parseConnectionDetails = (connectionString) => {
  const defaultProfile = { type: 'PostgreSQL', theme: THEMES.PostgreSQL, name: 'prod_db', host: 'localhost', user: 'admin' };
  
  if (!connectionString) return defaultProfile;
  const uri = connectionString.trim();
  
  let type = 'Unknown';
  let theme = THEMES.Default;

  if (uri.startsWith('postgres')) { type = 'PostgreSQL'; theme = THEMES.PostgreSQL; }
  else if (uri.startsWith('mysql')) { type = 'MySQL'; theme = THEMES.MySQL; }
  else if (uri.startsWith('sqlite')) { type = 'SQLite'; theme = THEMES.SQLite; }
  else if (uri.startsWith('oracle')) { type = 'Oracle'; theme = THEMES.Oracle; }
  else if (uri.startsWith('mssql')) { type = 'SQL Server'; theme = THEMES.SQLServer; }

  // Regex to extract user, host, and dbname
  const regex = /^(?:[^:]+):\/\/(?:(?<user>[^:@]+)(?::(?<password>[^@]+))?@)?(?<host>[^:\/]+)(?::(?<port>\d+))?(?:\/(?<database>[^?]+))?/;
  const match = uri.match(regex);

  if (match && match.groups) {
    return {
      type,
      theme,
      name: match.groups.database || 'Main_DB',
      host: match.groups.host || 'localhost',
      user: match.groups.user || 'admin'
    };
  }
  
  // Fallback for simple strings like "sqlite:///db.sqlite"
  if (type === 'SQLite') return { type, theme, name: 'local.db', host: 'FileSystem', user: 'system' };

  return { ...defaultProfile, type, theme };
};

// --- 3. MOCK DATA ---
const mockConnections = [
  { pid: 14023, user: 'postgres', db: 'production', app: 'pgAdmin 4', state: 'active', duration: '00:00:04', query: 'SELECT * FROM pg_stat_activity', ip: '192.168.1.5' },
  { pid: 14099, user: 'app_user', db: 'production', app: 'NodeJS', state: 'idle', duration: '00:15:23', query: '-- idle connection', ip: '10.0.0.12' },
];
const mockErrorLogs = [
  { id: 101, type: 'Timeout', timestamp: '10:42', user: 'svc', detail: 'Client closed connection' },
  { id: 102, type: 'Deadlock', timestamp: '10:45', user: 'worker', detail: 'Process 14022 waits for ShareLock' }
];
const apiQueryData = [
  { id: 'api_1', method: 'GET', endpoint: '/stats', avg_duration: 320, calls_per_min: 850, db_time_pct: 85, queries: [{ sql: 'SELECT count(*)', calls: 1, duration: 120 }], ai_insight: 'Heavy aggregation.' }
];
const missingIndexesData = [{ id: 1, table: 'orders', column: 'customer_id', impact: 'Critical', scans: '1.2M', improvement: '94%' }];
const unusedIndexesData = [{ id: 1, table: 'users', indexName: 'idx_old', size: '450MB', lastUsed: '2023-11-04' }];
const lowHitRatioData = [{ id: 1, table: 'logs', ratio: 12, total_scans: '5.4M', problem_query: "SELECT * FROM logs WHERE msg LIKE '%error%'", recommendation: 'Use Full Text Search.' }];

// --- 4. REUSABLE UI COMPONENTS ---

const ChartDefs = ({ theme }) => (
  <svg style={{ height: 0, width: 0, position: 'absolute' }}>
    <defs>
      <filter id="neonGlow" height="300%" width="300%" x="-75%" y="-75%">
        <feGaussianBlur stdDeviation="5" result="coloredBlur" />
        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={theme?.primary || '#38bdf8'} stopOpacity={0.4} />
        <stop offset="100%" stopColor={theme?.primary || '#38bdf8'} stopOpacity={0} />
      </linearGradient>
      <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={theme?.secondary || '#818cf8'} stopOpacity={0.4} />
        <stop offset="100%" stopColor={theme?.secondary || '#818cf8'} stopOpacity={0} />
      </linearGradient>
      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={theme?.secondary || '#818cf8'} stopOpacity={1} />
        <stop offset="100%" stopColor={theme?.secondary || '#818cf8'} stopOpacity={0.3} />
      </linearGradient>
    </defs>
  </svg>
);

const GlassCard = ({ children, title, rightNode, style, theme }) => (
  <div style={{
    background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(12px)', borderRadius: 16, 
    border: `1px solid ${theme?.glassBorder || 'rgba(255,255,255,0.1)'}`, 
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)', padding: '24px', 
    display: 'flex', flexDirection: 'column', height: '100%', 
    position: 'relative', overflow: 'hidden', ...style
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, zIndex: 2 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>{title}</h3>
      {rightNode}
    </div>
    <div style={{ flex: 1, minHeight: 0, position: 'relative', zIndex: 1 }}>{children}</div>
    <div style={{ position: 'absolute', top: -60, right: -60, width: 140, height: 140, background: `radial-gradient(circle, ${theme?.primary || '#38bdf8'}15 0%, transparent 70%)`, pointerEvents: 'none' }} />
  </div>
);

const MetricCard = ({ icon: Icon, title, value, unit, subtitle, color, onClick, active, sparkData, theme }) => (
  <div
    onClick={onClick}
    style={{
      background: active 
        ? `linear-gradient(180deg, ${color}20 0%, ${color}10 100%)`
        : 'linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
      borderRadius: 12,
      border: active ? `1px solid ${color}` : `1px solid ${theme?.glassBorder || '#333'}`,
      padding: '20px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12,
      cursor: onClick ? 'pointer' : 'default', transition: 'all 0.3s', transform: active ? 'translateY(-2px)' : 'none', 
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
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
    <div>
      <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: '#F8FAFC', fontFamily: 'monospace' }}>{value}</span>
        {unit && <span style={{ fontSize: 12, color: '#94A3B8' }}>{unit}</span>}
      </div>
      {subtitle && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>{subtitle}</div>}
    </div>
  </div>
);

const NeonProgressBar = ({ value, max, color }) => (
  <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
    <div style={{ width: `${Math.min((value / max) * 100, 100)}%`, height: '100%', background: color, borderRadius: 4, boxShadow: `0 0 10px ${color}80`, transition: 'width 0.5s ease' }} />
  </div>
);

const ResourceGauge = ({ label, value, color }) => (
  <div style={{ position: 'relative', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <ResponsiveContainer width="100%" height="100%">
      <RadialBarChart innerRadius="70%" outerRadius="100%" barSize={10} data={[{ value, fill: color }]} startAngle={180} endAngle={0}>
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        <RadialBar background clockWise dataKey="value" cornerRadius={10} />
      </RadialBarChart>
    </ResponsiveContainer>
    <div style={{ position: 'absolute', top: '60%', transform: 'translateY(-50%)', textAlign: 'center' }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', fontFamily: 'monospace' }}>{value}%</div>
      <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase' }}>{label}</div>
    </div>
  </div>
);

const AIAgentView = ({ type, data }) => {
  if (!data) return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', flexDirection: 'column', gap: 12, textAlign: 'center', opacity: 0.6 }}>
      <Terminal size={24} />
      <p style={{ fontSize: 13 }}>Select an item to analyze.</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>
      <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Zap size={14} color="white" fill="white" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#a855f7' }}>AI ANALYSIS</span>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: '#F8FAFC', margin: 0 }}>
          {type === 'api' ? data.ai_insight : (data.recommendation || 'Analysis complete.')}
        </p>
      </div>
      <div style={{ flex: 1, background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b', padding: 16, overflow: 'hidden' }}>
         <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'monospace', marginBottom: 10 }}>DETAILS / SQL</div>
         <div style={{ color: '#a5b4fc', fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6, overflowY: 'auto', maxHeight: '100%' }}>
            {type === 'api' ? data.queries.map((q, i) => <div key={i} style={{ marginBottom: 10 }}>{q.sql}</div>) : (data.problem_query || "Query plan unavailable.")}
         </div>
      </div>
    </div>
  );
};

const EmptyState = ({ icon: Icon, text }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8', gap: 16, opacity: 0.7 }}>
    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={32} />
    </div>
    <div>{text}</div>
  </div>
);

const LoginScreen = ({ onLogin }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userId && password) {
      onLogin(userId);
    }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F8FAFC' }}>
      <div style={{ width: 400, padding: 40, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(20px)', borderRadius: 24, border: '1px solid rgba(56, 189, 248, 0.2)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #0EA5E9, #8B5CF6)', borderRadius: 16, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(14, 165, 233, 0.3)' }}>
            <Database size={32} color="white" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700 }}>DB Monitor</h2>
          <p style={{ color: '#94A3B8', fontSize: 14 }}>Enter credentials to access demo</p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 8, display: 'block' }}>USER ID</label>
            <div style={{ position: 'relative' }}>
              <UserIcon size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#64748B' }} />
              <input 
                type="text" value={userId} onChange={(e) => setUserId(e.target.value)} required
                style={{ width: '100%', padding: '12px 12px 12px 40px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: 'white', outline: 'none' }}
                placeholder="admin"
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 8, display: 'block' }}>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#64748B' }} />
              <input 
                type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                style={{ width: '100%', padding: '12px 12px 12px 40px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: 'white', outline: 'none' }}
                placeholder="••••••"
              />
            </div>
          </div>
          
          <button type="submit" style={{ marginTop: 16, padding: '14px', background: '#0EA5E9', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
            <LogIn size={18} /> Access Dashboard
          </button>
        </form>
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: '#64748B' }}>
          Secure Connection • 256-bit Encryption
        </div>
      </div>
    </div>
  );
};

// --- 5. MAIN DASHBOARD ---
const UniversalDBMonitor = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  
  // Dashboard States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectionString, setConnectionString] = useState('postgresql://scott:tiger@localhost:5432/prod_db');
  
  // Adaptive State (Database Profile)
  const [dbProfile, setDbProfile] = useState({
    type: 'PostgreSQL',
    name: 'demo_db',
    host: 'localhost',
    user: 'demo',
    theme: THEMES.PostgreSQL
  });
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Drill Down States
  const [indexViewMode, setIndexViewMode] = useState(null); 
  const [selectedIndexItem, setSelectedIndexItem] = useState(null); 
  const [reliabilityViewMode, setReliabilityViewMode] = useState(null); 
  const [selectedReliabilityItem, setSelectedReliabilityItem] = useState(null);
  const [selectedApiItem, setSelectedApiItem] = useState(null);

  // Data States
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

  // Initialization
  useEffect(() => {
    setLast30Days(Array.from({ length: 30 }, (_, i) => ({
      date: new Date(new Date().setDate(new Date().getDate() - (29 - i))).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      qps: Math.floor(Math.random() * 800) + 1200,
      tps: Math.floor(Math.random() * 400) + 600,
      avgQuery: Math.random() * 30 + 30,
      errors: Math.floor(Math.random() * 15)
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
      { type: 'Connection Timeout', count: 145, percentage: 38 },
      { type: 'Deadlock Detected', count: 89, percentage: 23 },
      { type: 'Query Timeout', count: 67, percentage: 17 },
    ]);

    setRecentAlerts([
      { severity: 'critical', message: 'CPU usage exceeded 90%', time: '5m ago' },
      { severity: 'warning', message: 'High slow queries detected', time: '12m ago' },
    ]);

    setSparklineData(Array.from({ length: 20 }, () => ({ value: Math.random() * 100 })));
  }, []);

  // Live Updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        qps: Math.floor(Math.random() * 600) + 1400,
        tps: Math.floor(Math.random() * 300) + 700,
        avgQueryTime: 30 + Math.random() * 40,
        cpuUsage: 30 + Math.random() * 30,
        diskIOReadRate: Math.floor(Math.random() * 100) + 200,
      }));
      setSparklineData(prev => [...prev.slice(1), { value: Math.random() * 100 }]);
    }, 5000); 
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleConnect = () => {
    // Parse the connection string
    const profile = parseConnectionDetails(connectionString);
    setDbProfile(profile);
    setIsDemoMode(false); // Switch to Live Mode
    setShowConnectModal(false);
    // Reset Data for "Live" look
    setMetrics(prev => ({ ...prev, activeConnections: Math.floor(Math.random() * 50) + 20, qps: 3500 })); 
  };

  const formatUptime = seconds => `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: 8, padding: 8, fontSize: 11, color: '#e5e7eb' }}>
        <div style={{ marginBottom: 4 }}>{label}</div>
        {payload.map(p => <div key={p.dataKey}>{p.name || p.dataKey}: {p.value}</div>)}
      </div>
    );
  };

  // --- TAB RENDERERS ---
  const OverviewTab = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: 24 }}>
      <GlassCard title="Cluster Activity" theme={dbProfile.theme}>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={last30Days} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <ChartDefs theme={dbProfile.theme} />
            <CartesianGrid strokeDasharray="3 3" stroke={THEMES.Default.textMuted} vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: THEMES.Default.textMuted }} axisLine={false} tickLine={false} dy={10} />
            <YAxis tick={{ fontSize: 11, fill: THEMES.Default.textMuted }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="qps" stroke={dbProfile.theme.primary} strokeWidth={3} fill="url(#primaryGradient)" filter="url(#neonGlow)" name="QPS" />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <MetricCard icon={Clock} title="Avg Query" value={metrics.avgQueryTime.toFixed(1)} unit="ms" color={THEMES.Default.warning} sparkData={sparklineData} theme={dbProfile.theme} />
        <MetricCard icon={Zap} title="Current QPS" value={metrics.qps} color={dbProfile.theme.primary} theme={dbProfile.theme} />
        <MetricCard icon={Cpu} title="CPU Load" value={metrics.cpuUsage.toFixed(1)} unit="%" color={THEMES.Default.danger} theme={dbProfile.theme} />
      </div>
    </div>
  );

  const ReliabilityTab = () => (
    !reliabilityViewMode ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
            <GlassCard title="Connections" theme={dbProfile.theme}>
                <div onClick={() => setReliabilityViewMode('active')} style={{ cursor: 'pointer', marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', marginBottom: 8 }}><span>Active</span><span>{metrics.activeConnections}</span></div>
                    <NeonProgressBar value={metrics.activeConnections} max={100} color={dbProfile.theme.primary} />
                </div>
                <div onClick={() => setReliabilityViewMode('idle')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', marginBottom: 8 }}><span>Idle</span><span>{metrics.idleConnections}</span></div>
                    <NeonProgressBar value={metrics.idleConnections} max={100} color={THEMES.Default.textMuted} />
                </div>
            </GlassCard>
            <GlassCard title="Errors" theme={dbProfile.theme}>
                {topErrors.map((err, i) => (
                    <div key={i} onClick={() => setReliabilityViewMode('errors')} style={{ cursor: 'pointer', marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: 12, marginBottom: 4 }}><span>{err.type}</span><span>{err.percentage}%</span></div>
                        <NeonProgressBar value={err.percentage} max={100} color={THEMES.Default.danger} />
                    </div>
                ))}
            </GlassCard>
        </div>
    ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <GlassCard title="List" theme={dbProfile.theme} rightNode={<button onClick={() => { setReliabilityViewMode(null); setSelectedReliabilityItem(null); }} style={{ background: 'transparent', border: 'none', color: '#ccc', cursor: 'pointer' }}>Back</button>}>
                {(reliabilityViewMode === 'active' ? mockConnections : reliabilityViewMode === 'errors' ? mockErrorLogs : mockConnections).map((item, i) => (
                    <div key={i} style={{ padding: 12, borderBottom: '1px solid #333', color: '#ccc', cursor: 'pointer' }} onClick={() => setSelectedReliabilityItem(item)}>
                        {item.pid || item.type}
                    </div>
                ))}
            </GlassCard>
            <GlassCard title="Details" theme={dbProfile.theme}>
                {selectedReliabilityItem ? <div style={{ color: '#fff', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{JSON.stringify(selectedReliabilityItem, null, 2)}</div> : <EmptyState icon={Search} text="Select Item" />}
            </GlassCard>
        </div>
    )
  );

  const IndexesTab = () => (
    !indexViewMode ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            <MetricCard icon={TrendingUp} title="Hit Ratio" value={metrics.indexHitRatio} unit="%" color={dbProfile.theme.primary} theme={dbProfile.theme} onClick={() => setIndexViewMode('hitRatio')} />
            <MetricCard icon={AlertTriangle} title="Missing" value={metrics.missingIndexes} color={THEMES.Default.warning} theme={dbProfile.theme} onClick={() => setIndexViewMode('missing')} />
            <MetricCard icon={Layers} title="Unused" value={metrics.unusedIndexes} color={THEMES.Default.danger} theme={dbProfile.theme} onClick={() => setIndexViewMode('unused')} />
        </div>
    ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <GlassCard title="List" theme={dbProfile.theme} rightNode={<button onClick={() => { setIndexViewMode(null); setSelectedIndexItem(null); }} style={{ background: 'transparent', border: 'none', color: '#ccc', cursor: 'pointer' }}>Back</button>}>
                {(indexViewMode === 'hitRatio' ? lowHitRatioData : indexViewMode === 'missing' ? missingIndexesData : unusedIndexesData).map((item, i) => (
                    <div key={i} onClick={() => setSelectedIndexItem(item)} style={{ padding: 12, borderBottom: '1px solid #333', color: '#ccc', cursor: 'pointer' }}>{item.table}</div>
                ))}
            </GlassCard>
            <GlassCard title="AI Agent" theme={dbProfile.theme}>
                <AIAgentView type={indexViewMode} data={selectedIndexItem} />
            </GlassCard>
        </div>
    )
  );

  const ApiQueriesTab = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, height: 500 }}>
        <GlassCard title="Endpoints" theme={dbProfile.theme}>
            {apiQueryData.map(api => (
                <div key={api.id} onClick={() => setSelectedApiItem(api)} style={{ padding: 12, borderBottom: '1px solid #333', cursor: 'pointer', color: '#fff' }}>
                    <span style={{ fontWeight: 'bold', color: dbProfile.theme.primary }}>{api.method}</span> {api.endpoint}
                </div>
            ))}
        </GlassCard>
        <GlassCard title="Trace" theme={dbProfile.theme}>
            <AIAgentView type="api" data={selectedApiItem} />
        </GlassCard>
    </div>
  );

  const ResourcesTab = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        <GlassCard title="CPU" theme={dbProfile.theme}><ResourceGauge label="CPU Usage" value={Math.round(metrics.cpuUsage)} color={THEMES.Default.danger} /></GlassCard>
        <GlassCard title="Memory" theme={dbProfile.theme}><ResourceGauge label="Memory" value={Math.round(metrics.memoryUsage)} color={dbProfile.theme.primary} /></GlassCard>
        <GlassCard title="Disk IO" theme={dbProfile.theme}>
            <div style={{ color: '#e5e7eb', fontSize: 12, lineHeight: 1.6 }}>
                <div>Read: {metrics.diskIOReadRate} MB/s</div>
                <div>Write: {metrics.diskIOWriteRate} MB/s</div>
                <div>Latency: {metrics.diskIOLatency} ms</div>
            </div>
        </GlassCard>
    </div>
  );

  const PerformanceTab = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <GlassCard title="Query Time Distribution" theme={dbProfile.theme}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={queryTimeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke={THEMES.Default.textMuted} vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: THEMES.Default.textMuted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: THEMES.Default.textMuted }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="url(#barGradient)" stroke={dbProfile.theme.secondary} strokeWidth={1} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
        <GlassCard title="Uptime & SLA" theme={dbProfile.theme}>
            <div style={{ color: '#e5e7eb', fontSize: 12, lineHeight: 1.8 }}>
                <div>Uptime: {formatUptime(metrics.uptime)}</div>
                <div>Availability: {metrics.availability}%</div>
                <div>Incidents: {metrics.downtimeIncidents}</div>
            </div>
        </GlassCard>
    </div>
  );

  const ConnectionModal = () => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <GlassCard title="Connect Database" theme={dbProfile.theme} style={{ width: 600, background: '#0f172a' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Format Guide (Copy & Paste)</div>
          <div style={{ background: '#1e293b', padding: 12, borderRadius: 8, fontFamily: 'monospace', fontSize: 11, color: '#ccc', border: '1px solid #333', lineHeight: 1.6 }}>
            <div style={{ cursor: 'pointer', marginBottom: 4 }} onClick={() => setConnectionString('postgresql://user:pass@host:5432/db')}>PostgreSQL: postgresql://user:pass@host:5432/db</div>
            <div style={{ cursor: 'pointer', marginBottom: 4 }} onClick={() => setConnectionString('mysql://user:pass@host:3306/db')}>MySQL: mysql://user:pass@host:3306/db</div>
            <div style={{ cursor: 'pointer', marginBottom: 4 }} onClick={() => setConnectionString('sqlite:///path/to/db.sqlite')}>SQLite: sqlite:///path/to/db.sqlite</div>
          </div>
        </div>
        <input type="text" value={connectionString} onChange={e => setConnectionString(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 20, background: '#1e293b', border: '1px solid #333', color: '#fff', fontFamily: 'monospace' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={() => setShowConnectModal(false)} style={{ padding: '8px 16px', borderRadius: 6, background: 'transparent', border: '1px solid #555', color: '#ccc', cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleConnect} style={{ padding: '8px 16px', borderRadius: 6, background: dbProfile.theme.primary, border: 'none', color: '#fff', cursor: 'pointer' }}>Connect</button>
        </div>
      </GlassCard>
    </div>
  );

  // --- RENDER ---
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: dbProfile.theme.bg, color: THEMES.Default.textMain, fontFamily: 'sans-serif', overflow: 'hidden' }}>
        {showConnectModal && <ConnectionModal />}
        
        <aside style={{ width: isSidebarOpen ? 260 : 70, background: 'rgba(0,0,0,0.3)', borderRight: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', transition: 'width 0.3s', zIndex: 20 }}>
            <div style={{ padding: 20, display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {isSidebarOpen ? (
                  <div>
                    <span style={{ fontWeight: 'bold', display: 'block' }}>{dbProfile.name}</span>
                    <span style={{ fontSize: 11, color: '#94A3B8' }}>{dbProfile.type} • {dbProfile.host}</span>
                  </div>
                ) : <Database color={dbProfile.theme.primary} />}
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
            </div>
            {isSidebarOpen && (
              <div style={{ padding: '0 20px', marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>STATUS</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: isDemoMode ? '#F59E0B' : '#10B981', fontWeight: 600 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: isDemoMode ? '#F59E0B' : '#10B981', boxShadow: `0 0 10px ${isDemoMode ? '#F59E0B' : '#10B981'}` }} />
                  {isDemoMode ? 'Demo Data' : 'Live Connection'}
                </div>
              </div>
            )}
            <div style={{ flex: 1, padding: 10 }}>
                {[{ id: 'overview', icon: Activity, label: 'Overview' }, { id: 'performance', icon: Zap, label: 'Performance' }, { id: 'resources', icon: HardDrive, label: 'Resources' }, { id: 'reliability', icon: CheckCircle, label: 'Reliability' }, { id: 'indexes', icon: Layers, label: 'Indexes' }, { id: 'api', icon: Network, label: 'API Tracing' }].map(item => (
                    <div key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, cursor: 'pointer', color: activeTab === item.id ? dbProfile.theme.primary : '#ccc', background: activeTab === item.id ? 'rgba(255,255,255,0.05)' : 'transparent', borderRadius: 8, marginBottom: 4, justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}>
                        <item.icon size={20} />
                        {isSidebarOpen && <span>{item.label}</span>}
                    </div>
                ))}
            </div>
            <div style={{ padding: 10 }}>
                <button onClick={() => setShowConnectModal(true)} style={{ width: '100%', padding: 12, display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'flex-start' : 'center', gap: 10, background: 'rgba(255,255,255,0.05)', border: 'none', color: '#ccc', cursor: 'pointer', borderRadius: 8 }}>
                    <Settings size={20} /> {isSidebarOpen && "Connection"}
                </button>
            </div>
        </aside>

        <main style={{ flex: 1, padding: 30, overflowY: 'auto' }}>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 30 }}>{activeTab === 'api' ? 'API Tracing' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Dashboard</h1>
            <ChartDefs theme={dbProfile.theme} />
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'resources' && <ResourcesTab />}
            {activeTab === 'reliability' && <ReliabilityTab />}
            {activeTab === 'indexes' && <IndexesTab />}
            {activeTab === 'api' && <ApiQueriesTab />}
            {activeTab === 'performance' && <PerformanceTab />}
        </main>
    </div>
  );
};

export default UniversalDBMonitor;