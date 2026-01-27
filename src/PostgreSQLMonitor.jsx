import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Legend, RadialBarChart, RadialBar, PolarAngleAxis, ScatterChart, Scatter, ZAxis
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
// Simulates a live connection stream
const useLiveSimulator = (initialMetrics) => {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [chartData, setChartData] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Initialize chart history
    const history = Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - (20 - i) * 1000).toLocaleTimeString(),
      qps: 1500 + Math.random() * 500,
      latency: 20 + Math.random() * 30,
      cpu: 40 + Math.random() * 20
    }));
    setChartData(history);

    const interval = setInterval(() => {
      // 1. Update Metrics randomly
      setMetrics(prev => ({
        ...prev,
        qps: Math.floor(prev.qps + (Math.random() - 0.5) * 100),
        activeConnections: Math.max(0, Math.floor(prev.activeConnections + (Math.random() - 0.5) * 5)),
        cpuUsage: Math.min(100, Math.max(0, prev.cpuUsage + (Math.random() - 0.5) * 5)),
        memoryUsage: Math.min(100, Math.max(0, prev.memoryUsage + (Math.random() - 0.5) * 2)),
      }));

      // 2. Push new Chart Data
      setChartData(prev => {
        const newData = [...prev.slice(1), {
          time: new Date().toLocaleTimeString(),
          qps: metrics.qps + Math.random() * 100,
          latency: 20 + Math.random() * 40,
          cpu: metrics.cpuUsage
        }];
        return newData;
      });

      // 3. Random Log Injection
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
  }, [metrics.qps, metrics.cpuUsage]);

  return { metrics, chartData, logs };
};

// --- VISUALIZATION COMPONENTS ---

// 1. Topology Map (SVG Visualization)
const TopologyMap = () => {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <svg width="100%" height="300" viewBox="0 0 600 300">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="linkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={THEME.primary} stopOpacity="0.8" />
            <stop offset="100%" stopColor={THEME.secondary} stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Links */}
        <path d="M 300 50 L 150 150" stroke="url(#linkGrad)" strokeWidth="2" strokeDasharray="5,5">
          <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M 300 50 L 450 150" stroke="url(#linkGrad)" strokeWidth="2" strokeDasharray="5,5">
          <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" />
        </path>
        <line x1="150" y1="150" x2="150" y2="250" stroke={THEME.grid} strokeWidth="2" />
        <line x1="450" y1="150" x2="450" y2="250" stroke={THEME.grid} strokeWidth="2" />

        {/* Load Balancer */}
        <g transform="translate(270, 20)">
          <rect width="60" height="60" rx="10" fill={THEME.bgSecondary} stroke={THEME.primary} strokeWidth="2" filter="url(#glow)" />
          <Network x="15" y="15" color={THEME.primary} size={30} />
          <text x="30" y="80" textAnchor="middle" fill={THEME.textMuted} fontSize="10">PgBouncer</text>
        </g>

        {/* Primary DB */}
        <g transform="translate(120, 150)">
          <circle cx="30" cy="30" r="30" fill={THEME.bgSecondary} stroke={THEME.success} strokeWidth="2" filter="url(#glow)" />
          <Database x="15" y="15" color={THEME.success} size={30} />
          <text x="30" y="80" textAnchor="middle" fill={THEME.textMain} fontSize="12" fontWeight="bold">Primary</text>
          <text x="30" y="95" textAnchor="middle" fill={THEME.textMuted} fontSize="10">US-East-1a</text>
        </g>

        {/* Replica DB */}
        <g transform="translate(420, 150)">
          <circle cx="30" cy="30" r="30" fill={THEME.bgSecondary} stroke={THEME.secondary} strokeWidth="2" />
          <Database x="15" y="15" color={THEME.secondary} size={30} />
          <text x="30" y="80" textAnchor="middle" fill={THEME.textMain} fontSize="12">Replica</text>
          <text x="30" y="95" textAnchor="middle" fill={THEME.textMuted} fontSize="10">US-East-1b</text>
        </g>

        {/* Pulsing Effect on Primary */}
        <circle cx="150" cy="180" r="35" fill="none" stroke={THEME.success} strokeWidth="1" opacity="0.5">
          <animate attributeName="r" from="30" to="45" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
};

// 2. Query Waterfall (Gantt Chart for EXPLAIN ANALYZE)
const QueryWaterfall = ({ queryData }) => {
  // Mock steps for visualization
  const steps = [
    { name: 'Parser', start: 0, duration: 2, color: THEME.textMuted },
    { name: 'Planner / Optimizer', start: 2, duration: 15, color: THEME.primary },
    { name: 'Index Scan (idx_orders_uid)', start: 17, duration: 45, color: THEME.success },
    { name: 'Heap Fetch', start: 62, duration: 30, color: THEME.secondary },
    { name: 'Aggregation', start: 92, duration: 10, color: THEME.warning },
    { name: 'Network Transfer', start: 102, duration: 5, color: THEME.textMuted },
  ];

  return (
    <div style={{ width: '100%', padding: 10 }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ width: 140, fontSize: 11, color: THEME.textMuted, textAlign: 'right', paddingRight: 10 }}>{step.name}</div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', height: 24, borderRadius: 4, position: 'relative' }}>
             <div style={{ 
               position: 'absolute', 
               left: `${step.start * 0.8}%`, 
               width: `${Math.max(step.duration * 0.8, 1)}%`, 
               height: '100%', 
               background: step.color, 
               borderRadius: 4,
               opacity: 0.8,
               boxShadow: `0 0 10px ${step.color}60`
             }} />
             <span style={{ position: 'absolute', left: `${(step.start + step.duration) * 0.8 + 2}%`, top: 4, fontSize: 10, color: '#fff' }}>
               {step.duration}ms
             </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// 3. Holographic Card Component
const HoloCard = ({ title, children, color = THEME.primary, rightContent }) => (
  <div style={{
    background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(2, 6, 23, 0.9) 100%)',
    border: `1px solid ${color}30`,
    borderRadius: 16,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: `0 0 0 1px ${color}10, 0 10px 30px -10px rgba(0,0,0,0.5)`,
    backdropFilter: 'blur(10px)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  }}>
    <div style={{ 
      position: 'absolute', top: 0, left: 0, right: 0, height: 1, 
      background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
      opacity: 0.5
    }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <h3 style={{ margin: 0, fontSize: 13, textTransform: 'uppercase', letterSpacing: '1px', color: color, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 6, height: 6, background: color, borderRadius: '50%', boxShadow: `0 0 8px ${color}` }} />
        {title}
      </h3>
      {rightContent}
    </div>
    <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>{children}</div>
  </div>
);

// --- MAIN APPLICATION ---

const PostgreSQLMonitor = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTrace, setSelectedTrace] = useState(null);
  
  // Initialize Real-time Data
  const { metrics, chartData, logs } = useLiveSimulator({
    qps: 1840,
    activeConnections: 45,
    cpuUsage: 42,
    memoryUsage: 64,
    uptime: 2592000
  });

  // Calculate some derived stats
  const healthScore = useMemo(() => {
    return Math.max(0, 100 - (metrics.cpuUsage * 0.4) - (metrics.memoryUsage * 0.2) - (metrics.activeConnections > 80 ? 20 : 0));
  }, [metrics]);

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24, animation: 'fadeIn 0.5s ease' }}>
            {/* Top Metrics Row */}
            <div style={{ gridColumn: 'span 3' }}>
              <HoloCard title="Health Score" color={healthScore > 80 ? THEME.success : THEME.warning}>
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 140 }}>
                    <div style={{ position: 'relative', width: 120, height: 120 }}>
                       <ResponsiveContainer>
                         <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: healthScore, fill: healthScore > 80 ? THEME.success : THEME.warning }]} startAngle={90} endAngle={-270}>
                           <RadialBar background dataKey="value" cornerRadius={10} />
                         </RadialBarChart>
                       </ResponsiveContainer>
                       <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                         <span style={{ fontSize: 28, fontWeight: 'bold', color: '#fff' }}>{Math.round(healthScore)}</span>
                         <span style={{ fontSize: 10, color: THEME.textMuted }}>OPTIMAL</span>
                       </div>
                    </div>
                 </div>
              </HoloCard>
            </div>

            <div style={{ gridColumn: 'span 3' }}>
               <HoloCard title="Live Throughput" color={THEME.primary}>
                 <div style={{ height: 140 }}>
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={chartData}>
                       <defs>
                         <linearGradient id="colorQps" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.8}/>
                           <stop offset="95%" stopColor={THEME.primary} stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <Area type="monotone" dataKey="qps" stroke={THEME.primary} fill="url(#colorQps)" strokeWidth={2} isAnimationActive={false} />
                     </AreaChart>
                   </ResponsiveContainer>
                 </div>
                 <div style={{ position: 'absolute', bottom: 20, right: 20, textAlign: 'right' }}>
                   <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>{metrics.qps.toLocaleString()}</div>
                   <div style={{ fontSize: 10, color: THEME.textMuted }}>Queries / Sec</div>
                 </div>
               </HoloCard>
            </div>

            <div style={{ gridColumn: 'span 3' }}>
               <HoloCard title="Latency" color={THEME.ai}>
                 <div style={{ height: 140 }}>
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={chartData}>
                       <Line type="monotone" dataKey="latency" stroke={THEME.ai} strokeWidth={2} dot={false} isAnimationActive={false} />
                     </LineChart>
                   </ResponsiveContainer>
                 </div>
                 <div style={{ position: 'absolute', bottom: 20, right: 20, textAlign: 'right' }}>
                   <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>42ms</div>
                   <div style={{ fontSize: 10, color: THEME.textMuted }}>Avg Latency</div>
                 </div>
               </HoloCard>
            </div>

            <div style={{ gridColumn: 'span 3' }}>
              <HoloCard title="Active Sessions" color={THEME.warning}>
                 <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%', paddingBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 42, fontWeight: 'bold', color: '#fff' }}>{metrics.activeConnections}</div>
                      <div style={{ fontSize: 12, color: THEME.textMuted }}>of 100 Max Connections</div>
                    </div>
                    <Activity size={48} color={THEME.warning} style={{ opacity: 0.5 }} />
                 </div>
              </HoloCard>
            </div>

            {/* Middle Row */}
            <div style={{ gridColumn: 'span 8', height: 350 }}>
              <HoloCard title="Cluster Topology & Health" color={THEME.success}>
                <TopologyMap />
              </HoloCard>
            </div>

            <div style={{ gridColumn: 'span 4', height: 350 }}>
               <HoloCard title="Live System Logs" color={THEME.textMuted} rightContent={<div style={{ width: 8, height: 8, background: THEME.danger, borderRadius: '50%', animation: 'pulse 1s infinite' }} />}>
                 <div style={{ overflowY: 'auto', height: '100%', paddingRight: 5, fontSize: 11, fontFamily: 'monospace' }}>
                    {logs.map(log => (
                      <div key={log.id} style={{ marginBottom: 8, borderLeft: `2px solid ${log.type === 'ERROR' ? THEME.danger : log.type === 'WARN' ? THEME.warning : THEME.success}`, paddingLeft: 8 }}>
                        <span style={{ color: THEME.textMuted, opacity: 0.7 }}>[{log.timestamp}]</span>
                        <span style={{ color: log.type === 'ERROR' ? THEME.danger : log.type === 'WARN' ? THEME.warning : THEME.success, fontWeight: 'bold', marginLeft: 6 }}>{log.type}</span>
                        <div style={{ color: THEME.textMain, marginTop: 2 }}>{log.message}</div>
                      </div>
                    ))}
                 </div>
               </HoloCard>
            </div>
          </div>
        );
      case 'tracing':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, height: 'calc(100vh - 140px)', animation: 'slideUp 0.3s' }}>
             <HoloCard title="Slow Query Log" color={THEME.warning}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                 {[1,2,3,4].map(i => (
                   <div key={i} onClick={() => setSelectedTrace(i)} style={{ 
                     padding: 12, borderRadius: 8, 
                     background: selectedTrace === i ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                     border: selectedTrace === i ? `1px solid ${THEME.primary}` : '1px solid transparent',
                     cursor: 'pointer'
                   }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
                        <span>SELECT * FROM orders...</span>
                        <span style={{ color: THEME.danger }}>420ms</span>
                     </div>
                     <div style={{ fontSize: 10, color: THEME.textMuted, marginTop: 4 }}>
                       User: app_svc • DB: production
                     </div>
                   </div>
                 ))}
               </div>
             </HoloCard>

             <HoloCard title="Query Execution Plan (Waterfall)" color={THEME.ai}>
               {selectedTrace ? (
                 <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ background: '#0f172a', padding: 12, borderRadius: 8, fontFamily: 'monospace', fontSize: 12, color: THEME.textMain, marginBottom: 20 }}>
                       SELECT * FROM orders WHERE user_id = 9201 AND status = 'PENDING' ORDER BY created_at DESC;
                    </div>
                    <QueryWaterfall />
                    <div style={{ marginTop: 'auto', borderTop: `1px solid ${THEME.grid}`, paddingTop: 16 }}>
                      <h4 style={{ color: THEME.ai, margin: '0 0 8px 0', fontSize: 12 }}>AI OPTIMIZATION INSIGHT</h4>
                      <p style={{ color: THEME.textMuted, fontSize: 12, lineHeight: 1.5 }}>
                        The query performs a heap fetch because the index <code>idx_orders_uid</code> does not include the <code>status</code> column. 
                        <span style={{ color: THEME.success, display: 'block', marginTop: 8 }}>Recommendation: Create composite index (user_id, status).</span>
                      </p>
                    </div>
                 </div>
               ) : (
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: THEME.textMuted }}>
                   Select a query to analyze execution path.
                 </div>
               )}
             </HoloCard>
          </div>
        );
      default:
        return <div style={{ color: 'white', padding: 20 }}>Module under construction...</div>;
    }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', background: THEME.bg, display: 'flex', overflow: 'hidden', color: THEME.textMain, fontFamily: 'Inter, sans-serif' }}>
       {/* Global Styles for Animations */}
       <style>{`
         @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(244, 63, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); } }
         @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
         @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
       `}</style>

       {/* Sidebar */}
       <aside style={{ width: 240, background: 'rgba(2, 6, 23, 0.9)', borderRight: `1px solid ${THEME.grid}`, display: 'flex', flexDirection: 'column', zIndex: 20 }}>
          <div style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
             <div style={{ width: 32, height: 32, background: THEME.primary, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 15px ${THEME.primary}60` }}>
                <Database color="white" size={18} />
             </div>
             <div>
                <div style={{ fontWeight: 'bold', fontSize: 14 }}>PG Monitor</div>
                <div style={{ fontSize: 10, color: THEME.success, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, background: THEME.success, borderRadius: '50%' }} /> ONLINE
                </div>
             </div>
          </div>

          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
             {[
               { id: 'overview', icon: Activity, label: 'Cluster View' },
               { id: 'tracing', icon: Search, label: 'Query Tracing' },
               { id: 'resources', icon: HardDrive, label: 'Resources' },
               { id: 'topology', icon: Network, label: 'Topology' },
               { id: 'settings', icon: Settings, label: 'Settings' }
             ].map(tab => (
               <button 
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 style={{ 
                   display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', 
                   background: activeTab === tab.id ? 'linear-gradient(90deg, rgba(14, 165, 233, 0.1), transparent)' : 'transparent',
                   border: 'none', borderLeft: activeTab === tab.id ? `3px solid ${THEME.primary}` : '3px solid transparent',
                   color: activeTab === tab.id ? '#fff' : THEME.textMuted,
                   cursor: 'pointer', transition: 'all 0.2s', fontSize: 13, fontWeight: 500
                 }}
               >
                 <tab.icon size={18} color={activeTab === tab.id ? THEME.primary : THEME.textMuted} />
                 {tab.label}
               </button>
             ))}
          </div>
          
          <div style={{ marginTop: 'auto', padding: 20, borderTop: `1px solid ${THEME.grid}` }}>
             <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, color: THEME.textMuted, background: 'transparent', border: 'none', cursor: 'pointer' }}>
               <LogOut size={16} /> Logout
             </button>
          </div>
       </aside>

       {/* Main Content */}
       <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {/* Background Grid FX */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${THEME.grid} 1px, transparent 1px)`, backgroundSize: '40px 40px', opacity: 0.2, pointerEvents: 'none' }} />
          
          <header style={{ height: 64, borderBottom: `1px solid ${THEME.grid}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', backdropFilter: 'blur(10px)', background: 'rgba(2, 6, 23, 0.5)' }}>
             <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', letterSpacing: '-0.5px' }}>
               {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Dashboard
             </h2>
             <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ padding: '6px 12px', background: 'rgba(59, 130, 246, 0.1)', border: `1px solid ${THEME.primary}30`, borderRadius: 20, fontSize: 11, color: THEME.primary }}>
                   US-East-1 Prod
                </div>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${THEME.grid}` }}>
                   <UserIcon size={16} color={THEME.textMuted} />
                </div>
             </div>
          </header>

          <div style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
             {renderContent()}
          </div>
       </main>
    </div>
  );
};

// --- AUTH MOCK (Kept similar but integrated) ---
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

   // ... Reuse your specific login UI logic here, replaced with advanced visual style below ...

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
               <div style={{ width: 48, height: 48, background: THEME.primary, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: `0 0 20px ${THEME.primary}60` }}>
                  <Database color="white" size={24} />
               </div>
               <h1 style={{ fontSize: 24, fontWeight: 'bold', color: 'white', margin: 0 }}>PG Monitor Pro</h1>
               <p style={{ color: THEME.textMuted, fontSize: 14, marginTop: 8 }}>Enterprise Database Observability</p>
            </div>

            <button 
               onClick={() => setModalOpen(true)}
               style={{ 
                 width: '100%', padding: '14px', borderRadius: 12, border: `1px solid ${THEME.grid}`, 
                 background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 14, fontWeight: 500,
                 display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer',
                 transition: 'all 0.2s'
               }}
               onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
               onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
            >
               <Chrome size={18} /> Sign in with Google
            </button>
            
            {/* Simple footer credential hint */}
            <div style={{ marginTop: 24, fontSize: 12, color: THEME.textMuted, textAlign: 'center' }}>
               Secure Enterprise SSO
            </div>
         </div>

         {/* Google Modal Overlay */}
         {modalOpen && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ background: 'white', width: 380, borderRadius: 8, padding: 32, position: 'relative' }}>
                  <button onClick={() => setModalOpen(false)} style={{ position: 'absolute', top: 12, right: 12, border: 'none', background: 'transparent', cursor: 'pointer' }}><X size={20} color="#555" /></button>
                  <Chrome size={40} color="#4285F4" style={{ marginBottom: 16 }} />
                  <h3 style={{ margin: '0 0 8px 0', color: '#333', fontSize: 20 }}>Sign in with Google</h3>
                  <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>to continue to PG Monitor Pro</p>
                  <form onSubmit={(e) => { e.preventDefault(); handleGoogleLogin(e.target.email.value, e.target.email.value.split('@')[0]); }}>
                     <input name="email" type="email" placeholder="Email" required style={{ width: '100%', padding: 12, marginBottom: 20, borderRadius: 4, border: '1px solid #ddd', fontSize: 14 }} />
                     <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" style={{ background: '#1a73e8', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}>Next</button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );

   return <PostgreSQLMonitor currentUser={user} onLogout={() => setUser(null)} />;
};

export default AuthWrapper;