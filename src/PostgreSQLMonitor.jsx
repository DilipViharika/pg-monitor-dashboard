import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity, Database, HardDrive, Zap, Clock, AlertTriangle,
  TrendingUp, TrendingDown, Server, Lock, AlertCircle, CheckCircle,
  XCircle, Search, Cpu, Layers, Terminal, Power, RefreshCw, 
  ChevronLeft, ChevronRight, User as UserIcon, Globe, Network, 
  LogOut, Shield, Key, Mail, Chrome, UserPlus, Settings, Eye, Edit3, Trash2, X,
  Share2, ArrowRight, Radio
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';

// --- ADVANCED THEME SYSTEM (CYBERPUNK HUD) ---
const THEME = {
  bg: '#020617', // Deep Space
  bgSecondary: '#0f172a',
  glass: 'rgba(15, 23, 42, 0.7)',
  glassHover: 'rgba(30, 41, 59, 0.8)',
  glassBorder: 'rgba(56, 189, 248, 0.15)',
  textMain: '#F8FAFC',
  textMuted: '#94A3B8',
  primary: '#0EA5E9', // Cyan
  secondary: '#8B5CF6', // Violet
  success: '#10B981', // Neon Green
  warning: '#F59E0B', // Amber
  danger: '#F43F5E', // Neon Red
  grid: '#1E293B',
  ai: '#d946ef', // Magenta
  gradientPrimary: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)',
  gradientDanger: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)'
};

// --- LIVE DATA SIMULATOR HOOK ---
const useLiveSimulator = () => {
  const [metrics, setMetrics] = useState({
    qps: 1840,
    activeConnections: 45,
    cpuUsage: 42,
    memoryUsage: 64,
    diskIORead: 245,
    diskIOWrite: 128,
    uptime: 2592000,
    readWriteRatio: 68,
    maxConnections: 100,
    idleConnections: 23,
    availability: 99.99,
    downtimeIncidents: 0,
    errorRate: 0.2,
    deadlockCount: 0,
    selectPerSec: 1200,
    insertPerSec: 300,
    updatePerSec: 100,
    deletePerSec: 50
  });
  const [chartData, setChartData] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Initial History
    const history = Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - (20 - i) * 1000).toLocaleTimeString(),
      qps: 1500 + Math.random() * 500,
      latency: 20 + Math.random() * 30,
      cpu: 40 + Math.random() * 20
    }));
    setChartData(history);

    const interval = setInterval(() => {
      // 1. Tick Metrics
      setMetrics(prev => ({
        ...prev,
        qps: Math.floor(prev.qps + (Math.random() - 0.5) * 100),
        activeConnections: Math.max(0, Math.floor(prev.activeConnections + (Math.random() - 0.5) * 5)),
        idleConnections: Math.max(0, Math.floor(prev.idleConnections + (Math.random() - 0.5) * 3)),
        cpuUsage: Math.min(100, Math.max(0, prev.cpuUsage + (Math.random() - 0.5) * 5)),
        memoryUsage: Math.min(100, Math.max(0, prev.memoryUsage + (Math.random() - 0.5) * 2)),
        diskIORead: Math.floor(prev.diskIORead + (Math.random() - 0.5) * 20),
        diskIOWrite: Math.floor(prev.diskIOWrite + (Math.random() - 0.5) * 10),
        selectPerSec: Math.floor(prev.selectPerSec + (Math.random() - 0.5) * 50),
      }));

      // 2. Tick Charts
      setChartData(prev => {
        const newData = [...prev.slice(1), {
          time: new Date().toLocaleTimeString(),
          qps: metrics.qps + Math.random() * 100,
          latency: 20 + Math.random() * 40,
          cpu: metrics.cpuUsage
        }];
        return newData;
      });

      // 3. Tick Logs (Randomly)
      if (Math.random() > 0.9) {
        const types = ['INFO', 'WARN', 'ERROR'];
        const msgs = ['Checkpoint complete', 'Long running query detected', 'Connection pool saturated', 'Autovacuum started', 'Replication lag increased'];
        const type = types[Math.floor(Math.random() * types.length)];
        const newLog = {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          type,
          message: msgs[Math.floor(Math.random() * msgs.length)]
        };
        setLogs(prev => [newLog, ...prev].slice(0, 50));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [metrics.qps]);

  return { metrics, chartData, logs };
};

// --- MOCK STATIC DATA ---
const mockConnections = [
  { pid: 14023, user: 'postgres', db: 'production', app: 'pgAdmin 4', state: 'active', duration: '00:00:04', query: 'SELECT * FROM pg_stat_activity', ip: '192.168.1.5' },
  { pid: 14099, user: 'app_user', db: 'production', app: 'NodeJS', state: 'idle', duration: '00:15:23', query: 'UPDATE orders SET status...', ip: '10.0.0.12' },
  { pid: 15102, user: 'analytics', db: 'warehouse', app: 'Metabase', state: 'active', duration: '00:42:10', query: 'SELECT region, SUM(amount)...', ip: '10.0.0.8' },
];

const mockErrorLogs = [
  { id: 101, type: 'Connection Timeout', timestamp: '10:42:15', user: 'app_svc', db: 'production', query: 'SELECT * FROM large_table...', detail: 'Client closed connection' },
  { id: 102, type: 'Deadlock Detected', timestamp: '10:45:22', user: 'worker_01', db: 'warehouse', query: 'UPDATE inventory SET stock...', detail: 'Process 14022 waits for ShareLock' },
];

const missingIndexesData = [
  { id: 1, table: 'orders', column: 'customer_id', impact: 'Critical', improvement: '94%', recommendation: 'Create B-Tree index concurrently.' },
  { id: 2, table: 'transactions', column: 'created_at', impact: 'High', improvement: '98%', recommendation: 'BRIN index recommended for time-series.' },
  { id: 3, table: 'audit_logs', column: 'user_id', impact: 'Medium', improvement: '75%', recommendation: 'Standard index recommended.' },
];

const unusedIndexesData = [
  { id: 1, table: 'users', indexName: 'idx_last_login_old', size: '450MB', lastUsed: '2023-11-04', recommendation: 'Safe to drop.' },
];

const lowHitRatioData = [
  { id: 1, table: 'large_audit_logs', ratio: 12, total_scans: '5.4M', problem_query: "SELECT * FROM logs...", recommendation: 'Use Trigram Index (pg_trgm).' },
];

const apiQueryData = [
    { 
        id: 'api_1', method: 'GET', endpoint: '/api/v1/dashboard/stats', avg: 320, calls: 850, db_time_pct: 85, ai_insight: 'Heavy aggregation on payments table.',
        queries: [
            { sql:'SELECT count(*) FROM orders', calls:1, duration:120, color: THEME.success },
            { sql:'SELECT sum(total) FROM payments', calls:1, duration:145, color: THEME.warning }
        ] 
    },
    { 
        id: 'api_2', method: 'POST', endpoint: '/api/v1/orders/create', avg: 180, calls: 120, db_time_pct: 60, ai_insight: 'Detected N+1 Query issue.',
        queries: [
            { sql:'BEGIN TRANSACTION', calls:1, duration:2, color: THEME.textMuted },
            { sql:'SELECT stock FROM products', calls:5, duration:45, color: THEME.primary },
            { sql:'INSERT INTO orders...', calls:1, duration:12, color: THEME.success },
            { sql:'COMMIT', calls:1, duration:5, color: THEME.textMuted }
        ] 
    },
];

// --- ADVANCED VISUALIZATION COMPONENTS ---

// 1. Topology Map (SVG with Animation)
const TopologyMap = () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <svg width="100%" height="220" viewBox="0 0 600 220">
        <defs>
          <filter id="glow"><feGaussianBlur stdDeviation="2.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <linearGradient id="linkGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor={THEME.primary} stopOpacity="0.6" /><stop offset="100%" stopColor={THEME.secondary} stopOpacity="0.6" /></linearGradient>
        </defs>
        
        {/* Connection Lines */}
        <path d="M 300 40 L 150 140" stroke="url(#linkGrad)" strokeWidth="2" strokeDasharray="5,5"><animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" /></path>
        <path d="M 300 40 L 450 140" stroke="url(#linkGrad)" strokeWidth="2" strokeDasharray="5,5"><animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" /></path>
        
        {/* Nodes */}
        <g transform="translate(270, 10)"><rect width="60" height="60" rx="10" fill={THEME.bgSecondary} stroke={THEME.primary} strokeWidth="2" filter="url(#glow)" /><Network x="15" y="15" color={THEME.primary} size={30} /></g>
        <g transform="translate(120, 140)"><circle cx="30" cy="30" r="30" fill={THEME.bgSecondary} stroke={THEME.success} strokeWidth="2" filter="url(#glow)" /><Database x="15" y="15" color={THEME.success} size={30} /><text x="30" y="75" textAnchor="middle" fill={THEME.textMain} fontSize="10">Primary</text></g>
        <g transform="translate(420, 140)"><circle cx="30" cy="30" r="30" fill={THEME.bgSecondary} stroke={THEME.secondary} strokeWidth="2" /><Database x="15" y="15" color={THEME.secondary} size={30} /><text x="30" y="75" textAnchor="middle" fill={THEME.textMain} fontSize="10">Replica</text></g>
      </svg>
    </div>
);

// 2. Query Waterfall (Gantt Chart for EXPLAIN ANALYZE)
const QueryWaterfall = ({ queries }) => {
    // Mock steps derived from the selected query
    const steps = queries || [
      { name: 'Parser', start: 0, duration: 2, color: THEME.textMuted },
      { name: 'Planner / Optimizer', start: 2, duration: 15, color: THEME.primary },
      { name: 'Index Scan', start: 17, duration: 45, color: THEME.success },
      { name: 'Heap Fetch', start: 62, duration: 30, color: THEME.secondary },
    ];
  
    return (
      <div style={{ width: '100%', padding: 10 }}>
        {steps.map((step, i) => {
            // Logic to position bars relatively
            const totalDuration = steps.reduce((acc, s) => acc + (s.duration || 0), 0);
            const widthPct = ((step.duration || 10) / (totalDuration || 100)) * 100;
            // Fake offset for demo
            const offsetPct = (i * 15); 
            
            return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ width: 140, fontSize: 11, color: THEME.textMuted, textAlign: 'right', paddingRight: 10, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{step.sql || step.name}</div>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', height: 24, borderRadius: 4, position: 'relative' }}>
                        <div style={{ 
                        position: 'absolute', 
                        left: `${offsetPct}%`, 
                        width: `${Math.max(widthPct, 2)}%`, 
                        height: '100%', 
                        background: step.color || THEME.primary, 
                        borderRadius: 4,
                        opacity: 0.8,
                        boxShadow: `0 0 10px ${step.color || THEME.primary}60`
                        }} />
                        <span style={{ position: 'absolute', left: `${offsetPct + widthPct + 2}%`, top: 4, fontSize: 10, color: '#fff' }}>
                        {step.duration}ms
                        </span>
                    </div>
                </div>
            )
        })}
      </div>
    );
};

// 3. Holographic Card (Advanced CSS)
const HoloCard = ({ children, title, color = THEME.primary, rightNode, style }) => (
  <div style={{
    background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(2, 6, 23, 0.8) 100%)',
    border: `1px solid ${color}30`, borderRadius: 16, padding: 24, position: 'relative', overflow: 'hidden',
    boxShadow: `0 0 0 1px ${color}10, 0 10px 30px -10px rgba(0,0,0,0.5)`, backdropFilter: 'blur(10px)',
    display: 'flex', flexDirection: 'column', height: '100%', ...style
  }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`, opacity: 0.5 }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexShrink: 0, zIndex: 2 }}>
      <h3 style={{ margin: 0, fontSize: 13, textTransform: 'uppercase', letterSpacing: '1px', color: color, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 6, height: 6, background: color, borderRadius: '50%', boxShadow: `0 0 8px ${color}` }} />
        {title}
      </h3>
      {rightNode}
    </div>
    <div style={{ flex: 1, minHeight: 0, position: 'relative', zIndex: 1, overflowY: 'auto' }}>{children}</div>
  </div>
);

// 4. Neon Gauge / Bar
const NeonProgressBar = ({ value, max, color = THEME.primary }) => {
    const percent = Math.min((value / max) * 100, 100);
    return (
      <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${percent}%`, height: '100%', background: color, borderRadius: 4, boxShadow: `0 0 10px ${color}80`, transition: 'width 0.5s ease' }} />
      </div>
    );
};

const MetricCard = ({ icon: Icon, title, value, unit, color = THEME.primary }) => (
    <HoloCard title={title} color={color} style={{ height: 'auto', padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'white', lineHeight: 1 }}>{value}</div>
                {unit && <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>{unit}</div>}
            </div>
            <Icon size={32} color={color} style={{ opacity: 0.8 }} />
        </div>
    </HoloCard>
);

const ChartDefs = () => (
    <svg style={{ height: 0, width: 0, position: 'absolute' }}>
      <defs>
        <filter id="neonGlow" height="300%" width="300%" x="-75%" y="-75%">
          <feGaussianBlur stdDeviation="5" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={THEME.primary} stopOpacity={0.4} /><stop offset="100%" stopColor={THEME.primary} stopOpacity={0} /></linearGradient>
        <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={THEME.success} stopOpacity={0.4} /><stop offset="100%" stopColor={THEME.success} stopOpacity={0} /></linearGradient>
      </defs>
    </svg>
);

const AIAgentView = ({ type, data }) => {
    if (!data) return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: THEME.textMuted, flexDirection: 'column', gap: 12, textAlign: 'center', opacity: 0.6 }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Terminal size={24} /></div>
        <p style={{ fontSize: 13 }}>Select an item to analyze.</p>
      </div>
    );
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>
        <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: `1px solid ${THEME.ai}40`, borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 24, height: 24, background: THEME.ai, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 10px ${THEME.ai}60` }}><Zap size={14} color="white" fill="white" /></div>
            <span style={{ fontSize: 13, fontWeight: 700, color: THEME.ai, letterSpacing: '0.5px' }}>AI ANALYSIS</span>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: THEME.textMain, margin: 0 }}>
             {type === 'api' ? data.ai_insight : (data.recommendation || 'Analysis complete.')}
          </p>
        </div>
        <div style={{ flex: 1, background: '#0f172a', borderRadius: 12, border: `1px solid ${THEME.grid}`, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#1e293b', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${THEME.grid}` }}>
            <span style={{ fontSize: 11, color: THEME.textMuted, fontFamily: 'monospace' }}>CONTEXT</span>
          </div>
          <div style={{ padding: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#a5b4fc', lineHeight: 1.6, flex: 1, overflowY: 'auto' }}>
             {type === 'api' ? <QueryWaterfall queries={data.queries} /> : data.problem_query || "No additional context."}
          </div>
        </div>
      </div>
    );
};

// --- MAIN DASHBOARD COMPONENT ---
const PostgreSQLMonitor = ({ currentUser, onLogout, allUsers, onCreateUser, onDeleteUser }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // State for sub-views
  const [selectedIndexItem, setSelectedIndexItem] = useState(null); 
  const [indexViewMode, setIndexViewMode] = useState(null);
  const [selectedApiItem, setSelectedApiItem] = useState(null);
  const [reliabilityViewMode, setReliabilityViewMode] = useState(null);
  const [selectedReliabilityItem, setSelectedReliabilityItem] = useState(null);

  const { metrics, chartData, logs } = useLiveSimulator();
  
  // -- OVERVIEW TAB --
  const renderOverview = () => {
    const healthScore = Math.round(100 - (metrics.cpuUsage * 0.4) - (metrics.memoryUsage * 0.2));
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24, animation: 'fadeIn 0.5s ease' }}>
        <div style={{ gridColumn: 'span 3', height: 280 }}>
          <HoloCard title="Cluster Health" color={healthScore > 80 ? THEME.success : THEME.warning}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div style={{ position: 'relative', width: 140, height: 140 }}>
                <ResponsiveContainer>
                  <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: healthScore, fill: healthScore > 80 ? THEME.success : THEME.warning }]} startAngle={90} endAngle={-270}>
                    <RadialBar background dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <span style={{ fontSize: 32, fontWeight: 'bold', color: '#fff' }}>{healthScore}</span>
                  <span style={{ fontSize: 10, color: THEME.textMuted }}>SCORE</span>
                </div>
              </div>
            </div>
          </HoloCard>
        </div>
        <div style={{ gridColumn: 'span 6', height: 280 }}>
          <HoloCard title="Live Throughput" color={THEME.primary}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs><linearGradient id="colorQps" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={THEME.primary} stopOpacity={0.8}/><stop offset="95%" stopColor={THEME.primary} stopOpacity={0}/></linearGradient></defs>
                <Area type="monotone" dataKey="qps" stroke={THEME.primary} fill="url(#colorQps)" strokeWidth={2} isAnimationActive={false} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: THEME.bg, borderColor: THEME.grid }} />
              </AreaChart>
            </ResponsiveContainer>
          </HoloCard>
        </div>
        <div style={{ gridColumn: 'span 3', height: 280 }}>
           <HoloCard title="Active Sessions" color={THEME.warning}>
             <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: 10 }}>
                <div style={{ fontSize: 48, fontWeight: 'bold', color: '#fff' }}>{metrics.activeConnections}</div>
                <div style={{ fontSize: 12, color: THEME.textMuted }}>Connections Active</div>
                <NeonProgressBar value={metrics.activeConnections} max={100} color={THEME.warning} />
             </div>
           </HoloCard>
        </div>
        <div style={{ gridColumn: 'span 8', height: 350 }}>
          <HoloCard title="Topology Map" color={THEME.secondary}>
             <TopologyMap />
          </HoloCard>
        </div>
        <div style={{ gridColumn: 'span 4', height: 350 }}>
          <HoloCard title="Live Logs" color={THEME.textMuted}>
            <div style={{ fontSize: 11, fontFamily: 'monospace' }}>
                {logs.map(log => (
                  <div key={log.id} style={{ marginBottom: 8, borderLeft: `2px solid ${log.type === 'ERROR' ? THEME.danger : log.type === 'WARN' ? THEME.warning : THEME.success}`, paddingLeft: 8 }}>
                    <span style={{ color: THEME.textMuted, opacity: 0.7 }}>[{log.timestamp}]</span>
                    <span style={{ color: log.type === 'ERROR' ? THEME.danger : log.type === 'WARN' ? THEME.warning : THEME.success, fontWeight: 'bold', marginLeft: 6 }}>{log.type}</span>
                    <div style={{ color: THEME.textMain }}>{log.message}</div>
                  </div>
                ))}
            </div>
          </HoloCard>
        </div>
      </div>
    );
  };

  // -- PERFORMANCE TAB --
  const renderPerformance = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24, animation: 'fadeIn 0.5s ease' }}>
        <div style={{ gridColumn: 'span 8', height: 400 }}>
            <HoloCard title="Latency Trends" color={THEME.ai}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid stroke={THEME.grid} strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="time" tick={{fontSize: 10, fill: THEME.textMuted}} />
                        <YAxis tick={{fontSize: 10, fill: THEME.textMuted}} />
                        <Tooltip contentStyle={{background: THEME.bgSecondary, borderColor: THEME.grid}} />
                        <Line type="monotone" dataKey="latency" stroke={THEME.ai} strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </HoloCard>
        </div>
        <div style={{ gridColumn: 'span 4', height: 400, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <HoloCard title="Avg Latency" color={THEME.warning} style={{ flex: 1 }}>
                <div style={{ fontSize: 36, fontWeight: 'bold', color: 'white' }}>42.5ms</div>
                <div style={{ fontSize: 12, color: THEME.textMuted }}>Global Average</div>
            </HoloCard>
            <HoloCard title="Transactions/Sec" color={THEME.success} style={{ flex: 1 }}>
                <div style={{ fontSize: 36, fontWeight: 'bold', color: 'white' }}>{metrics.qps}</div>
                <div style={{ fontSize: 12, color: THEME.textMuted }}>Current TPS</div>
            </HoloCard>
        </div>
        <div style={{ gridColumn: 'span 12' }}>
            <HoloCard title="Query Distribution" color={THEME.secondary}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[{l:'SELECT', v: metrics.selectPerSec, c: THEME.primary}, {l:'INSERT', v: metrics.insertPerSec, c: THEME.success}, {l:'UPDATE', v: metrics.updatePerSec, c: THEME.warning}, {l:'DELETE', v: metrics.deletePerSec, c: THEME.danger}].map(d => (
                        <div key={d.l}><div style={{display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4}}><span>{d.l}</span><span>{d.v}/s</span></div><NeonProgressBar value={d.v} max={2000} color={d.c}/></div>
                    ))}
                </div>
            </HoloCard>
        </div>
    </div>
  );

  // -- RESOURCES TAB --
  const renderResources = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, animation: 'fadeIn 0.5s ease' }}>
        <HoloCard title="CPU Usage" color={THEME.danger}>
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                 <div style={{ fontSize: 48, fontWeight: 'bold', color: 'white' }}>{metrics.cpuUsage.toFixed(1)}%</div>
                 <NeonProgressBar value={metrics.cpuUsage} max={100} color={THEME.danger} />
            </div>
        </HoloCard>
        <HoloCard title="Memory Usage" color={THEME.secondary}>
             <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                 <div style={{ fontSize: 48, fontWeight: 'bold', color: 'white' }}>{metrics.memoryUsage.toFixed(1)}%</div>
                 <NeonProgressBar value={metrics.memoryUsage} max={100} color={THEME.secondary} />
            </div>
        </HoloCard>
        <HoloCard title="Disk I/O" color={THEME.primary}>
            <div style={{ height: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: THEME.textMuted }}><span>READ</span><span>{metrics.diskIORead} ops/s</span></div>
                    <NeonProgressBar value={metrics.diskIORead} max={500} color={THEME.success} />
                </div>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: THEME.textMuted }}><span>WRITE</span><span>{metrics.diskIOWrite} ops/s</span></div>
                    <NeonProgressBar value={metrics.diskIOWrite} max={500} color={THEME.warning} />
                </div>
            </div>
        </HoloCard>
    </div>
  );

  // -- RELIABILITY TAB --
  const renderReliability = () => (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, animation: 'fadeIn 0.5s ease' }}>
          <div style={{ gridColumn: 'span 4', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
             <MetricCard icon={CheckCircle} title="Availability" value={metrics.availability} unit="%" color={THEME.success} />
             <MetricCard icon={XCircle} title="Downtime" value={metrics.downtimeIncidents} color={THEME.danger} />
             <MetricCard icon={AlertCircle} title="Error Rate" value={metrics.errorRate.toFixed(1)} unit="/min" color={THEME.warning} />
             <MetricCard icon={Lock} title="Deadlocks" value={metrics.deadlockCount} color={THEME.secondary} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <HoloCard title="Active Connections" color={THEME.primary}>
                {mockConnections.map((c, i) => (
                    <div key={i} style={{ padding: 12, borderBottom: `1px solid ${THEME.grid}`, display: 'flex', justifyContent: 'space-between' }}>
                        <div><div style={{ color: 'white', fontWeight: 600 }}>{c.app}</div><div style={{ fontSize: 11, color: THEME.textMuted }}>{c.user} @ {c.ip}</div></div>
                        <div style={{ textAlign: 'right' }}><div style={{ color: THEME.success, fontSize: 11, fontWeight: 'bold' }}>{c.state.toUpperCase()}</div><div style={{ fontSize: 11, fontFamily: 'monospace', color: THEME.textMuted }}>{c.duration}</div></div>
                    </div>
                ))}
            </HoloCard>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <HoloCard title="Recent Errors" color={THEME.danger}>
                {mockErrorLogs.map((log) => (
                    <div key={log.id} style={{ padding: 12, borderBottom: `1px solid ${THEME.grid}` }}>
                        <div style={{ color: THEME.danger, fontSize: 12, fontWeight:'bold' }}>{log.type}</div>
                        <div style={{ fontSize: 11, color: THEME.textMuted }}>{log.detail}</div>
                    </div>
                ))}
            </HoloCard>
          </div>
      </div>
  );

  // -- INDEXES TAB --
  const renderIndexes = () => {
      const getData = () => {
          if (indexViewMode === 'missing') return missingIndexesData;
          if (indexViewMode === 'unused') return unusedIndexesData;
          if (indexViewMode === 'hitRatio') return lowHitRatioData;
          return [];
      }
      return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, animation: 'fadeIn 0.5s ease' }}>
          <div style={{ gridColumn: 'span 3', display: 'flex', gap: 24 }}>
             <div onClick={() => { setIndexViewMode('hitRatio'); setSelectedIndexItem(null); }} style={{ flex: 1 }}><MetricCard icon={TrendingUp} title="Index Hit Ratio" value={metrics.indexHitRatio} unit="%" color={THEME.success} /></div>
             <div onClick={() => { setIndexViewMode('missing'); setSelectedIndexItem(null); }} style={{ flex: 1 }}><MetricCard icon={AlertTriangle} title="Missing Indexes" value={metrics.missingIndexes} color={THEME.warning} /></div>
             <div onClick={() => { setIndexViewMode('unused'); setSelectedIndexItem(null); }} style={{ flex: 1 }}><MetricCard icon={Layers} title="Unused Indexes" value={metrics.unusedIndexes} color={THEME.danger} /></div>
          </div>
          {indexViewMode && (
              <>
                <div style={{ gridColumn: 'span 2' }}>
                    <HoloCard title="Index Details" color={THEME.primary} rightNode={<button onClick={() => setIndexViewMode(null)} style={{background:'transparent', border:'none', color:THEME.textMuted, cursor:'pointer'}}><X size={16}/></button>}>
                        {getData().map(item => (
                            <div key={item.id} onClick={() => setSelectedIndexItem(item)} style={{ padding: 16, borderRadius: 8, background: selectedIndexItem?.id === item.id ? 'rgba(56, 189, 248, 0.15)' : 'transparent', cursor: 'pointer', borderBottom: `1px solid ${THEME.grid}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'white', fontWeight: 'bold' }}>{item.table}</span>
                                    <span style={{ fontSize: 10, background: item.impact === 'Critical' ? THEME.danger : THEME.warning, padding: '2px 6px', borderRadius: 4, color: 'black' }}>{item.impact || 'Check'}</span>
                                </div>
                                <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>{item.recommendation}</div>
                            </div>
                        ))}
                    </HoloCard>
                </div>
                <div style={{ gridColumn: 'span 1' }}>
                    <HoloCard title="AI Agent" color={THEME.ai}>
                        <AIAgentView type={indexViewMode} data={selectedIndexItem} />
                    </HoloCard>
                </div>
              </>
          )}
      </div>
  )};

  // -- API TRACING TAB --
  const renderApi = () => (
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 24, animation: 'fadeIn 0.5s ease', height: 'calc(100vh - 140px)' }}>
          <HoloCard title="API Endpoints" color={THEME.primary}>
              {apiQueryData.map(api => (
                  <div key={api.id} onClick={() => setSelectedApiItem(api)} style={{ padding: 16, borderRadius: 8, cursor: 'pointer', background: selectedApiItem?.id === api.id ? 'rgba(56, 189, 248, 0.15)' : 'transparent', borderBottom: `1px solid ${THEME.grid}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 10, background: api.method === 'GET' ? THEME.success : THEME.warning, color: 'black', padding: '2px 6px', borderRadius: 4, fontWeight:'bold' }}>{api.method}</span>
                          <span style={{ color: THEME.textMuted, fontSize: 11 }}>{api.avg}ms</span>
                      </div>
                      <div style={{ color: 'white', fontWeight: 600, margin: '8px 0', fontSize: 13 }}>{api.endpoint}</div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: THEME.textMuted }}><span>{api.calls} rpm</span><span style={{ color: api.db_time_pct > 80 ? THEME.danger : THEME.textMuted }}>{api.db_time_pct}% DB Time</span></div>
                  </div>
              ))}
          </HoloCard>
          <HoloCard title="Trace Analysis" color={THEME.ai} rightNode={<Cpu size={16} color={THEME.ai} />}>
              {selectedApiItem ? <AIAgentView type="api" data={selectedApiItem} /> : <EmptyState icon={Network} text="Select an endpoint" />}
          </HoloCard>
      </div>
  );

  // -- ADMIN TAB --
  const renderAdmin = () => (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24, animation: 'fadeIn 0.5s ease' }}>
          <HoloCard title="Create User" color={THEME.success}>
              <form onSubmit={(e) => { e.preventDefault(); alert("User Created"); }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div><label style={{display:'block', fontSize:11, color:THEME.textMuted, marginBottom:6}}>FULL NAME</label><input style={{width:'100%', padding:10, background:'rgba(255,255,255,0.05)', border:`1px solid ${THEME.grid}`, color:'white', borderRadius:6}} placeholder="John Doe" /></div>
                  <div><label style={{display:'block', fontSize:11, color:THEME.textMuted, marginBottom:6}}>EMAIL</label><input style={{width:'100%', padding:10, background:'rgba(255,255,255,0.05)', border:`1px solid ${THEME.grid}`, color:'white', borderRadius:6}} placeholder="user@sys.local" /></div>
                  <button style={{padding:12, background:THEME.primary, border:'none', borderRadius:6, color:'white', fontWeight:'bold', cursor:'pointer'}}>Create User</button>
              </form>
          </HoloCard>
          <HoloCard title="User List" color={THEME.secondary}>
              {allUsers.map(u => (
                  <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 16, borderBottom: `1px solid ${THEME.grid}`, alignItems: 'center' }}>
                      <div><div style={{color:'white', fontWeight:'bold'}}>{u.name}</div><div style={{fontSize:11, color:THEME.textMuted}}>{u.email}</div></div>
                      <div style={{textAlign:'right'}}><span style={{fontSize:10, background:THEME.glassBorder, padding:'4px 8px', borderRadius:10, color:THEME.primary}}>{u.role}</span>
                      {u.id !== 1 && <button onClick={() => onDeleteUser(u.id)} style={{marginLeft:10, background:'transparent', border:'none', color:THEME.danger, cursor:'pointer'}}><Trash2 size={14}/></button>}</div>
                  </div>
              ))}
          </HoloCard>
      </div>
  );

  // -- MAIN RENDER SWITCH --
  const renderContent = () => {
      switch(activeTab) {
          case 'overview': return renderOverview();
          case 'performance': return renderPerformance();
          case 'resources': return renderResources();
          case 'reliability': return renderReliability();
          case 'indexes': return renderIndexes();
          case 'api': return renderApi();
          case 'admin': return renderAdmin();
          default: return renderOverview();
      }
  };

  const availableTabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'resources', label: 'Resources', icon: HardDrive },
    { id: 'reliability', label: 'Reliability', icon: CheckCircle },
    { id: 'indexes', label: 'Indexes', icon: Layers },
    { id: 'api', label: 'API Tracing', icon: Network },
    { id: 'admin', label: 'System Admin', icon: Shield }
  ].filter(tab => currentUser?.allowedScreens?.includes(tab.id));

  useEffect(() => {
    if (!availableTabs.find(t => t.id === activeTab)) {
        setActiveTab(availableTabs[0]?.id || 'overview');
    }
  }, [currentUser]);

  return (
    <div style={{ height: '100vh', width: '100vw', background: THEME.bg, display: 'flex', overflow: 'hidden', color: THEME.textMain, fontFamily: 'Inter, sans-serif' }}>
       {/* ANIMATION STYLES */}
       <style>{`
         @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(244, 63, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); } }
         @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
         @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
       `}</style>

       {/* SIDEBAR */}
       <aside style={{ width: isSidebarOpen ? 240 : 70, background: 'rgba(2, 6, 23, 0.9)', borderRight: `1px solid ${THEME.grid}`, display: 'flex', flexDirection: 'column', zIndex: 20, transition: 'width 0.3s ease' }}>
          <div style={{ padding: '24px 12px', display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'flex-start' : 'center', gap: 12 }}>
             <div style={{ width: 32, height: 32, background: THEME.primary, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 15px ${THEME.primary}60`, flexShrink: 0 }}><Database color="white" size={18} /></div>
             {isSidebarOpen && <div><div style={{ fontWeight: 'bold', fontSize: 14 }}>PG Monitor</div><div style={{ fontSize: 10, color: THEME.success }}>ONLINE</div></div>}
          </div>
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
             {availableTabs.map(tab => (
               <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ 
                   display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', 
                   justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                   background: activeTab === tab.id ? 'linear-gradient(90deg, rgba(14, 165, 233, 0.1), transparent)' : 'transparent',
                   border: 'none', borderLeft: activeTab === tab.id ? `3px solid ${THEME.primary}` : '3px solid transparent',
                   color: activeTab === tab.id ? '#fff' : THEME.textMuted, cursor: 'pointer', fontSize: 13, fontWeight: 500
                 }}>
                 <tab.icon size={18} color={activeTab === tab.id ? THEME.primary : THEME.textMuted} /> 
                 {isSidebarOpen && tab.label}
               </button>
             ))}
          </div>
          <div style={{ marginTop: 'auto', padding: 20, borderTop: `1px solid ${THEME.grid}`, display: 'flex', justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}>
             <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, color: THEME.textMuted, background: 'transparent', border: 'none', cursor: 'pointer' }}>
               <LogOut size={16} /> {isSidebarOpen && 'Logout'}
             </button>
          </div>
       </aside>

       {/* MAIN CONTENT AREA */}
       <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${THEME.grid} 1px, transparent 1px)`, backgroundSize: '40px 40px', opacity: 0.2, pointerEvents: 'none' }} />
          <ChartDefs />
          <header style={{ height: 64, borderBottom: `1px solid ${THEME.grid}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', backdropFilter: 'blur(10px)', background: 'rgba(2, 6, 23, 0.5)' }}>
             <div style={{display:'flex', alignItems:'center', gap: 12}}>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{background:'transparent', border:'none', color: THEME.textMuted, cursor:'pointer'}}><ChevronLeft size={20} style={{transform: isSidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s'}} /></button>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Dashboard</h2>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ padding: '6px 12px', background: 'rgba(59, 130, 246, 0.1)', border: `1px solid ${THEME.primary}30`, borderRadius: 20, fontSize: 11, color: THEME.primary }}>US-East-1 Prod</div>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${THEME.grid}` }}><UserIcon size={16} color={THEME.textMuted} /></div>
             </div>
          </header>
          <div style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
             {renderContent()}
          </div>
       </main>
    </div>
  );
};

// --- VISUALS FOR LOGIN ---
const LoginVisuals = () => {
  const data = Array.from({ length: 40 }, (_, i) => ({
    time: i,
    value: 40 + Math.random() * 40 + (Math.sin(i / 5) * 20),
    value2: 30 + Math.random() * 20
  }));

  return (
    <div style={{ 
      flex: 1, position: 'relative', background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)', 
      overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 60
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.1) 0%, transparent 50%)' }} />
      <HoloCard title="Live Cluster Health" color={THEME.primary} style={{ width: '100%', maxWidth: 600, height: 400 }}>
         <div style={{ height: 200, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="loginGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={THEME.primary} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke={THEME.primary} strokeWidth={3} fillOpacity={1} fill="url(#loginGradient)" />
              <Area type="monotone" dataKey="value2" stroke={THEME.secondary} strokeWidth={2} fill="none" strokeDasharray="5 5" opacity={0.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{ marginTop: 20, textAlign: 'center' }}>
            <h2 style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>Total Observability</h2>
            <p style={{ color: THEME.textMuted }}>Zero Overhead Monitoring</p>
        </div>
      </HoloCard>
    </div>
  );
};

// --- AUTH WRAPPER COMPONENTS ---
// 1. Google Auth Modal
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HoloCard title="Google Sign-In" color={THEME.textMain} style={{ width: 400, height: 'auto' }} rightContent={<button onClick={onClose} style={{background:'transparent', border:'none', cursor:'pointer'}}><X size={20} color="white"/></button>}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
                    <Chrome size={48} color="#4285F4" style={{ marginBottom: 16 }} />
                    <p style={{ color: THEME.textMuted, marginBottom: 24 }}>Enter your email to simulate Google Auth</p>
                    <form onSubmit={handleConfirm} style={{ width: '100%' }}>
                        <input type="email" required autoFocus placeholder="Email" value={mockEmail} onChange={(e) => setMockEmail(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: `1px solid ${THEME.grid}`, color: 'white', marginBottom: 20, outline: 'none' }} />
                        <button type="submit" style={{ width: '100%', background: THEME.primary, border: 'none', padding: '12px', borderRadius: 8, color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Continue</button>
                    </form>
                </div>
            </HoloCard>
        </div>
    );
};

// 2. Login Page
const LoginPage = ({ onLogin, onGoogleLogin, loading, error }) => {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [showGoogleModal, setShowGoogleModal] = useState(false);
    
    const handleSubmit = (e) => { e.preventDefault(); onLogin(loginId, password); };
    const handleGoogleSubmit = (email, name) => { setShowGoogleModal(false); onGoogleLogin(email, name); };
  
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', background: '#020617' }}>
        <GoogleAuthModal isOpen={showGoogleModal} onClose={() => setShowGoogleModal(false)} onConfirm={handleGoogleSubmit} />
        <div style={{ width: '40%', minWidth: 450, background: '#020617', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px', borderRight: `1px solid ${THEME.grid}`, position: 'relative' }}>
          <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${THEME.primary}40` }}><Database color="#fff" size={20} /></div>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>PG Monitor</span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Welcome back</h1>
          <p style={{ color: THEME.textMuted, marginBottom: 40 }}>Enter your credentials to access the workspace.</p>
          {error && <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: `1px solid ${THEME.danger}40`, color: '#fca5a5', padding: '12px 16px', borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}><AlertTriangle size={16} /> {error}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div><label style={{ display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 600, color: THEME.textMuted }}>WORK EMAIL</label><input type="text" required value={loginId} onChange={(e) => setLoginId(e.target.value)} placeholder="name@company.com" style={{ width: '100%', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', border: `1px solid ${THEME.grid}`, borderRadius: 8, color: 'white', outline: 'none' }} /></div>
            <div><label style={{ display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 600, color: THEME.textMuted }}>PASSWORD</label><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', border: `1px solid ${THEME.grid}`, borderRadius: 8, color: 'white', outline: 'none' }} /></div>
            <button type="submit" disabled={loading} style={{ marginTop: 10, background: THEME.primary, border: 'none', padding: '14px', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>{loading ? 'Authenticating...' : 'Sign in'}</button>
          </form>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '30px 0' }}><div style={{ flex: 1, height: 1, background: THEME.grid }} /><span style={{ color: THEME.textMuted, fontSize: 12 }}>OR</span><div style={{ flex: 1, height: 1, background: THEME.grid }} /></div>
          <button onClick={() => setShowGoogleModal(true)} disabled={loading} style={{ width: '100%', background: 'transparent', border: `1px solid ${THEME.grid}`, padding: '12px', borderRadius: 8, color: 'white', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>{loading ? <span>Connecting...</span> : <><Chrome size={18} /> Sign in with Google</>}</button>
        </div>
        <LoginVisuals />
      </div>
    );
};

// --- AUTH HOOK (Simulated Backend) ---
const useMockAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allUsers, setAllUsers] = useState([
    { id: 1, email: 'admin', name: 'System Administrator', role: 'Super Admin', accessLevel: 'write', allowedScreens: ['overview', 'performance', 'resources', 'reliability', 'indexes', 'api', 'admin'] },
    { id: 2, email: 'analyst@sys.local', name: 'Data Analyst', role: 'User', accessLevel: 'read', allowedScreens: ['overview', 'performance', 'api'] }
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem('pg_monitor_user');
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
    setTimeout(() => setIsInitializing(false), 1000); // Fake init delay
  }, []);

  const login = async (loginId, password) => {
    setLoading(true); setError(null);
    return new Promise((resolve) => {
      setTimeout(() => {
        if (loginId === 'admin' && password === 'admin') {
           const admin = allUsers.find(u => u.email === 'admin');
           setCurrentUser(admin); localStorage.setItem('pg_monitor_user', JSON.stringify(admin));
           setLoading(false); resolve(true); return;
        }
        const foundUser = allUsers.find(u => u.email === loginId);
        if (foundUser && password.length >= 4) { 
           setCurrentUser(foundUser); localStorage.setItem('pg_monitor_user', JSON.stringify(foundUser));
           setLoading(false); resolve(true); return;
        }
        setError('Invalid credentials.'); setLoading(false); resolve(false);
      }, 1000); 
    });
  };

  const googleLogin = async (email, name) => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const googleUser = { id: 999 + Math.floor(Math.random() * 1000), email: email || 'google_user@gmail.com', name: name || 'Google User', role: 'Viewer', accessLevel: 'read', allowedScreens: ['overview', 'resources'] };
        setCurrentUser(googleUser); localStorage.setItem('pg_monitor_user', JSON.stringify(googleUser));
        setLoading(false); resolve(true);
      }, 1500);
    });
  };

  const logout = () => { setCurrentUser(null); localStorage.removeItem('pg_monitor_user'); };
  const createUser = (newUser) => { setAllUsers(prev => [...prev, { ...newUser, id: prev.length + 10 }]); };
  const deleteUser = (userId) => { if (userId === 1) return; setAllUsers(prev => prev.filter(u => u.id !== userId)); };

  return { currentUser, isInitializing, loading, error, login, googleLogin, logout, allUsers, createUser, deleteUser };
};

// --- APP ROOT ---
const App = () => {
    const { currentUser, isInitializing, loading, error, login, googleLogin, logout, allUsers, createUser, deleteUser } = useMockAuth();

    if (isInitializing) {
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