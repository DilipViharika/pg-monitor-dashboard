import React, { useState, useEffect } from 'react';
import {
  Activity, Database, HardDrive, Zap, Clock, AlertTriangle,
  TrendingUp, TrendingDown, Server, Lock, AlertCircle, CheckCircle,
  XCircle, Search, Cpu, Layers
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';

// --- THEME & CONSTANTS ---
const THEME = {
  bg: '#020617', // Ink Black
  glass: 'rgba(15, 23, 42, 0.6)',
  glassBorder: 'rgba(56, 189, 248, 0.1)',
  textMain: '#F8FAFC',
  textMuted: '#64748B',
  primary: '#0EA5E9', // Sky Blue
  secondary: '#8B5CF6', // Violet
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber
  danger: '#F43F5E', // Rose
  grid: '#1E293B'
};

// --- GLOBAL SVG FILTERS (THE SECRET SAUCE) ---
// This component defines the glow effects used by Recharts
const ChartDefs = () => (
  <svg style={{ height: 0, width: 0, position: 'absolute' }}>
    <defs>
      {/* 1. Neon Glow Filter */}
      <filter id="neonGlow" height="300%" width="300%" x="-75%" y="-75%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* 2. Area Gradients */}
      <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.4} />
        <stop offset="100%" stopColor={THEME.primary} stopOpacity={0} />
      </linearGradient>
      
      <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={THEME.success} stopOpacity={0.4} />
        <stop offset="100%" stopColor={THEME.success} stopOpacity={0} />
      </linearGradient>

      {/* 3. Bar Gradients */}
      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={THEME.secondary} stopOpacity={1} />
        <stop offset="100%" stopColor={THEME.primary} stopOpacity={0.6} />
      </linearGradient>
    </defs>
  </svg>
);

// --- COMPONENTS ---

const GlassCard = ({ children, title, rightNode, className, style }) => (
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
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, zIndex: 2 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: THEME.textMain, textTransform: 'uppercase', letterSpacing: '1px' }}>
        {title}
      </h3>
      {rightNode}
    </div>
    <div style={{ flex: 1, minHeight: 0, position: 'relative', zIndex: 1 }}>{children}</div>
    
    {/* Decorative background glow */}
    <div style={{
      position: 'absolute', top: -50, right: -50, width: 150, height: 150,
      background: `radial-gradient(circle, ${THEME.primary}10 0%, transparent 70%)`,
      pointerEvents: 'none'
    }} />
  </div>
);

// Advanced Metric Card with Sparkline
const MetricCard = ({ icon: Icon, title, value, unit, subtitle, sparkData, color = THEME.primary }) => (
  <div
    style={{
      background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.7) 100%)',
      borderRadius: 12,
      border: `1px solid ${THEME.glassBorder}`,
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <div style={{ 
        width: 36, height: 36, borderRadius: 8, 
        background: `${color}15`, color: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${color}30`
      }}>
        <Icon size={18} />
      </div>
      {sparkData && (
        <div style={{ width: 60, height: 30 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
    
    <div>
      <div style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: THEME.textMain, fontFamily: 'monospace' }}>
          {value}
        </span>
        {unit && <span style={{ fontSize: 12, color: THEME.textMuted }}>{unit}</span>}
      </div>
      {subtitle && <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>{subtitle}</div>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'rgba(2, 6, 23, 0.9)',
        border: `1px solid ${THEME.glassBorder}`,
        borderRadius: 8,
        padding: '12px',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)'
      }}>
        <p style={{ color: THEME.textMuted, fontSize: 11, marginBottom: 8, fontFamily: 'monospace' }}>{label}</p>
        {payload.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: entry.color, boxShadow: `0 0 5px ${entry.color}` }} />
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

// Radial Gauge for Resources
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
        <div style={{ fontSize: 28, fontWeight: 700, color: THEME.textMain, fontFamily: 'monospace' }}>{value}%</div>
        <div style={{ fontSize: 11, color: THEME.textMuted, textTransform: 'uppercase' }}>{label}</div>
      </div>
    </div>
  );
};

const PostgreSQLMonitor = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fake Data State
  const [metrics, setMetrics] = useState({
    avgQueryTime: 45.2, slowQueryCount: 23, qps: 1847, tps: 892,
    selectPerSec: 1245, insertPerSec: 342, updatePerSec: 198, deletePerSec: 62,
    readWriteRatio: 68, cpuUsage: 42.5, cpuAvg: 38.2,
    memoryUsage: 67.8, memoryAllocated: 16, memoryUsed: 10.8,
    diskUsed: 54.3, diskAvailable: 456, diskTotal: 1000,
    diskIOReadRate: 245, diskIOWriteRate: 128, diskIOLatency: 8.5,
    activeConnections: 45, maxConnections: 100,
    uptime: 2592000, availability: 99.94, errorRate: 3.2,
    indexHitRatio: 96.7, fragmentationLevel: 23.4
  });

  const [last30Days, setLast30Days] = useState([]);
  const [queryTimeDistribution, setQueryTimeDistribution] = useState([]);
  const [sparklineData, setSparklineData] = useState([]);

  // Init Data
  useEffect(() => {
    // 30 Days Area Chart
    const thirtyDayData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        qps: Math.floor(Math.random() * 800) + 1200,
        tps: Math.floor(Math.random() * 400) + 600,
        avgQuery: Math.random() * 30 + 30,
        errors: Math.floor(Math.random() * 15)
      };
    });
    setLast30Days(thirtyDayData);

    // Distribution
    setQueryTimeDistribution([
      { range: '0-10ms', count: 45230 },
      { range: '10-50ms', count: 18920 },
      { range: '50-100ms', count: 5430 },
      { range: '100-500ms', count: 2120 },
      { range: '500ms-1s', count: 890 },
      { range: '>1s', count: 310 }
    ]);

    // Sparklines for Cards
    setSparklineData(Array.from({ length: 15 }, () => ({ value: Math.random() * 100 })));

  }, []);

  // Live Tick
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        qps: Math.floor(Math.random() * 600) + 1400,
        cpuUsage: 30 + Math.random() * 30,
        diskIOReadRate: Math.floor(Math.random() * 100) + 200,
      }));
      setSparklineData(prev => [...prev.slice(1), { value: Math.random() * 100 }]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = seconds => `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;

  // --- TABS ---

  const OverviewTab = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 24, marginBottom: 24 }}>
        <GlassCard title="Live Cluster Activity">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={last30Days} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <ChartDefs /> {/* Inject Filters */}
              <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: THEME.textMuted }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 11, fill: THEME.textMuted }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              
              {/* Neon Glow Line with Gradient Fill */}
              <Area 
                type="monotone" 
                dataKey="qps" 
                stroke={THEME.primary} 
                strokeWidth={3}
                fill="url(#primaryGradient)" 
                name="QPS (Queries/Sec)"
                filter="url(#neonGlow)" // THE GLOW
                animationDuration={1500}
              />
              <Area 
                type="monotone" 
                dataKey="tps" 
                stroke={THEME.success} 
                strokeWidth={3}
                fill="url(#successGradient)" 
                name="TPS (Trans/Sec)"
                filter="url(#neonGlow)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <MetricCard 
            icon={Zap} 
            title="Current QPS" 
            value={metrics.qps} 
            color={THEME.primary}
            sparkData={sparklineData}
          />
          <MetricCard 
            icon={Activity} 
            title="Avg Latency" 
            value={metrics.avgQueryTime.toFixed(1)} 
            unit="ms" 
            color={THEME.warning}
          />
          <MetricCard 
            icon={AlertTriangle} 
            title="Slow Queries" 
            value={metrics.slowQueryCount} 
            color={THEME.danger}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
        <GlassCard title="Read / Write Distribution">
          <div style={{ height: 200, position: 'relative' }}>
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ value: metrics.readWriteRatio }, { value: 100 - metrics.readWriteRatio }]}
                  cx="50%" cy="50%" innerRadius={60} outerRadius={80}
                  startAngle={90} endAngle={-270}
                  dataKey="value" stroke="none"
                >
                  <Cell fill={THEME.primary} filter="url(#neonGlow)" />
                  <Cell fill="#1e293b" />
                </Pie>
              </PieChart>
             </ResponsiveContainer>
             <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: THEME.textMain }}>{metrics.readWriteRatio}%</div>
                <div style={{ fontSize: 10, color: THEME.primary }}>READ HEAVY</div>
             </div>
          </div>
        </GlassCard>

        <GlassCard title="Cache Hit Ratio">
           <div style={{ height: 200, position: 'relative' }}>
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ value: metrics.indexHitRatio }, { value: 100 - metrics.indexHitRatio }]}
                  cx="50%" cy="50%" innerRadius={60} outerRadius={80}
                  startAngle={90} endAngle={-270}
                  dataKey="value" stroke="none"
                >
                  <Cell fill={THEME.success} filter="url(#neonGlow)" />
                  <Cell fill="#1e293b" />
                </Pie>
              </PieChart>
             </ResponsiveContainer>
             <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: THEME.textMain }}>{metrics.indexHitRatio}%</div>
                <div style={{ fontSize: 10, color: THEME.success }}>OPTIMIZED</div>
             </div>
          </div>
        </GlassCard>
        
        <GlassCard title="Active Connections">
           <div style={{ height: 200, position: 'relative' }}>
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ value: metrics.activeConnections }, { value: metrics.maxConnections - metrics.activeConnections }]}
                  cx="50%" cy="50%" innerRadius={60} outerRadius={80}
                  startAngle={90} endAngle={-270}
                  dataKey="value" stroke="none"
                >
                  <Cell fill={THEME.secondary} filter="url(#neonGlow)" />
                  <Cell fill="#1e293b" />
                </Pie>
              </PieChart>
             </ResponsiveContainer>
             <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: THEME.textMain }}>{metrics.activeConnections}</div>
                <div style={{ fontSize: 10, color: THEME.secondary }}>/ {metrics.maxConnections} MAX</div>
             </div>
          </div>
        </GlassCard>
      </div>
    </>
  );

  const ResourcesTab = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 24 }}>
        <GlassCard title="CPU Load">
           <ResourceGauge label="Core Usage" value={metrics.cpuUsage.toFixed(1)} color={THEME.danger} />
        </GlassCard>
        <GlassCard title="Memory Allocation">
           <ResourceGauge label="RAM Usage" value={metrics.memoryUsage.toFixed(1)} color={THEME.secondary} />
        </GlassCard>
        <GlassCard title="Disk Volume">
           <ResourceGauge label="Storage" value={metrics.diskUsed.toFixed(1)} color={THEME.warning} />
        </GlassCard>
      </div>

      <GlassCard title="I/O Throughput History">
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={last30Days.slice(-15)} barSize={20}>
                <ChartDefs />
                <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: THEME.textMuted }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="qps" name="Read IOPS" fill="url(#barGradient)" radius={[4, 4, 0, 0]} filter="url(#neonGlow)" />
                <Bar dataKey="tps" name="Write IOPS" fill={THEME.success} radius={[4, 4, 0, 0]} opacity={0.5} />
            </BarChart>
        </ResponsiveContainer>
      </GlassCard>
    </>
  );

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
          * { box-sizing: border-box; }
          body { 
            margin: 0; 
            background-color: ${THEME.bg}; 
            color: ${THEME.textMain}; 
            font-family: 'Inter', sans-serif; 
            overflow: hidden;
          }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        `}
      </style>
      
      <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
        {/* SIDEBAR */}
        <aside style={{ 
          width: 260, 
          background: 'rgba(2, 6, 23, 0.95)', 
          borderRight: `1px solid ${THEME.grid}`, 
          display: 'flex', flexDirection: 'column',
          zIndex: 10
        }}>
          <div style={{ padding: 24, borderBottom: `1px solid ${THEME.grid}` }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ 
                  width: 40, height: 40, borderRadius: 10, 
                  background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 15px ${THEME.primary}40`
                }}>
                  <Database color="#fff" size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.5px' }}>PG Admin</div>
                  <div style={{ fontSize: 11, color: THEME.success, fontWeight: 600 }}>Connected • v15.2</div>
                </div>
             </div>
          </div>

          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
             {[
               { id: 'overview', label: 'Overview', icon: Activity },
               { id: 'resources', label: 'System Resources', icon: Server },
               { id: 'performance', label: 'Query Performance', icon: Zap },
               { id: 'maintenance', label: 'Maintenance', icon: Layers },
             ].map(item => {
               const active = activeTab === item.id;
               const Icon = item.icon;
               return (
                 <button
                   key={item.id}
                   onClick={() => setActiveTab(item.id)}
                   style={{
                     display: 'flex', alignItems: 'center', gap: 12,
                     padding: '12px 16px',
                     background: active ? `linear-gradient(90deg, ${THEME.primary}20, transparent)` : 'transparent',
                     border: 'none',
                     borderLeft: active ? `3px solid ${THEME.primary}` : '3px solid transparent',
                     color: active ? THEME.primary : THEME.textMuted,
                     cursor: 'pointer',
                     fontSize: 14, fontWeight: 500,
                     transition: 'all 0.2s',
                     borderRadius: '0 8px 8px 0'
                   }}
                 >
                   <Icon size={18} />
                   {item.label}
                 </button>
               )
             })}
          </div>

          <div style={{ marginTop: 'auto', padding: 24 }}>
             <div style={{ background: '#1e293b', borderRadius: 12, padding: 16, border: '1px solid #334155' }}>
                <div style={{ fontSize: 12, color: THEME.textMuted, marginBottom: 8 }}>Uptime</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: THEME.success, fontFamily: 'monospace' }}>
                   {formatUptime(metrics.uptime)}
                </div>
             </div>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <header style={{ 
            height: 70, borderBottom: `1px solid ${THEME.grid}`, 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 32px', background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(10px)'
          }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: THEME.textMain }}>
              {activeTab === 'overview' ? 'Cluster Overview' : 'System Resources'}
            </h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1e293b', padding: '6px 12px', borderRadius: 20, border: '1px solid #334155' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: THEME.success, boxShadow: `0 0 8px ${THEME.success}` }}></div>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>Healthy</span>
               </div>
               <div style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Search size={16} color={THEME.textMuted} />
               </div>
            </div>
          </header>

          <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>
              <ChartDefs /> {/* Inject SVG Filters once */}
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'resources' && <ResourcesTab />}
              {(activeTab === 'performance' || activeTab === 'maintenance') && (
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: THEME.textMuted }}>
                    Demo View - Select Overview or Resources
                 </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default PostgreSQLMonitor;