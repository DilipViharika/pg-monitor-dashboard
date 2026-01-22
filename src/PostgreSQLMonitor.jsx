import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Database,
  HardDrive,
  Zap,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Server,
  Lock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Cpu
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';

// --- THEME CONSTANTS ---
const THEME = {
  bg: '#0B1121', // Deep rich dark blue
  cardBg: '#151e32', // Slightly lighter panel
  cardBorder: '#2A3655',
  textMain: '#F8FAFC',
  textMuted: '#94A3B8',
  accentPrimary: '#38BDF8', // Sky Blue
  accentSecondary: '#818CF8', // Indigo
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  grid: '#334155'
};

const COLORS = [THEME.accentPrimary, THEME.success, THEME.warning, THEME.danger, THEME.accentSecondary];

// --- REUSABLE COMPONENTS ---

// 1. Advanced Card with subtle glow and glass feel
const GlassCard = ({ children, title, rightNode, className, style }) => (
  <div
    style={{
      background: THEME.cardBg,
      borderRadius: 16,
      border: `1px solid ${THEME.cardBorder}`,
      padding: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      ...style
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: THEME.textMain, letterSpacing: '0.5px' }}>{title}</h3>
      {rightNode}
    </div>
    <div style={{ flex: 1, position: 'relative' }}>{children}</div>
  </div>
);

// 2. Metric Card with Gradient Icon
const MetricCard = ({ icon: Icon, title, value, unit, subtitle, trend }) => (
  <div
    style={{
      background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: 12,
      border: `1px solid ${THEME.cardBorder}`,
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'rgba(56, 189, 248, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: THEME.accentPrimary
          }}
        >
          <Icon size={16} />
        </div>
        <span style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</span>
      </div>
    </div>
    
    <div>
      <span style={{ fontSize: 24, fontWeight: 700, color: THEME.textMain }}>{value}</span>
      {unit && <span style={{ marginLeft: 4, fontSize: 13, color: THEME.textMuted }}>{unit}</span>}
    </div>

    {subtitle && (
      <div style={{ fontSize: 11, color: THEME.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}>
        {subtitle}
      </div>
    )}
  </div>
);

// 3. Custom Chart Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        border: `1px solid ${THEME.cardBorder}`,
        borderRadius: 8,
        padding: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)'
      }}>
        <p style={{ color: THEME.textMuted, fontSize: 11, marginBottom: 8 }}>{label}</p>
        {payload.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color }} />
            <span style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// 4. Progress Bar
const ProgressBar = ({ value, max, color, showPercentage }) => {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div style={{ width: '100%' }}>
      <div style={{ 
        width: '100%', 
        backgroundColor: 'rgba(255,255,255,0.05)', 
        borderRadius: 999, 
        height: 6, 
        overflow: 'hidden' 
      }}>
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: color || THEME.success,
            borderRadius: 999,
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: `0 0 10px ${color || THEME.success}40`
          }}
        />
      </div>
      {showPercentage && (
        <div style={{ textAlign: 'right', fontSize: 10, color: THEME.textMuted, marginTop: 4, fontWeight: 500 }}>
          {percentage.toFixed(1)}%
        </div>
      )}
    </div>
  );
};

const PostgreSQLMonitor = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // State Initialization (Identical to original)
  const [metrics, setMetrics] = useState({
    avgQueryTime: 45.2, slowQueryCount: 23, qps: 1847, tps: 892,
    selectPerSec: 1245, insertPerSec: 342, updatePerSec: 198, deletePerSec: 62,
    readWriteRatio: 68, cpuUsage: 42.5, cpuAvg: 38.2,
    memoryUsage: 67.8, memoryAllocated: 16, memoryUsed: 10.8,
    diskUsed: 54.3, diskAvailable: 456, diskTotal: 1000,
    diskIOReadRate: 245, diskIOWriteRate: 128, diskIOLatency: 8.5,
    activeConnections: 45, idleConnections: 23, totalConnections: 68, maxConnections: 100,
    failedConnections: 12, connectionWaitTime: 125,
    uptime: 2592000, availability: 99.94, downtimeIncidents: 2,
    errorRate: 3.2, failedQueries: 18, deadlockCount: 5, lockWaitTime: 234,
    criticalAlerts: 2, warningAlerts: 8, infoAlerts: 15,
    indexHitRatio: 96.7, missingIndexes: 7, unusedIndexes: 12,
    tableScanRate: 15.3, fragmentationLevel: 23.4
  });

  const [last30Days, setLast30Days] = useState([]);
  const [queryTimeDistribution, setQueryTimeDistribution] = useState([]);
  const [tableGrowth, setTableGrowth] = useState([]);
  const [topErrors, setTopErrors] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);

  // Mock Data Generators
  useEffect(() => {
    // Generate Last 30 Days Data
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

    // Distribution Data
    setQueryTimeDistribution([
      { range: '0-10ms', count: 45230, percentage: 62 },
      { range: '10-50ms', count: 18920, percentage: 26 },
      { range: '50-100ms', count: 5430, percentage: 7.5 },
      { range: '100-500ms', count: 2120, percentage: 2.9 },
      { range: '500ms-1s', count: 890, percentage: 1.2 },
      { range: '>1s', count: 310, percentage: 0.4 }
    ]);

    // Growth Data
    const growthData = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        orders: Math.floor(Math.random() * 50) + 150 + (i * 10),
        customers: Math.floor(Math.random() * 30) + 80 + (i * 5),
        products: Math.floor(Math.random() * 20) + 40 + (i * 2),
        transactions: Math.floor(Math.random() * 70) + 200 + (i * 15)
      };
    });
    setTableGrowth(growthData);

    setTopErrors([
      { type: 'Connection Timeout', count: 145, percentage: 38 },
      { type: 'Deadlock Detected', count: 89, percentage: 23 },
      { type: 'Query Timeout', count: 67, percentage: 17 },
      { type: 'Lock Wait Timeout', count: 45, percentage: 12 },
      { type: 'Constraint Violation', count: 38, percentage: 10 }
    ]);

    setRecentAlerts([
      { severity: 'critical', message: 'CPU usage exceeded 90%', time: '5 min ago', resolved: false },
      { severity: 'warning', message: 'High slow queries detected', time: '12 min ago', resolved: false },
      { severity: 'critical', message: 'Connection pool capacity', time: '18 min ago', resolved: true },
      { severity: 'warning', message: 'Disk I/O latency spike', time: '35 min ago', resolved: true },
      { severity: 'info', message: 'Table fragmentation > 20%', time: '1 hr ago', resolved: false }
    ]);
  }, []);

  // Live Updates Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        avgQueryTime: 30 + Math.random() * 40,
        slowQueryCount: Math.floor(Math.random() * 30) + 10,
        qps: Math.floor(Math.random() * 600) + 1400,
        tps: Math.floor(Math.random() * 300) + 700,
        selectPerSec: Math.floor(Math.random() * 400) + 1000,
        insertPerSec: Math.floor(Math.random() * 150) + 250,
        updatePerSec: Math.floor(Math.random() * 100) + 150,
        deletePerSec: Math.floor(Math.random() * 50) + 40,
        cpuUsage: 30 + Math.random() * 30,
        memoryUsage: 60 + Math.random() * 15,
        diskIOReadRate: Math.floor(Math.random() * 100) + 200,
        diskIOWriteRate: Math.floor(Math.random() * 80) + 100,
        diskIOLatency: 5 + Math.random() * 10,
        errorRate: Math.random() * 5
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = seconds => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  };

  // --- TAB CONTENT RENDERERS ---

  const OverviewTab = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 24, marginBottom: 24 }}>
        {/* Main Chart */}
        <GlassCard title="Database Activity – Last 30 Days">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={last30Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorQps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={THEME.accentPrimary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={THEME.accentPrimary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={THEME.success} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={THEME.success} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: THEME.textMuted }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 11, fill: THEME.textMuted }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
              <Area type="monotone" dataKey="qps" stroke={THEME.accentPrimary} strokeWidth={2} fillOpacity={1} fill="url(#colorQps)" name="QPS" activeDot={{ r: 6, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="tps" stroke={THEME.success} strokeWidth={2} fillOpacity={1} fill="url(#colorTps)" name="TPS" activeDot={{ r: 6, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="avgQuery" stroke={THEME.warning} strokeWidth={2} dot={false} name="Avg Query (ms)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Side Metrics */}
        <GlassCard title="Key Performance Metrics">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <MetricCard icon={Clock} title="Avg Query" value={metrics.avgQueryTime.toFixed(1)} unit="ms" />
            <MetricCard icon={AlertCircle} title="Slow Queries" value={metrics.slowQueryCount} />
            <MetricCard icon={Zap} title="QPS" value={metrics.qps} />
            <MetricCard icon={Activity} title="TPS" value={metrics.tps} />
            <MetricCard icon={Cpu} title="CPU Usage" value={metrics.cpuUsage.toFixed(1)} unit="%" />
            <MetricCard icon={Database} title="Memory" value={metrics.memoryUsage.toFixed(1)} unit="%" />
          </div>
        </GlassCard>
      </div>

      {/* OPS + R/W Ratio */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24 }}>
        <GlassCard title="Operations Breakdown">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'SELECT', value: metrics.selectPerSec, color: THEME.accentPrimary },
              { label: 'INSERT', value: metrics.insertPerSec, color: THEME.success },
              { label: 'UPDATE', value: metrics.updatePerSec, color: THEME.warning },
              { label: 'DELETE', value: metrics.deletePerSec, color: THEME.danger }
            ].map((row) => (
              <div key={row.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, fontWeight: 500 }}>
                  <span style={{ color: THEME.textMain }}>{row.label}</span>
                  <span style={{ color: THEME.textMuted }}>{row.value}/s</span>
                </div>
                <ProgressBar value={row.value} max={2000} color={row.color} />
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard title="Read / Write Ratio">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Read', value: metrics.readWriteRatio },
                  { name: 'Write', value: 100 - metrics.readWriteRatio }
                ]}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={80}
                paddingAngle={5} dataKey="value"
                stroke="none"
              >
                <Cell fill={THEME.accentPrimary} />
                <Cell fill={THEME.success} />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill={THEME.textMain} fontSize={18} fontWeight={700}>
                {metrics.readWriteRatio}%
              </text>
              <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" fill={THEME.textMuted} fontSize={12}>
                Read
              </text>
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </>
  );

  const PerformanceTab = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24, marginBottom: 24 }}>
        <GlassCard title="Query Execution Time Distribution">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={queryTimeDistribution} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <defs>
                 <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={THEME.accentPrimary} stopOpacity={0.8}/>
                    <stop offset="100%" stopColor={THEME.accentPrimary} stopOpacity={0.3}/>
                 </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: THEME.textMuted }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 11, fill: THEME.textMuted }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="url(#barGradient)" radius={[4, 4, 0, 0]} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard title="Performance KPIs">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <MetricCard icon={Clock} title="Avg Query" value={metrics.avgQueryTime.toFixed(1)} unit="ms" />
            <MetricCard icon={AlertTriangle} title="Latency > 1s" value={metrics.slowQueryCount} subtitle="Critical Threshold: 50" />
            <MetricCard icon={Zap} title="Queries/sec" value={metrics.qps} />
            <MetricCard icon={Activity} title="Trans/sec" value={metrics.tps} />
          </div>
        </GlassCard>
      </div>

      <GlassCard title="Performance Trends (Last 10 Days)">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={last30Days.slice(-10)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: THEME.textMuted }} axisLine={false} tickLine={false} dy={10} />
            <YAxis tick={{ fontSize: 11, fill: THEME.textMuted }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="avgQuery" stroke={THEME.accentPrimary} strokeWidth={3} dot={{ r: 4, fill: THEME.bg, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Avg Query (ms)" />
            <Line type="monotone" dataKey="errors" stroke={THEME.danger} strokeWidth={3} dot={{ r: 4, fill: THEME.bg, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Errors" />
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>
    </>
  );

  const ResourcesTab = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 24 }}>
        <MetricCard icon={Cpu} title="CPU Usage" value={metrics.cpuUsage.toFixed(1)} unit="%" subtitle={`Avg Load: ${metrics.cpuAvg.toFixed(1)}%`} />
        <MetricCard icon={Database} title="Memory Usage" value={metrics.memoryUsage.toFixed(1)} unit="%" subtitle={`${metrics.memoryUsed}GB / ${metrics.memoryAllocated}GB`} />
        <MetricCard icon={HardDrive} title="Disk Usage" value={metrics.diskUsed.toFixed(1)} unit="%" subtitle={`${metrics.diskAvailable}GB Free`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24 }}>
        <GlassCard title="System Resources Detailed">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingTop: 10 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: THEME.textMuted }}>CPU Utilization</span>
                <span style={{ color: THEME.textMain, fontWeight: 600 }}>{metrics.cpuUsage.toFixed(1)}%</span>
              </div>
              <ProgressBar value={metrics.cpuUsage} max={100} color={metrics.cpuUsage > 80 ? THEME.danger : THEME.accentSecondary} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: THEME.textMuted }}>Memory Allocation</span>
                <span style={{ color: THEME.textMain, fontWeight: 600 }}>{metrics.memoryUsed}GB / {metrics.memoryAllocated}GB</span>
              </div>
              <ProgressBar value={metrics.memoryUsed} max={metrics.memoryAllocated} color={THEME.accentPrimary} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: THEME.textMuted }}>Storage</span>
                <span style={{ color: THEME.textMain, fontWeight: 600 }}>{(metrics.diskTotal - metrics.diskAvailable).toFixed(0)}GB / {metrics.diskTotal}GB</span>
              </div>
              <ProgressBar value={metrics.diskTotal - metrics.diskAvailable} max={metrics.diskTotal} color={THEME.warning} />
            </div>
          </div>
        </GlassCard>

        <GlassCard title="Disk I/O Operations">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Read Rate', value: metrics.diskIOReadRate, unit: 'ops/sec', icon: TrendingUp, color: THEME.accentPrimary },
              { label: 'Write Rate', value: metrics.diskIOWriteRate, unit: 'ops/sec', icon: TrendingDown, color: THEME.success },
              { label: 'I/O Latency', value: metrics.diskIOLatency.toFixed(1), unit: 'ms avg', icon: Clock, color: THEME.warning },
            ].map((io, idx) => (
              <div key={idx} style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontSize: 12, color: THEME.textMuted }}>{io.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 600, color: THEME.textMain, marginTop: 2 }}>{io.value}</div>
                  <div style={{ fontSize: 10, color: THEME.textMuted }}>{io.unit}</div>
                </div>
                <io.icon size={24} color={io.color} style={{ opacity: 0.8 }} />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div style={{ marginTop: 24 }}>
        <GlassCard title="Table Size Growth – Last 12 Months">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={tableGrowth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                 <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={THEME.accentPrimary} stopOpacity={0.4}/><stop offset="95%" stopColor={THEME.accentPrimary} stopOpacity={0}/></linearGradient>
                 <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={THEME.success} stopOpacity={0.4}/><stop offset="95%" stopColor={THEME.success} stopOpacity={0}/></linearGradient>
                 <linearGradient id="grad3" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={THEME.warning} stopOpacity={0.4}/><stop offset="95%" stopColor={THEME.warning} stopOpacity={0}/></linearGradient>
                 <linearGradient id="grad4" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={THEME.accentSecondary} stopOpacity={0.4}/><stop offset="95%" stopColor={THEME.accentSecondary} stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: THEME.textMuted }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 11, fill: THEME.textMuted }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="orders" stackId="1" stroke={THEME.accentPrimary} fill="url(#grad1)" name="Orders (MB)" />
              <Area type="monotone" dataKey="customers" stackId="1" stroke={THEME.success} fill="url(#grad2)" name="Customers (MB)" />
              <Area type="monotone" dataKey="products" stackId="1" stroke={THEME.warning} fill="url(#grad3)" name="Products (MB)" />
              <Area type="monotone" dataKey="transactions" stackId="1" stroke={THEME.accentSecondary} fill="url(#grad4)" name="Transactions (MB)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </>
  );

  const ReliabilityTab = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        <MetricCard icon={CheckCircle} title="Availability" value={metrics.availability} unit="%" />
        <MetricCard icon={XCircle} title="Downtime" value={metrics.downtimeIncidents} />
        <MetricCard icon={AlertCircle} title="Error Rate" value={metrics.errorRate.toFixed(1)} unit="/min" />
        <MetricCard icon={Lock} title="Deadlocks" value={metrics.deadlockCount} />
        <MetricCard icon={Clock} title="Lock Wait" value={metrics.lockWaitTime} unit="ms" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24 }}>
        <GlassCard title="Connection Health">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 10 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: THEME.textMuted }}>Active Connections</span>
                <span style={{ color: THEME.textMain }}>{metrics.activeConnections} / {metrics.maxConnections}</span>
              </div>
              <ProgressBar value={metrics.activeConnections} max={metrics.maxConnections} color={THEME.accentPrimary} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: THEME.textMuted }}>Idle Connections</span>
                <span style={{ color: THEME.textMain }}>{metrics.idleConnections} / {metrics.maxConnections}</span>
              </div>
              <ProgressBar value={metrics.idleConnections} max={metrics.maxConnections} color={THEME.textMuted} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
              <div style={{ background: 'rgba(248, 113, 113, 0.1)', padding: 12, borderRadius: 8, border: `1px solid ${THEME.danger}40`, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: THEME.danger }}>{metrics.failedConnections}</div>
                <div style={{ fontSize: 11, color: THEME.danger, opacity: 0.8 }}>Failed Attempts</div>
              </div>
              <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: 12, borderRadius: 8, border: `1px solid ${THEME.warning}40`, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: THEME.warning }}>{metrics.connectionWaitTime}ms</div>
                <div style={{ fontSize: 11, color: THEME.warning, opacity: 0.8 }}>Avg Wait Time</div>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard title="Top Error Types">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topErrors.map((error, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: THEME.textMain }}>{error.type}</span>
                    <span style={{ color: THEME.danger }}>{error.percentage}%</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${error.percentage}%`, background: THEME.danger, borderRadius: 4 }} />
                  </div>
                </div>
                <span style={{ fontSize: 11, color: THEME.textMuted, width: 60, textAlign: 'right' }}>{error.count} events</span>
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
        <MetricCard icon={TrendingUp} title="Index Hit Ratio" value={metrics.indexHitRatio.toFixed(1)} unit="%" />
        <MetricCard icon={AlertTriangle} title="Missing Indexes" value={metrics.missingIndexes} />
        <MetricCard icon={AlertCircle} title="Unused Indexes" value={metrics.unusedIndexes} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24 }}>
        <GlassCard title="Table Scan vs Index Usage">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={[{ name: 'Scan Stats', tableScanRate: metrics.tableScanRate, indexHitRatio: metrics.indexHitRatio }]} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} vertical={false} />
              <XAxis dataKey="name" hide />
              <YAxis tick={{ fontSize: 11, fill: THEME.textMuted }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              <Bar dataKey="tableScanRate" name="Table Scan Rate (%)" fill={THEME.warning} radius={[4, 4, 0, 0]} />
              <Bar dataKey="indexHitRatio" name="Index Hit Ratio (%)" fill={THEME.success} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard title="Fragmentation & Maintenance">
           <div style={{ display: 'flex', flexDirection: 'column', gap: 20, justifyContent: 'center', height: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: 48, 
                fontWeight: 700, 
                color: metrics.fragmentationLevel > 30 ? THEME.danger : metrics.fragmentationLevel > 15 ? THEME.warning : THEME.success 
              }}>
                {metrics.fragmentationLevel.toFixed(1)}%
              </div>
              <div style={{ fontSize: 13, color: THEME.textMuted, marginTop: 4 }}>Current Fragmentation Level</div>
            </div>
            
            <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: 12, lineHeight: 1.5, color: THEME.textMuted, border: '1px solid rgba(255,255,255,0.05)' }}>
               <AlertTriangle size={14} style={{ display: 'inline', marginRight: 6, color: THEME.warning }} />
               Higher fragmentation and table scan rates suggest a <strong>VACUUM</strong> or <strong>REINDEX</strong> operation is required. Index tuning may improve query performance.
            </div>
          </div>
        </GlassCard>
      </div>
    </>
  );

  // --- MAIN LAYOUT ---
  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      display: 'flex', 
      backgroundColor: THEME.bg, 
      color: THEME.textMain, 
      fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif" 
    }}>
      {/* SIDEBAR */}
      <aside style={{ 
        width: 260, 
        borderRight: `1px solid ${THEME.cardBorder}`, 
        padding: '24px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 24,
        background: 'rgba(11, 17, 33, 0.95)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            width: 36, height: 36, borderRadius: 10, 
            background: `linear-gradient(135deg, ${THEME.accentPrimary}, ${THEME.success})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 15px ${THEME.accentPrimary}60`
          }}>
            <Database size={20} color="#0b1120" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.5px' }}>PG Monitor</div>
            <div style={{ fontSize: 11, color: THEME.success, fontWeight: 500 }}>PROD-DB-01 • Online</div>
          </div>
        </div>

        <div style={{ padding: '16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: `1px solid ${THEME.cardBorder}` }}>
          <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Cluster Health</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
            <span>Availability</span>
            <span style={{ color: THEME.success, fontWeight: 600 }}>{metrics.availability}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span>Uptime</span>
            <span style={{ color: THEME.textMain }}>{formatUptime(metrics.uptime)}</span>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 8, paddingLeft: 8, fontWeight: 600 }}>DASHBOARDS</div>
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'performance', label: 'Performance', icon: Zap },
            { id: 'resources', label: 'Resources', icon: HardDrive },
            { id: 'reliability', label: 'Reliability', icon: CheckCircle },
            { id: 'indexes', label: 'Indexes', icon: TrendingUp }
          ].map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  background: active ? `linear-gradient(90deg, ${THEME.accentPrimary}15, transparent)` : 'transparent',
                  color: active ? THEME.accentPrimary : THEME.textMuted,
                  borderLeft: active ? `3px solid ${THEME.accentPrimary}` : '3px solid transparent',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  fontSize: 13,
                  fontWeight: active ? 600 : 500
                }}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: THEME.success }}>
             <span style={{ display: 'block', width: 8, height: 8, background: THEME.success, borderRadius: '50%', boxShadow: `0 0 8px ${THEME.success}` }}></span>
             Live Updates Active
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <header style={{ 
          borderBottom: `1px solid ${THEME.cardBorder}`, 
          padding: '16px 32px', 
          background: 'rgba(11, 17, 33, 0.8)', 
          backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Monitoring
            </h1>
            <p style={{ fontSize: 12, color: THEME.textMuted, marginTop: 4 }}>Real-time production database metrics</p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            {recentAlerts.slice(0, 2).map((alert, idx) => (
              <div key={idx} style={{ 
                display: 'flex', alignItems: 'center', gap: 8, 
                padding: '6px 12px', borderRadius: 20, 
                fontSize: 11, fontWeight: 500,
                background: alert.severity === 'critical' ? 'rgba(248, 113, 113, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                border: `1px solid ${alert.severity === 'critical' ? THEME.danger : THEME.warning}40`,
                color: alert.severity === 'critical' ? THEME.danger : THEME.warning
              }}>
                <AlertTriangle size={12} />
                {alert.message}
              </div>
            ))}
             <div style={{ width: 1, background: THEME.cardBorder, margin: '0 8px' }}></div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: THEME.cardBg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${THEME.cardBorder}` }}>
                   <Search size={14} color={THEME.textMuted} />
                </div>
             </div>
          </div>
        </header>

        <main style={{ padding: '32px', maxWidth: 1600, margin: '0 auto', width: '100%' }}>
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'performance' && <PerformanceTab />}
          {activeTab === 'resources' && <ResourcesTab />}
          {activeTab === 'reliability' && <ReliabilityTab />}
          {activeTab === 'indexes' && <IndexesTab />}
        </main>
      </div>
    </div>
  );
};

export default PostgreSQLMonitor;