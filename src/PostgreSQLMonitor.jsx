import React, { useState, useEffect } from 'react';
import {
  Activity, Database, HardDrive, Zap, Clock, AlertTriangle,
  TrendingUp, TrendingDown, Server, Lock, AlertCircle, CheckCircle,
  XCircle, Search, Cpu, Layers, Terminal, PlusCircle, Trash2,
  Power, RefreshCw, ChevronLeft, ChevronRight, User as UserIcon, Globe,
  Menu, Code, FileText, Network, ArrowRight, Settings, Plug
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';

// --- THEME CONSTANTS (Adaptive) ---
const THEMES = {
  PostgreSQL: { primary: '#0EA5E9', secondary: '#8B5CF6', bg: '#020617', glassBorder: 'rgba(56, 189, 248, 0.1)' }, // Blue/Purple
  MySQL: { primary: '#F59E0B', secondary: '#0EA5E9', bg: '#0f172a', glassBorder: 'rgba(245, 158, 11, 0.1)' },      // Orange/Blue
  SQLite: { primary: '#10B981', secondary: '#64748B', bg: '#052e16', glassBorder: 'rgba(16, 185, 129, 0.1)' },     // Green/Slate
  Oracle: { primary: '#EF4444', secondary: '#F59E0B', bg: '#2b0a0a', glassBorder: 'rgba(239, 68, 68, 0.1)' },     // Red/Orange
  SQLServer: { primary: '#A855F7', secondary: '#EC4899', bg: '#2e1065', glassBorder: 'rgba(168, 85, 247, 0.1)' },  // Purple/Pink
  Default: { primary: '#0EA5E9', secondary: '#8B5CF6', bg: '#020617', glassBorder: 'rgba(56, 189, 248, 0.1)' }
};

// --- MOCK DATA ---
const mockConnections = [
  { pid: 14023, user: 'postgres', db: 'production', app: 'pgAdmin 4', state: 'active', duration: '00:00:04', query: 'SELECT * FROM pg_stat_activity WHERE state = \'active\';', ip: '192.168.1.5' },
  { pid: 14099, user: 'app_user', db: 'production', app: 'NodeJS Backend', state: 'idle in transaction', duration: '00:15:23', query: 'UPDATE orders SET status = \'processing\' WHERE id = 4591;', ip: '10.0.0.12' },
  { pid: 15102, user: 'analytics', db: 'warehouse', app: 'Metabase', state: 'active', duration: '00:42:10', query: 'SELECT region, SUM(amount) FROM sales GROUP BY region ORDER BY 2 DESC;', ip: '10.0.0.8' },
  { pid: 15333, user: 'postgres', db: 'postgres', app: 'psql', state: 'idle', duration: '01:20:00', query: '-- idle connection', ip: 'local' },
];

const mockErrorLogs = [
  { id: 101, type: 'Connection Timeout', timestamp: '10:42:15', user: 'app_svc', db: 'production', query: 'SELECT * FROM large_table...', detail: 'Client closed connection' },
  { id: 102, type: 'Deadlock Detected', timestamp: '10:45:22', user: 'worker_01', db: 'warehouse', query: 'UPDATE inventory SET stock...', detail: 'Process 14022 waits for ShareLock' },
];

const apiQueryData = [
  { 
    id: 'api_1', method: 'GET', endpoint: '/api/v1/dashboard', avg_duration: 320, calls_per_min: 850, db_time_pct: 85,
    queries: [{ sql: 'SELECT count(*) FROM orders', calls: 1, duration: 120 }, { sql: 'SELECT sum(total) FROM payments', calls: 1, duration: 145 }],
    ai_insight: 'Heavy aggregation on payments table. Consider creating a materialized view.'
  },
  { 
    id: 'api_2', method: 'POST', endpoint: '/api/v1/orders', avg_duration: 180, calls_per_min: 120, db_time_pct: 60,
    queries: [{ sql: 'BEGIN TRANSACTION', calls: 1, duration: 2 }, { sql: 'SELECT stock FROM products FOR UPDATE', calls: 5, duration: 45 }],
    ai_insight: 'Detected N+1 Query issue. The product stock check runs 5 times. Batch this.'
  }
];

const missingIndexesData = [
  { id: 1, table: 'orders', column: 'customer_id', impact: 'Critical', scans: '1.2M', improvement: '94%' },
  { id: 2, table: 'transactions', column: 'created_at', impact: 'High', scans: '850k', improvement: '98%' },
];

const unusedIndexesData = [
  { id: 1, table: 'users', indexName: 'idx_users_old', size: '450MB', lastUsed: '2023-11-04' },
];

// --- GLOBAL SVG FILTERS ---
const ChartDefs = ({ theme }) => (
  <svg style={{ height: 0, width: 0, position: 'absolute' }}>
    <defs>
      <filter id="neonGlow" height="300%" width="300%" x="-75%" y="-75%">
        <feGaussianBlur stdDeviation="5" result="coloredBlur" />
        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={theme.primary} stopOpacity={0.4} />
        <stop offset="100%" stopColor={theme.primary} stopOpacity={0} />
      </linearGradient>
      <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={theme.secondary} stopOpacity={0.4} />
        <stop offset="100%" stopColor={theme.secondary} stopOpacity={0} />
      </linearGradient>
      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={theme.secondary} stopOpacity={1} />
        <stop offset="100%" stopColor={theme.secondary} stopOpacity={0.3} />
      </linearGradient>
    </defs>
  </svg>
);

// --- REUSABLE COMPONENTS ---
const GlassCard = ({ children, title, rightNode, style, theme }) => (
  <div style={{
    background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(12px)', borderRadius: 16, 
    border: `1px solid ${theme.glassBorder}`, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)', 
    padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', 
    position: 'relative', overflow: 'hidden', ...style
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, zIndex: 2 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>{title}</h3>
      {rightNode}
    </div>
    <div style={{ flex: 1, minHeight: 0, position: 'relative', zIndex: 1 }}>{children}</div>
    <div style={{ position: 'absolute', top: -60, right: -60, width: 140, height: 140, background: `radial-gradient(circle, ${theme.primary}15 0%, transparent 70%)`, pointerEvents: 'none' }} />
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
      border: active ? `1px solid ${color}` : `1px solid ${theme.glassBorder}`,
      padding: '20px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12,
      cursor: onClick ? 'pointer' : 'default', transition: 'all 0.3s', transform: active ? 'translateY(-2px)' : 'none', boxShadow: active ? `0 10px 25px -5px ${color}30` : 'none'
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

const AIAgentView = ({ type, data, theme }) => {
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
         <div style={{ color: '#a5b4fc', fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6 }}>
            {type === 'api' ? data.queries.map((q, i) => <div key={i} style={{ marginBottom: 10 }}>{q.sql}</div>) : (data.problem_query || "Query plan unavailable.")}
         </div>
      </div>
    </div>
  );
};

// --- LOGIC: DETECT DATABASE ---
const detectDatabaseType = (connectionString) => {
  if (!connectionString) return { type: 'PostgreSQL', theme: THEMES.PostgreSQL };
  const uri = connectionString.toLowerCase().trim();
  if (uri.startsWith('postgres')) return { type: 'PostgreSQL', theme: THEMES.PostgreSQL };
  if (uri.startsWith('mysql')) return { type: 'MySQL', theme: THEMES.MySQL };
  if (uri.startsWith('sqlite')) return { type: 'SQLite', theme: THEMES.SQLite };
  if (uri.startsWith('oracle')) return { type: 'Oracle', theme: THEMES.Oracle };
  if (uri.startsWith('mssql')) return { type: 'SQL Server', theme: THEMES.SQLServer };
  return { type: 'Unknown', theme: THEMES.Default };
};

// --- MAIN DASHBOARD ---
const UniversalDBMonitor = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectionString, setConnectionString] = useState('postgresql://scott:tiger@localhost:5432/prod_db');
  
  // Theme & DB State
  const [dbType, setDbType] = useState('PostgreSQL');
  const [currentTheme, setCurrentTheme] = useState(THEMES.PostgreSQL);

  // Drill Down States
  const [indexViewMode, setIndexViewMode] = useState(null); 
  const [selectedIndexItem, setSelectedIndexItem] = useState(null); 
  const [reliabilityViewMode, setReliabilityViewMode] = useState(null); 
  const [selectedReliabilityItem, setSelectedReliabilityItem] = useState(null);
  const [selectedApiItem, setSelectedApiItem] = useState(null);

  // --- DATA STATES (Must be defined here to prevent "Blank Page") ---
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

  // Data Init
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
      { type: 'Lock Wait Timeout', count: 45, percentage: 12 },
      { type: 'Constraint Violation', count: 38, percentage: 10 }
    ]);

    setRecentAlerts([
      { severity: 'critical', message: 'CPU usage exceeded 90%', time: '5m ago' },
      { severity: 'warning', message: 'High slow queries detected', time: '12m ago' },
    ]);

    setSparklineData(Array.from({ length: 20 }, () => ({ value: Math.random() * 100 })));
  }, []);

  // Update Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpuUsage: Math.floor(Math.random() * 40) + 20,
        qps: Math.floor(Math.random() * 500) + 1000
      }));
      setSparklineData(prev => [...prev.slice(1), { value: Math.random() * 100 }]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = () => {
    const { type, theme } = detectDatabaseType(connectionString);
    setDbType(type);
    setCurrentTheme(theme);
    setShowConnectModal(false);
  };

  const formatUptime = seconds => `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;

  // --- TABS ---
  const OverviewTab = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: 24 }}>
      <GlassCard title="Cluster Activity" theme={currentTheme}>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={last30Days} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <ChartDefs theme={currentTheme} />
            <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: THEME.textMuted }} axisLine={false} tickLine={false} dy={10} />
            <YAxis tick={{ fontSize: 11, fill: THEME.textMuted }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="qps" stroke={currentTheme.primary} strokeWidth={3} fill="url(#primaryGradient)" filter="url(#neonGlow)" />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <MetricCard icon={Zap} title="QPS" value={metrics.qps} color={currentTheme.primary} theme={currentTheme} sparkData={sparklineData} />
        <MetricCard icon={Cpu} title="CPU" value={metrics.cpuUsage} unit="%" color={currentTheme.secondary} theme={currentTheme} />
      </div>
    </div>
  );

  const ResourcesTab = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        <GlassCard title="CPU" theme={currentTheme}><ResourceGauge label="Load" value={metrics.cpuUsage} color={currentTheme.primary} /></GlassCard>
        <GlassCard title="Memory" theme={currentTheme}><ResourceGauge label="RAM" value={metrics.memoryUsage} color={currentTheme.secondary} /></GlassCard>
        <GlassCard title="Disk" theme={currentTheme}><ResourceGauge label="HDD" value={metrics.diskUsed} color={THEME.warning} /></GlassCard>
    </div>
  );

  const ReliabilityTab = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        <GlassCard title="Connections" theme={currentTheme}>
            <div onClick={() => setReliabilityViewMode('active')} style={{ cursor: 'pointer', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', marginBottom: 8 }}><span>Active</span><span>{metrics.activeConnections}</span></div>
                <NeonProgressBar value={metrics.activeConnections} max={100} color={currentTheme.primary} />
            </div>
            {reliabilityViewMode === 'active' && (
                <div style={{ marginTop: 20, height: 200, overflowY: 'auto' }}>
                    {mockConnections.map(c => <div key={c.pid} style={{ padding: 10, borderBottom: '1px solid #333', color: '#ccc', fontSize: 12 }}>{c.pid} - {c.app} ({c.state})</div>)}
                </div>
            )}
        </GlassCard>
    </div>
  );

  const ApiQueriesTab = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, height: 500 }}>
        <GlassCard title="Endpoints" theme={currentTheme}>
            {apiQueryData.map(api => (
                <div key={api.id} onClick={() => setSelectedApiItem(api)} style={{ padding: 12, borderBottom: '1px solid #333', cursor: 'pointer', color: '#fff' }}>
                    <span style={{ fontWeight: 'bold', color: currentTheme.primary }}>{api.method}</span> {api.endpoint}
                </div>
            ))}
        </GlassCard>
        <GlassCard title="Trace" theme={currentTheme}>
            <AIAgentView type="api" data={selectedApiItem} />
        </GlassCard>
    </div>
  );

  const ConnectionModal = () => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <GlassCard title="Connect Database" theme={currentTheme} style={{ width: 500, background: '#0f172a' }}>
        <input type="text" value={connectionString} onChange={e => setConnectionString(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 20, background: '#1e293b', border: '1px solid #333', color: '#fff' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={() => setShowConnectModal(false)} style={{ padding: '8px 16px', borderRadius: 6, background: 'transparent', border: '1px solid #555', color: '#ccc', cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleConnect} style={{ padding: '8px 16px', borderRadius: 6, background: currentTheme.primary, border: 'none', color: '#fff', cursor: 'pointer' }}>Connect</button>
        </div>
      </GlassCard>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: currentTheme.bg, color: THEME.textMain, fontFamily: 'sans-serif', overflow: 'hidden' }}>
        {showConnectModal && <ConnectionModal />}
        
        <aside style={{ width: isSidebarOpen ? 260 : 70, background: 'rgba(0,0,0,0.3)', borderRight: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', transition: 'width 0.3s' }}>
            <div style={{ padding: 20, display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {isSidebarOpen ? <span style={{ fontWeight: 'bold' }}>{dbType} Monitor</span> : <Database color={currentTheme.primary} />}
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
            </div>
            <div style={{ flex: 1, padding: 10 }}>
                {[{ id: 'overview', icon: Activity, label: 'Overview' }, { id: 'resources', icon: HardDrive, label: 'Resources' }, { id: 'reliability', icon: CheckCircle, label: 'Reliability' }, { id: 'api', icon: Network, label: 'API Tracing' }].map(item => (
                    <div key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, cursor: 'pointer', color: activeTab === item.id ? currentTheme.primary : '#ccc', background: activeTab === item.id ? 'rgba(255,255,255,0.05)' : 'transparent', borderRadius: 8, marginBottom: 4, justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}>
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
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 30 }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Dashboard</h1>
            <ChartDefs theme={currentTheme} />
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'resources' && <ResourcesTab />}
            {activeTab === 'reliability' && <ReliabilityTab />}
            {activeTab === 'api' && <ApiQueriesTab />}
        </main>
    </div>
  );
};

export default UniversalDBMonitor;