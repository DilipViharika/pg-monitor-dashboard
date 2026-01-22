import React, { useState, useEffect } from 'react';
import {
  Activity, Database, HardDrive, Zap, Clock, AlertTriangle,
  TrendingUp, TrendingDown, Server, Lock, AlertCircle, CheckCircle,
  XCircle, Search, Cpu, Layers, FileText
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';

// --- THEME & CONSTANTS ---
const THEME = {
  bg: '#020617', // Deep Ink Black
  glass: 'rgba(15, 23, 42, 0.6)', // Glass panel background
  glassBorder: 'rgba(56, 189, 248, 0.1)', // Subtle border
  textMain: '#F8FAFC',
  textMuted: '#64748B',
  primary: '#0EA5E9', // Sky Blue
  secondary: '#8B5CF6', // Violet
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber
  danger: '#F43F5E', // Rose
  grid: '#1E293B'
};

// --- GLOBAL SVG FILTERS & GRADIENTS ---
const ChartDefs = () => (
  <svg style={{ height: 0, width: 0, position: 'absolute' }}>
    <defs>
      {/* Neon Glow Filter */}
      <filter id="neonGlow" height="300%" width="300%" x="-75%" y="-75%">
        <feGaussianBlur stdDeviation="5" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Gradients */}
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

// --- HELPER COMPONENTS ---

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
    {/* Decorative Glow */}
    <div style={{ position: 'absolute', top: -60, right: -60, width: 140, height: 140, background: `radial-gradient(circle, ${THEME.primary}15 0%, transparent 70%)`, pointerEvents: 'none' }} />
  </div>
);

const MetricCard = ({ icon: Icon, title, value, unit, subtitle, color = THEME.primary, sparkData }) => (
  <div
    style={{
      background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
      borderRadius: 12,
      border: `1px solid ${THEME.glassBorder}`,
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 12
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}30`, boxShadow: `0 0 15px ${color}20` }}>
        <Icon size={20} />
      </div>
      {sparkData && (
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

// --- MAIN MONITOR COMPONENT ---

const PostgreSQLMonitor = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data State
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

  // Data Generation
  useEffect(() => {
    // 30 Days Data
    setLast30Days(Array.from({ length: 30 }, (_, i) => ({
      date: new Date(new Date().setDate(new Date().getDate() - (29 - i))).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      qps: Math.floor(Math.random() * 800) + 1200,
      tps: Math.floor(Math.random() * 400) + 600,
      avgQuery: Math.random() * 30 + 30,
      errors: Math.floor(Math.random() * 15)
    })));

    // Distribution
    setQueryTimeDistribution([
      { range: '0-10ms', count: 45230 }, { range: '10-50ms', count: 18920 },
      { range: '50-100ms', count: 5430 }, { range: '100-500ms', count: 2120 },
      { range: '500ms-1s', count: 890 }, { range: '>1s', count: 310 }
    ]);

    // Growth
    setTableGrowth(Array.from({ length: 12 }, (_, i) => ({
      month: new Date(new Date().setMonth(new Date().getMonth() - (11 - i))).toLocaleDateString('en-US', { month: 'short' }),
      orders: 150 + i * 10, customers: 80 + i * 5, products: 40 + i * 2, transactions: 200 + i * 15
    })));

    // Top Errors
    setTopErrors([
      { type: 'Connection Timeout', count: 145, percentage: 38 },
      { type: 'Deadlock Detected', count: 89, percentage: 23 },
      { type: 'Query Timeout', count: 67, percentage: 17 },
      { type: 'Lock Wait Timeout', count: 45, percentage: 12 },
      { type: 'Constraint Violation', count: 38, percentage: 10 }
    ]);

    // Sparkline
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
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = seconds => `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;

  // --- TAB CONTENT SECTIONS ---

  const OverviewTab = () => (
    <>
      {/* Top Chart Section */}
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

      {/* Breakdown Section */}
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
                <Pie
                  data={[{ value: metrics.readWriteRatio }, { value: 100 - metrics.readWriteRatio }]}
                  cx="50%" cy="50%" innerRadius={70} outerRadius={90}
                  startAngle={90} endAngle={-270}
                  dataKey="value" stroke="none"
                >
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
        <GlassCard title="CPU Usage">
           <ResourceGauge label="Core Load" value={metrics.cpuUsage.toFixed(1)} color={metrics.cpuUsage > 80 ? THEME.danger : THEME.primary} />
        </GlassCard>
        <GlassCard title="Memory Usage">
           <ResourceGauge label={`${metrics.memoryUsed}GB Used`} value={metrics.memoryUsage.toFixed(1)} color={THEME.secondary} />
        </GlassCard>
        <GlassCard title="Disk Capacity">
           <ResourceGauge label={`${metrics.diskAvailable}GB Free`} value={metrics.diskUsed.toFixed(1)} color={THEME.warning} />
        </GlassCard>
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

  const ReliabilityTab = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <MetricCard icon={CheckCircle} title="Availability" value={metrics.availability} unit="%" color={THEME.success} />
        <MetricCard icon={XCircle} title="Downtime Incidents" value={metrics.downtimeIncidents} color={THEME.danger} />
        <MetricCard icon={AlertCircle} title="Error Rate" value={metrics.errorRate.toFixed(1)} unit="/min" color={THEME.warning} />
        <MetricCard icon={Lock} title="Deadlocks" value={metrics.deadlockCount} color={THEME.secondary} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        <GlassCard title="Connection Health">
           <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: THEME.textMain }}>
                    <span>Active Connections</span>
                    <span style={{ fontFamily: 'monospace' }}>{metrics.activeConnections} / {metrics.maxConnections}</span>
                 </div>
                 <NeonProgressBar value={metrics.activeConnections} max={metrics.maxConnections} color={THEME.primary} />
              </div>
              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: THEME.textMain }}>
                    <span>Idle Connections</span>
                    <span style={{ fontFamily: 'monospace' }}>{metrics.idleConnections} / {metrics.maxConnections}</span>
                 </div>
                 <NeonProgressBar value={metrics.idleConnections} max={metrics.maxConnections} color={THEME.textMuted} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
                 <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: `1px solid ${THEME.danger}40`, padding: 12, borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: THEME.danger }}>{metrics.failedConnections}</div>
                    <div style={{ fontSize: 10, color: THEME.danger, textTransform: 'uppercase' }}>Failed Attempts</div>
                 </div>
                 <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: `1px solid ${THEME.warning}40`, padding: 12, borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: THEME.warning }}>{metrics.connectionWaitTime}ms</div>
                    <div style={{ fontSize: 10, color: THEME.warning, textTransform: 'uppercase' }}>Wait Time</div>
                 </div>
              </div>
           </div>
        </GlassCard>

        <GlassCard title="Top Error Types">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
             {topErrors.map((error, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                   <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                         <span style={{ color: THEME.textMain }}>{error.type}</span>
                         <span style={{ color: THEME.danger }}>{error.percentage}%</span>
                      </div>
                      <NeonProgressBar value={error.percentage} max={100} color={THEME.danger} />
                   </div>
                   <div style={{ fontSize: 11, color: THEME.textMuted, width: 50, textAlign: 'right' }}>{error.count}</div>
                </div>
             ))}
          </div>
        </GlassCard>
      </div>
    </>
  );

  const IndexesTab = () => (
    <>
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 24 }}>
         <MetricCard icon={TrendingUp} title="Index Hit Ratio" value={metrics.indexHitRatio.toFixed(1)} unit="%" color={THEME.success} />
         <MetricCard icon={AlertTriangle} title="Missing Indexes" value={metrics.missingIndexes} color={THEME.warning} />
         <MetricCard icon={AlertCircle} title="Unused Indexes" value={metrics.unusedIndexes} color={THEME.secondary} />
       </div>

       <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
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
                   <p style={{ margin: '8px 0 0 0', fontSize: 12, color: THEME.textMuted, padding: '0 20px', lineHeight: 1.5 }}>
                      {metrics.fragmentationLevel > 30 ? 'Critical levels detected. Schedule VACUUM FULL.' : 'Fragmentation within healthy operational limits.'}
                   </p>
                </div>
             </div>
          </GlassCard>
       </div>
    </>
  );

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
          * { box-sizing: border-box; }
          body { margin: 0; background-color: ${THEME.bg}; color: ${THEME.textMain}; font-family: 'Inter', sans-serif; overflow: hidden; }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        `}
      </style>
      
      <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
        {/* SIDEBAR */}
        <aside style={{ width: 260, background: 'rgba(2, 6, 23, 0.95)', borderRight: `1px solid ${THEME.grid}`, display: 'flex', flexDirection: 'column', zIndex: 10 }}>
          <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
               <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${THEME.primary}40` }}>
                 <Database color="#fff" size={20} />
               </div>
               <div>
                 <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.5px' }}>PG Monitor</div>
                 <div style={{ fontSize: 11, color: THEME.success, fontWeight: 600 }}>PROD-01 • Active</div>
               </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
               {[
                 { id: 'overview', label: 'Overview', icon: Activity },
                 { id: 'performance', label: 'Performance', icon: Zap },
                 { id: 'resources', label: 'Resources', icon: HardDrive },
                 { id: 'reliability', label: 'Reliability', icon: CheckCircle },
                 { id: 'indexes', label: 'Indexes', icon: Layers },
               ].map(item => (
                 <button
                   key={item.id}
                   onClick={() => setActiveTab(item.id)}
                   style={{
                     display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                     background: activeTab === item.id ? `linear-gradient(90deg, ${THEME.primary}20, transparent)` : 'transparent',
                     border: 'none', borderLeft: activeTab === item.id ? `3px solid ${THEME.primary}` : '3px solid transparent',
                     color: activeTab === item.id ? THEME.primary : THEME.textMuted,
                     cursor: 'pointer', fontSize: 14, fontWeight: 500, borderRadius: '0 8px 8px 0', transition: 'all 0.2s'
                   }}
                 >
                   <item.icon size={18} />
                   {item.label}
                 </button>
               ))}
            </div>
          </div>
          
          <div style={{ marginTop: 'auto', padding: 24, borderTop: `1px solid ${THEME.grid}` }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: THEME.success }}>
                <span style={{ width: 8, height: 8, background: THEME.success, borderRadius: '50%', boxShadow: `0 0 10px ${THEME.success}` }} />
                System Healthy
             </div>
             <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4, fontFamily: 'monospace' }}>Uptime: {formatUptime(metrics.uptime)}</div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <header style={{ height: 70, borderBottom: `1px solid ${THEME.grid}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(10px)' }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: THEME.textMain, letterSpacing: '-0.5px' }}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Dashboard
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
               <div style={{ padding: '6px 12px', borderRadius: 20, border: `1px solid ${THEME.warning}40`, background: `${THEME.warning}10`, color: THEME.warning, fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={12} />
                  <span>High Fragmentation</span>
               </div>
               <div style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${THEME.grid}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Search size={16} color={THEME.textMuted} />
               </div>
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
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default PostgreSQLMonitor;