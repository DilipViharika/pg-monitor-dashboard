import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Database,
  HardDrive,
  Zap,
  Clock,
  AlertTriangle,
  Server,
  Lock,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Search,
  Filter,
  RefreshCw,
  Layers,
  Copy,
  Terminal
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart, ScatterChart, Scatter, ZAxis, Radar, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// --- Theme & Constants ---
const THEME = {
  light: {
    bg: '#f8fafc',
    sidebar: '#ffffff',
    card: '#ffffff',
    text: '#0f172a',
    textSec: '#64748b',
    border: '#e2e8f0',
    hover: '#f1f5f9',
    chartGrid: '#e2e8f0',
    tooltip: '#ffffff'
  },
  dark: {
    bg: '#0f172a',
    sidebar: '#1e293b',
    card: '#1e293b',
    text: '#f8fafc',
    textSec: '#94a3b8',
    border: '#334155',
    hover: '#334155',
    chartGrid: '#334155',
    tooltip: '#1e293b'
  }
};

const COLORS = {
  blue: '#3b82f6',
  green: '#22c55e',
  orange: '#f97316',
  red: '#ef4444',
  purple: '#a855f7',
  cyan: '#06b6d4',
  yellow: '#eab308'
};

const PostgreSQLMonitor = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(false);

  const theme = darkMode ? THEME.dark : THEME.light;

  // --- Mock Data States ---
  const [metrics, setMetrics] = useState({
    qps: 0, tps: 0, activeConn: 0, cpu: 0, mem: 0,
    walRate: 0, replicationLag: 0, bufferHit: 99.8,
    deadlocks: 0, tempFiles: 0, indexHit: 98.2,
    dbSize: 450, dbGrowth: 2.3
  });
  
  const [timeseriesData, setTimeseriesData] = useState([]);
  const [queryScatterData, setQueryScatterData] = useState([]);
  const [healthRadar, setHealthRadar] = useState([]);
  const [topQueries, setTopQueries] = useState([]);

  // --- Data Simulation ---
  
  // Simulate Initial Data Fetch
  useEffect(() => {
    generateData(timeRange);
  }, [timeRange]);

  // Simulate Live Ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        qps: Math.floor(Math.random() * 500) + 1500,
        tps: Math.floor(Math.random() * 200) + 600,
        cpu: Math.max(10, Math.min(90, prev.cpu + (Math.random() - 0.5) * 5)),
        walRate: Math.floor(Math.random() * 5) + 2, // MB/s
        activeConn: Math.floor(Math.random() * 10) + 40
      }));

      // Live update scatter plot (simulating new queries)
      setQueryScatterData(prev => {
        const newData = [...prev.slice(1), {
          id: Math.random(),
          duration: Math.random() * 500 + 10,
          frequency: Math.floor(Math.random() * 100),
          type: Math.random() > 0.8 ? 'Slow' : 'Normal'
        }];
        return newData;
      });

    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const generateData = (range) => {
    setLoading(true);
    // Simulate network delay
    setTimeout(() => {
      const points = range === '1h' ? 60 : range === '24h' ? 24 : 7;
      
      // Timeseries (WAL, Connections, TPS)
      const tsData = Array.from({ length: points }, (_, i) => ({
        time: i,
        tps: Math.floor(Math.random() * 500) + 500,
        wal: Math.floor(Math.random() * 10) + 2,
        connections: Math.floor(Math.random() * 30) + 20,
        cpu: Math.floor(Math.random() * 40) + 10,
        ioWait: Math.random() * 10
      }));
      setTimeseriesData(tsData);

      // Scatter (Query Performance)
      const scatter = Array.from({ length: 50 }, () => ({
        duration: Math.random() * 1000, // ms
        frequency: Math.floor(Math.random() * 5000), // calls
        rows: Math.floor(Math.random() * 10000),
        type: Math.random() > 0.9 ? 'Critical' : 'Normal' 
      }));
      setQueryScatterData(scatter);

      // Radar (Health Balance)
      setHealthRadar([
        { subject: 'Availability', A: 99, fullMark: 100 },
        { subject: 'Performance', A: 85, fullMark: 100 },
        { subject: 'Capacity', A: 65, fullMark: 100 },
        { subject: 'Security', A: 90, fullMark: 100 },
        { subject: 'Reliability', A: 95, fullMark: 100 },
        { subject: 'Maintenance', A: 70, fullMark: 100 },
      ]);

      // Top Queries List
      setTopQueries([
        { query: 'SELECT * FROM orders WHERE user_id = $1', calls: 45200, avg: 12.4, total: 560480, rows: 45 },
        { query: 'UPDATE inventory SET count = count - 1', calls: 23100, avg: 45.2, total: 1044120, rows: 1 },
        { query: 'SELECT count(*) FROM analytics_events', calls: 540, avg: 1240.5, total: 669870, rows: 1 },
        { query: 'INSERT INTO audit_logs VALUES (...)', calls: 89000, avg: 4.1, total: 364900, rows: 1 },
        { query: 'SELECT * FROM products JOIN categories...', calls: 1200, avg: 156.0, total: 187200, rows: 250 },
      ]);

      setMetrics(prev => ({ ...prev, activeConn: 45, replicationLag: 0.02 }));
      setLoading(false);
    }, 600);
  };

  // --- Components ---

  const Card = ({ title, children, action }) => (
    <div style={{
      backgroundColor: theme.card,
      borderRadius: 16,
      border: `1px solid ${theme.border}`,
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: theme.text }}>{title}</h3>
        {action}
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );

  const StatBox = ({ label, value, unit, trend, trendVal, icon: Icon, color }) => (
    <div style={{
      backgroundColor: theme.card,
      border: `1px solid ${theme.border}`,
      borderRadius: 12,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ 
          padding: 8, 
          borderRadius: 8, 
          backgroundColor: `${color}20`,
          color: color
        }}>
          <Icon size={18} />
        </div>
        {trend && (
          <div style={{ 
            fontSize: 11, 
            fontWeight: 600, 
            color: trend === 'up' ? COLORS.green : COLORS.red,
            display: 'flex', alignItems: 'center', gap: 2
          }}>
            {trend === 'up' ? '+' : ''}{trendVal}%
            {trend === 'up' ? <Activity size={10} /> : <AlertTriangle size={10} />}
          </div>
        )}
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color: theme.text }}>
          {value}
          <span style={{ fontSize: 13, color: theme.textSec, fontWeight: 500, marginLeft: 4 }}>{unit}</span>
        </div>
        <div style={{ fontSize: 12, color: theme.textSec }}>{label}</div>
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          backgroundColor: theme.tooltip, 
          border: `1px solid ${theme.border}`, 
          padding: '8px 12px', 
          borderRadius: 8,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
        }}>
          <p style={{ fontWeight: 600, color: theme.text, fontSize: 12, marginBottom: 4 }}>Time Point: {label}</p>
          {payload.map((p, i) => (
            <div key={i} style={{ fontSize: 12, color: p.color, display: 'flex', gap: 8 }}>
              <span>{p.name}:</span>
              <span style={{ fontWeight: 600 }}>{Number(p.value).toFixed(1)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // --- Views ---

  const DashboardView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatBox icon={Zap} label="Transactions/sec" value={metrics.tps} color={COLORS.blue} trend="up" trendVal="12" />
        <StatBox icon={Clock} label="Avg Query Latency" value={45.2} unit="ms" color={COLORS.orange} trend="down" trendVal="5" />
        <StatBox icon={Database} label="Buffer Cache Hit" value={metrics.bufferHit} unit="%" color={COLORS.green} />
        <StatBox icon={Activity} label="Active Connections" value={metrics.activeConn} color={COLORS.purple} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Main Mixed Chart */}
        <Card title="Throughput & Resource Correlation">
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timeseriesData}>
                <defs>
                  <linearGradient id="colorTps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis yAxisId="left" tick={{fill: theme.textSec, fontSize: 11}} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{fill: theme.textSec, fontSize: 11}} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" />
                <Area yAxisId="left" type="monotone" dataKey="tps" name="TPS" stroke={COLORS.blue} fill="url(#colorTps)" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="cpu" name="CPU %" stroke={COLORS.orange} dot={false} strokeWidth={2} />
                <Bar yAxisId="right" dataKey="wal" name="WAL (MB/s)" fill={COLORS.green} radius={[4,4,0,0]} opacity={0.6} barSize={20} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Health Radar */}
        <Card title="Cluster Health Score">
           <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={90} data={healthRadar}>
                <PolarGrid stroke={theme.chartGrid} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: theme.textSec, fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Cluster" dataKey="A" stroke={COLORS.purple} fill={COLORS.purple} fillOpacity={0.4} />
                <Tooltip cursor={false} contentStyle={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }} />
              </RadarChart>
            </ResponsiveContainer>
           </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
         {/* Query Performance Scatter */}
         <Card title="Query Performance Outliers">
           <div style={{ height: 250 }}>
             <ResponsiveContainer width="100%" height="100%">
               <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} />
                 <XAxis type="number" dataKey="frequency" name="Frequency" unit=" calls" tick={{fill: theme.textSec, fontSize: 11}} />
                 <YAxis type="number" dataKey="duration" name="Duration" unit="ms" tick={{fill: theme.textSec, fontSize: 11}} />
                 <ZAxis type="number" dataKey="rows" range={[50, 400]} name="Rows Affected" />
                 <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                 <Scatter name="Queries" data={queryScatterData} fill={COLORS.cyan} shape="circle" />
               </ScatterChart>
             </ResponsiveContainer>
           </div>
         </Card>

         {/* Advanced Metrics Table */}
         <Card title="Deep Dive Metrics">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Replication Lag', value: '0.02ms', color: COLORS.green, max: 100, val: 2 },
                { label: 'Temp Files Created', value: '24 MB', color: COLORS.yellow, max: 100, val: 24 },
                { label: 'Deadlocks (Last 1h)', value: '0', color: COLORS.red, max: 10, val: 0 },
                { label: 'Index Hit Ratio', value: '98.2%', color: COLORS.blue, max: 100, val: 98.2 },
                { label: 'Checkpoint Sync Time', value: '245ms', color: COLORS.purple, max: 1000, val: 245 },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
                  <div style={{ width: 140, color: theme.textSec }}>{item.label}</div>
                  <div style={{ flex: 1, height: 6, backgroundColor: theme.border, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${item.val}%`, height: '100%', backgroundColor: item.color, borderRadius: 4 }}></div>
                  </div>
                  <div style={{ width: 60, textAlign: 'right', fontWeight: 600, color: theme.text }}>{item.value}</div>
                </div>
              ))}
            </div>
         </Card>
      </div>
    </div>
  );

  const QueryAnalysisView = () => (
    <Card title="Top Resource Consuming Queries">
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: theme.text, fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${theme.border}`, textAlign: 'left' }}>
              <th style={{ padding: 12, color: theme.textSec }}>Query Statement</th>
              <th style={{ padding: 12, color: theme.textSec }}>Calls</th>
              <th style={{ padding: 12, color: theme.textSec }}>Avg Time</th>
              <th style={{ padding: 12, color: theme.textSec }}>Total Time</th>
              <th style={{ padding: 12, color: theme.textSec }}>Rows</th>
            </tr>
          </thead>
          <tbody>
            {topQueries.map((q, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${theme.border}` }}>
                <td style={{ padding: 12, fontFamily: 'monospace', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <span style={{ color: COLORS.blue }}>{q.query.split(' ')[0]}</span> {q.query.substring(q.query.indexOf(' '))}
                </td>
                <td style={{ padding: 12 }}>{q.calls.toLocaleString()}</td>
                <td style={{ padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {q.avg > 1000 ? <AlertTriangle size={12} color={COLORS.red}/> : null}
                    {q.avg.toFixed(1)} ms
                  </div>
                </td>
                <td style={{ padding: 12 }}>{(q.total / 1000).toFixed(1)} s</td>
                <td style={{ padding: 12 }}>{q.rows}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  // --- Layout Structure ---

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: theme.bg, 
      color: theme.text,
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex',
      transition: 'background-color 0.3s ease'
    }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarCollapsed ? 64 : 240,
        backgroundColor: theme.sidebar,
        borderRight: `1px solid ${theme.border}`,
        padding: '20px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        transition: 'width 0.3s ease',
        flexShrink: 0,
        zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px 20px' }}>
          <div style={{ width: 32, height: 32, backgroundColor: COLORS.blue, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Database color="white" size={18} />
          </div>
          {!sidebarCollapsed && <span style={{ fontWeight: 700, fontSize: 16 }}>PgSentinel</span>}
        </div>

        {[
          { id: 'overview', icon: Activity, label: 'Cluster Overview' },
          { id: 'queries', icon: Terminal, label: 'Query Analyzer' },
          { id: 'replication', icon: Copy, label: 'Replication & WAL' },
          { id: 'indexes', icon: Layers, label: 'Index Usage' },
          { id: 'config', icon: Server, label: 'Configuration' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: activeTab === item.id ? (darkMode ? '#334155' : '#eff6ff') : 'transparent',
              color: activeTab === item.id ? COLORS.blue : theme.textSec,
              cursor: 'pointer',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              transition: 'all 0.2s'
            }}
          >
            <item.icon size={20} />
            {!sidebarCollapsed && <span style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</span>}
          </button>
        ))}

        <div style={{ marginTop: 'auto', borderTop: `1px solid ${theme.border}`, paddingTop: 16 }}>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ width: '100%', background: 'none', border: 'none', color: theme.textSec, cursor: 'pointer', display: 'flex', justifyContent: sidebarCollapsed ? 'center' : 'flex-end' }}
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* Top Navigation Bar */}
        <header style={{
          height: 64,
          backgroundColor: theme.sidebar,
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>
              {activeTab === 'overview' ? 'Production Cluster' : 
               activeTab === 'queries' ? 'Query Analysis' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            {activeTab === 'overview' && (
              <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 99, backgroundColor: `${COLORS.green}20`, color: COLORS.green, border: `1px solid ${COLORS.green}40` }}>
                Healthy
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
             {/* Time Range Selector */}
            <div style={{ display: 'flex', backgroundColor: darkMode ? '#0f172a' : '#f1f5f9', borderRadius: 6, padding: 2 }}>
              {['1h', '24h', '7d'].map(r => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  style={{
                    border: 'none',
                    background: timeRange === r ? theme.card : 'transparent',
                    color: timeRange === r ? theme.text : theme.textSec,
                    padding: '4px 12px',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    boxShadow: timeRange === r ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  {r}
                </button>
              ))}
            </div>

            <button 
              onClick={() => generateData(timeRange)}
              style={{ border: `1px solid ${theme.border}`, background: 'transparent', padding: 8, borderRadius: 8, cursor: 'pointer', color: theme.textSec }}
            >
              <RefreshCw size={16} className={loading ? 'spin' : ''} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}/>
            </button>

            <button 
              onClick={() => setDarkMode(!darkMode)}
              style={{ border: `1px solid ${theme.border}`, background: 'transparent', padding: 8, borderRadius: 8, cursor: 'pointer', color: theme.textSec }}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* Scrollable Dashboard Area */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ maxWidth: 1600, margin: '0 auto' }}>
            {activeTab === 'overview' && <DashboardView />}
            {activeTab === 'queries' && <QueryAnalysisView />}
            {activeTab !== 'overview' && activeTab !== 'queries' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, color: theme.textSec }}>
                <Server size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                <h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h3>
                <p>This section is under construction in the demo.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Global CSS for spinner */}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default PostgreSQLMonitor;