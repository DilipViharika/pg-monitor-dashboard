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

// --- ADVANCED THEME SYSTEM ---
const THEME = {
  bg: '#020617',
  bgSecondary: '#0f172a',
  glass: 'rgba(15, 23, 42, 0.7)',
  glassHover: 'rgba(30, 41, 59, 0.8)',
  glassBorder: 'rgba(56, 189, 248, 0.15)',
  textMain: '#F8FAFC',
  textMuted: '#94A3B8',
  primary: '#0EA5E9', 
  secondary: '#8B5CF6',
  success: '#10B981', 
  warning: '#F59E0B', 
  danger: '#F43F5E',
  grid: '#1E293B',
  ai: '#d946ef',
  gradientPrimary: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)',
  gradientDanger: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)'
};

// --- DATA SIMULATION HOOK ---
const useLiveSimulator = () => {
  const [metrics, setMetrics] = useState({
    qps: 1840,
    activeConnections: 45,
    cpuUsage: 42,
    memoryUsage: 64,
    diskIORead: 245,
    diskIOWrite: 128,
    uptime: 2592000
  });
  const [chartData, setChartData] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const history = Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - (20 - i) * 1000).toLocaleTimeString(),
      qps: 1500 + Math.random() * 500,
      latency: 20 + Math.random() * 30,
      cpu: 40 + Math.random() * 20
    }));
    setChartData(history);

    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        qps: Math.floor(prev.qps + (Math.random() - 0.5) * 100),
        activeConnections: Math.max(0, Math.floor(prev.activeConnections + (Math.random() - 0.5) * 5)),
        cpuUsage: Math.min(100, Math.max(0, prev.cpuUsage + (Math.random() - 0.5) * 5)),
        memoryUsage: Math.min(100, Math.max(0, prev.memoryUsage + (Math.random() - 0.5) * 2)),
        diskIORead: Math.floor(prev.diskIORead + (Math.random() - 0.5) * 20),
        diskIOWrite: Math.floor(prev.diskIOWrite + (Math.random() - 0.5) * 10)
      }));

      setChartData(prev => {
        const newData = [...prev.slice(1), {
          time: new Date().toLocaleTimeString(),
          qps: metrics.qps + Math.random() * 100,
          latency: 20 + Math.random() * 40,
          cpu: metrics.cpuUsage
        }];
        return newData;
      });

      if (Math.random() > 0.8) {
        const types = ['INFO', 'WARN', 'ERROR'];
        const msgs = ['Checkpoint complete', 'Long running query detected', 'Connection pool saturated', 'Autovacuum started'];
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

const missingIndexesData = [
  { id: 1, table: 'orders', column: 'customer_id', impact: 'Critical', improvement: '94%' },
  { id: 2, table: 'transactions', column: 'created_at', impact: 'High', improvement: '98%' },
  { id: 3, table: 'audit_logs', column: 'user_id', impact: 'Medium', improvement: '75%' },
];

const apiQueryData = [
    { id: 'api_1', method: 'GET', endpoint: '/api/v1/dashboard/stats', avg: 320, calls: 850, queries: [{sql:'SELECT count(*) FROM orders', calls:1, duration:120}] },
    { id: 'api_2', method: 'POST', endpoint: '/api/v1/orders/create', avg: 180, calls: 120, queries: [{sql:'INSERT INTO orders...', calls:1, duration:12}] },
];

// --- VISUALIZATION COMPONENTS ---

const TopologyMap = () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <svg width="100%" height="250" viewBox="0 0 600 250">
        <defs>
          <filter id="glow"><feGaussianBlur stdDeviation="2.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <linearGradient id="linkGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor={THEME.primary} stopOpacity="0.6" /><stop offset="100%" stopColor={THEME.secondary} stopOpacity="0.6" /></linearGradient>
        </defs>
        <path d="M 300 40 L 150 140" stroke="url(#linkGrad)" strokeWidth="2" strokeDasharray="5,5"><animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" /></path>
        <path d="M 300 40 L 450 140" stroke="url(#linkGrad)" strokeWidth="2" strokeDasharray="5,5"><animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" /></path>
        <g transform="translate(270, 10)"><rect width="60" height="60" rx="10" fill={THEME.bgSecondary} stroke={THEME.primary} strokeWidth="2" filter="url(#glow)" /><Network x="15" y="15" color={THEME.primary} size={30} /></g>
        <g transform="translate(120, 140)"><circle cx="30" cy="30" r="30" fill={THEME.bgSecondary} stroke={THEME.success} strokeWidth="2" filter="url(#glow)" /><Database x="15" y="15" color={THEME.success} size={30} /><text x="30" y="75" textAnchor="middle" fill={THEME.textMain} fontSize="10">Primary</text></g>
        <g transform="translate(420, 140)"><circle cx="30" cy="30" r="30" fill={THEME.bgSecondary} stroke={THEME.secondary} strokeWidth="2" /><Database x="15" y="15" color={THEME.secondary} size={30} /><text x="30" y="75" textAnchor="middle" fill={THEME.textMain} fontSize="10">Replica</text></g>
      </svg>
    </div>
);

const HoloCard = ({ title, children, color = THEME.primary, rightContent, style }) => (
  <div style={{
    background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(2, 6, 23, 0.8) 100%)',
    border: `1px solid ${color}30`, borderRadius: 16, padding: 24, position: 'relative', overflow: 'hidden',
    boxShadow: `0 0 0 1px ${color}10, 0 10px 30px -10px rgba(0,0,0,0.5)`, backdropFilter: 'blur(10px)',
    display: 'flex', flexDirection: 'column', height: '100%', ...style
  }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`, opacity: 0.5 }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexShrink: 0 }}>
      <h3 style={{ margin: 0, fontSize: 13, textTransform: 'uppercase', letterSpacing: '1px', color: color, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 6, height: 6, background: color, borderRadius: '50%', boxShadow: `0 0 8px ${color}` }} />
        {title}
      </h3>
      {rightContent}
    </div>
    <div style={{ flex: 1, minHeight: 0, position: 'relative', overflowY: 'auto' }}>{children}</div>
  </div>
);

const NeonProgressBar = ({ value, max, color = THEME.primary }) => {
    const percent = Math.min((value / max) * 100, 100);
    return (
      <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${percent}%`, height: '100%', background: color, borderRadius: 4, boxShadow: `0 0 10px ${color}80`, transition: 'width 0.5s ease' }} />
      </div>
    );
};

// --- MAIN APPLICATION COMPONENT ---
const PostgreSQLMonitor = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
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
            <HoloCard title="Slow Queries (>1s)" color={THEME.danger} style={{ flex: 1 }}>
                <div style={{ fontSize: 36, fontWeight: 'bold', color: 'white' }}>12</div>
                <div style={{ fontSize: 12, color: THEME.textMuted }}>Detected in last hour</div>
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, animation: 'fadeIn 0.5s ease' }}>
          <HoloCard title="Active Connections" color={THEME.primary}>
              {mockConnections.map((c, i) => (
                  <div key={i} style={{ padding: 12, borderBottom: `1px solid ${THEME.grid}`, display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                          <div style={{ color: 'white', fontWeight: 600 }}>{c.app}</div>
                          <div style={{ fontSize: 11, color: THEME.textMuted }}>{c.user} @ {c.ip}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                          <div style={{ color: THEME.success, fontSize: 11, fontWeight: 'bold' }}>{c.state.toUpperCase()}</div>
                          <div style={{ fontSize: 11, fontFamily: 'monospace', color: THEME.textMuted }}>{c.duration}</div>
                      </div>
                  </div>
              ))}
          </HoloCard>
          <HoloCard title="Recent Errors" color={THEME.danger}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ padding: 12, background: 'rgba(244, 63, 94, 0.1)', border: `1px solid ${THEME.danger}40`, borderRadius: 8 }}>
                      <div style={{ color: THEME.danger, fontWeight: 'bold', fontSize: 12 }}>FATAL: Connection limit exceeded</div>
                      <div style={{ color: THEME.textMuted, fontSize: 11, marginTop: 4 }}>10 minutes ago</div>
                  </div>
                  <div style={{ padding: 12, background: 'rgba(245, 158, 11, 0.1)', border: `1px solid ${THEME.warning}40`, borderRadius: 8 }}>
                      <div style={{ color: THEME.warning, fontWeight: 'bold', fontSize: 12 }}>WARNING: Long running transaction</div>
                      <div style={{ color: THEME.textMuted, fontSize: 11, marginTop: 4 }}>22 minutes ago</div>
                  </div>
              </div>
          </HoloCard>
      </div>
  );

  // -- INDEXES TAB --
  const renderIndexes = () => (
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, animation: 'fadeIn 0.5s ease' }}>
          <HoloCard title="Missing Index Recommendations" color={THEME.warning}>
              {missingIndexesData.map(item => (
                  <div key={item.id} style={{ padding: 16, marginBottom: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: `1px solid ${THEME.grid}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ color: 'white', fontWeight: 'bold' }}>{item.table}</span>
                          <span style={{ fontSize: 10, background: item.impact === 'Critical' ? THEME.danger : THEME.warning, padding: '2px 6px', borderRadius: 4, color: 'black', fontWeight: 'bold' }}>{item.impact}</span>
                      </div>
                      <div style={{ fontSize: 12, color: THEME.textMuted }}>Column: {item.column}</div>
                      <div style={{ fontSize: 12, color: THEME.success, marginTop: 4 }}>Est. Improvement: {item.improvement}</div>
                  </div>
              ))}
          </HoloCard>
          <HoloCard title="Index Hit Ratio" color={THEME.success}>
             <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <div style={{ fontSize: 64, fontWeight: 'bold', color: THEME.success }}>96%</div>
                  <div style={{ color: THEME.textMuted }}>Overall Efficiency</div>
             </div>
          </HoloCard>
      </div>
  );

  // -- API TRACING TAB --
  const renderApi = () => (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, animation: 'fadeIn 0.5s ease' }}>
          <HoloCard title="Endpoint Performance" color={THEME.primary}>
              {apiQueryData.map(api => (
                  <div key={api.id} style={{ padding: 12, borderBottom: `1px solid ${THEME.grid}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'white', fontFamily: 'monospace' }}>{api.endpoint}</span>
                          <span style={{ color: THEME.warning }}>{api.avg}ms</span>
                      </div>
                      <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>{api.method} • {api.calls} calls/min</div>
                  </div>
              ))}
          </HoloCard>
          <HoloCard title="Query Waterfall (Trace)" color={THEME.ai}>
               <div style={{ padding: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ width: 100, fontSize: 11, color: THEME.textMuted, textAlign: 'right', paddingRight: 10 }}>Parser</div>
                    <div style={{ width: '60%', background: 'rgba(255,255,255,0.1)', height: 20, borderRadius: 4 }}><div style={{ width: '10%', height: '100%', background: THEME.textMuted, borderRadius: 4 }}></div></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ width: 100, fontSize: 11, color: THEME.textMuted, textAlign: 'right', paddingRight: 10 }}>Planner</div>
                    <div style={{ width: '60%', background: 'rgba(255,255,255,0.1)', height: 20, borderRadius: 4 }}><div style={{ width: '25%', height: '100%', marginLeft: '10%', background: THEME.primary, borderRadius: 4 }}></div></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ width: 100, fontSize: 11, color: THEME.textMuted, textAlign: 'right', paddingRight: 10 }}>Execution</div>
                    <div style={{ width: '60%', background: 'rgba(255,255,255,0.1)', height: 20, borderRadius: 4 }}><div style={{ width: '60%', height: '100%', marginLeft: '35%', background: THEME.success, borderRadius: 4 }}></div></div>
                  </div>
               </div>
          </HoloCard>
      </div>
  );

  // -- ADMIN TAB --
  const renderAdmin = () => (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, animation: 'fadeIn 0.5s ease' }}>
          <HoloCard title="User Management" color={THEME.secondary}>
              <div style={{ padding: 20, textAlign: 'center', color: THEME.textMuted }}>
                 <Shield size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                 <p>Admin panel restricted. Please contact super admin for access.</p>
              </div>
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

  return (
    <div style={{ height: '100vh', width: '100vw', background: THEME.bg, display: 'flex', overflow: 'hidden', color: THEME.textMain, fontFamily: 'Inter, sans-serif' }}>
       {/* ANIMATION STYLES */}
       <style>{`
         @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(244, 63, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); } }
         @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
       `}</style>

       {/* SIDEBAR */}
       <aside style={{ width: 240, background: 'rgba(2, 6, 23, 0.9)', borderRight: `1px solid ${THEME.grid}`, display: 'flex', flexDirection: 'column', zIndex: 20 }}>
          <div style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
             <div style={{ width: 32, height: 32, background: THEME.primary, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 15px ${THEME.primary}60` }}><Database color="white" size={18} /></div>
             <div><div style={{ fontWeight: 'bold', fontSize: 14 }}>PG Monitor</div><div style={{ fontSize: 10, color: THEME.success }}>ONLINE</div></div>
          </div>
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
             {[
               { id: 'overview', icon: Activity, label: 'Overview' },
               { id: 'performance', icon: Zap, label: 'Performance' },
               { id: 'resources', icon: HardDrive, label: 'Resources' },
               { id: 'reliability', icon: CheckCircle, label: 'Reliability' },
               { id: 'indexes', icon: Layers, label: 'Indexes' },
               { id: 'api', icon: Network, label: 'API Tracing' },
               { id: 'admin', icon: Shield, label: 'Admin' }
             ].map(tab => (
               <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ 
                   display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', 
                   background: activeTab === tab.id ? 'linear-gradient(90deg, rgba(14, 165, 233, 0.1), transparent)' : 'transparent',
                   border: 'none', borderLeft: activeTab === tab.id ? `3px solid ${THEME.primary}` : '3px solid transparent',
                   color: activeTab === tab.id ? '#fff' : THEME.textMuted, cursor: 'pointer', fontSize: 13, fontWeight: 500
                 }}>
                 <tab.icon size={18} color={activeTab === tab.id ? THEME.primary : THEME.textMuted} /> {tab.label}
               </button>
             ))}
          </div>
          <div style={{ marginTop: 'auto', padding: 20, borderTop: `1px solid ${THEME.grid}` }}>
             <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, color: THEME.textMuted, background: 'transparent', border: 'none', cursor: 'pointer' }}><LogOut size={16} /> Logout</button>
          </div>
       </aside>

       {/* MAIN CONTENT AREA */}
       <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${THEME.grid} 1px, transparent 1px)`, backgroundSize: '40px 40px', opacity: 0.2, pointerEvents: 'none' }} />
          <header style={{ height: 64, borderBottom: `1px solid ${THEME.grid}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', backdropFilter: 'blur(10px)', background: 'rgba(2, 6, 23, 0.5)' }}>
             <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Dashboard</h2>
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

// --- AUTH WRAPPER (LOGIN PAGE) ---
const AuthWrapper = () => {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(false);
   const [modalOpen, setModalOpen] = useState(false);

   const handleGoogleLogin = (email, name) => {
      setModalOpen(false);
      setLoading(true);
      setTimeout(() => {
         setUser({ email, name });
         setLoading(false);
      }, 1500);
   };

   if (loading) return (
     <div style={{ height: '100vh', width: '100vw', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 50, height: 50, border: `3px solid ${THEME.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
     </div>
   );

   if (!user) return (
      <div style={{ height: '100vh', width: '100vw', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
         <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.15) 0%, transparent 60%)' }} />
         <div style={{ width: 400, padding: 40, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(20px)', borderRadius: 24, border: `1px solid ${THEME.glassBorder}`, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', zIndex: 10 }}>
            <div style={{ marginBottom: 30, textAlign: 'center' }}>
               <div style={{ width: 48, height: 48, background: THEME.primary, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: `0 0 20px ${THEME.primary}60` }}><Database color="white" size={24} /></div>
               <h1 style={{ fontSize: 24, fontWeight: 'bold', color: 'white', margin: 0 }}>PG Monitor Pro</h1>
               <p style={{ color: THEME.textMuted, fontSize: 14, marginTop: 8 }}>Enterprise Database Observability</p>
            </div>
            <button onClick={() => setModalOpen(true)} style={{ width: '100%', padding: '14px', borderRadius: 12, border: `1px solid ${THEME.grid}`, background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.05)'}>
               <Chrome size={18} /> Sign in with Google
            </button>
            <div style={{ marginTop: 24, fontSize: 12, color: THEME.textMuted, textAlign: 'center' }}>Secure Enterprise SSO</div>
         </div>
         {modalOpen && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ background: 'white', width: 380, borderRadius: 8, padding: 32, position: 'relative' }}>
                  <button onClick={() => setModalOpen(false)} style={{ position: 'absolute', top: 12, right: 12, border: 'none', background: 'transparent', cursor: 'pointer' }}><X size={20} color="#555" /></button>
                  <Chrome size={40} color="#4285F4" style={{ marginBottom: 16 }} />
                  <h3 style={{ margin: '0 0 8px 0', color: '#333', fontSize: 20 }}>Sign in with Google</h3>
                  <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>to continue to PG Monitor Pro</p>
                  <form onSubmit={(e) => { e.preventDefault(); handleGoogleLogin(e.target.email.value, e.target.email.value.split('@')[0]); }}>
                     <input name="email" type="email" placeholder="Email" required style={{ width: '100%', padding: 12, marginBottom: 20, borderRadius: 4, border: '1px solid #ddd', fontSize: 14 }} />
                     <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button type="submit" style={{ background: '#1a73e8', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}>Next</button></div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );

   return <PostgreSQLMonitor currentUser={user} onLogout={() => setUser(null)} />;
};

export default AuthWrapper;