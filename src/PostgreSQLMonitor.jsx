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
  ChevronLeft,
  ChevronRight,
  PieChart as PieIcon,
  BarChart2,
  Map,
  Crosshair
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
  Treemap,
  ScatterChart,
  Scatter,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  ZAxis
} from 'recharts';

// --- Theme Constants ---
const PRIMARY_BLUE = '#2563eb';
const PRIMARY_GREEN = '#22c55e';
const PRIMARY_ORANGE = '#f97316';
const PRIMARY_RED = '#ef4444';
const PRIMARY_PURPLE = '#8b5cf6';
const BG_GRADIENT = 'linear-gradient(135deg, #e5edf7 0%, #f3f4ff 40%, #e0ecff 100%)';

const PostgreSQLMonitor = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // --- State Data ---
  const [metrics, setMetrics] = useState({
    avgQueryTime: 45.2,
    slowQueryCount: 23,
    qps: 1847,
    tps: 892,
    cpuUsage: 42.5,
    memoryUsage: 67.8,
    diskUsed: 54.3,
    diskTotal: 1000,
    activeConnections: 45,
    maxConnections: 100,
    indexHitRatio: 96.7,
    cacheHitRatio: 99.2,
    deadlockCount: 0,
    tempFilesCreated: 12
  });

  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [queryScatterData, setQueryScatterData] = useState([]);
  const [storageTreeData, setStorageTreeData] = useState([]);
  const [radarData, setRadarData] = useState([]);
  const [hourlyHeatmap, setHourlyHeatmap] = useState([]);

  // --- Data Generation ---
  useEffect(() => {
    // 1. Time Series (Dual Axis Support)
    const series = [];
    for (let i = 0; i < 24; i++) {
      series.push({
        time: `${i}:00`,
        tps: Math.floor(Math.random() * 500) + 800, // Transactions per sec
        latency: Math.random() * 40 + 20, // Avg Latency ms
        connections: Math.floor(Math.random() * 40) + 20
      });
    }
    setTimeSeriesData(series);

    // 2. Query Scatter (Frequency vs Duration)
    // x = Duration (ms), y = Frequency (count), z = Impact (Cost)
    const queries = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      queryHash: `Q-${Math.floor(Math.random() * 10000)}`,
      duration: Math.random() * 500 + 10, // 10ms to 500ms
      frequency: Math.floor(Math.random() * 1000) + 10,
      type: Math.random() > 0.7 ? 'WRITE' : 'READ'
    }));
    setQueryScatterData(queries);

    // 3. Storage Treemap
    setStorageTreeData([
      {
        name: 'public',
        children: [
          { name: 'orders', size: 4500 },
          { name: 'order_items', size: 3200 },
          { name: 'logs_2023', size: 2100 },
          { name: 'users', size: 1500 },
          { name: 'products', size: 900 },
          { name: 'audit_trail', size: 800 },
          { name: 'inventory', size: 500 },
        ]
      },
      {
        name: 'analytics',
        children: [
          { name: 'events_raw', size: 6000 },
          { name: 'agg_daily', size: 1200 },
        ]
      }
    ]);

    // 4. Radar (Health Dimensions)
    setRadarData([
      { subject: 'CPU Efficiency', A: 85, fullMark: 100 },
      { subject: 'Memory Health', A: 70, fullMark: 100 },
      { subject: 'Disk I/O', A: 90, fullMark: 100 },
      { subject: 'Conn. Pool', A: 65, fullMark: 100 },
      { subject: 'Cache Hit', A: 99, fullMark: 100 },
      { subject: 'Lock Contention', A: 80, fullMark: 100 },
    ]);
    
    // 5. Hourly Heatmap (Simulated Activity)
    const heatmap = [];
    for(let i=0; i<24; i++) {
        heatmap.push({
            hour: i,
            load: Math.floor(Math.random() * 100), // 0-100% load intensity
            day: 'Today'
        })
    }
    setHourlyHeatmap(heatmap);

  }, []);

  // Live simulation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        qps: Math.floor(Math.random() * 200) + 1800,
        tps: Math.floor(Math.random() * 100) + 800,
        cpuUsage: Math.random() * 15 + 30,
        activeConnections: Math.floor(Math.random() * 10) + 40
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // --- Helpers ---
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#fff', border: '1px solid #ccc', padding: '10px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>{label}</p>
          {payload.map((entry, index) => (
            <div key={index} style={{ color: entry.color, fontSize: '12px' }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
              {entry.unit}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const SectionCard = ({ title, subtitle, children }) => (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #e2e8f0',
      padding: '20px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>{title}</h3>
        {subtitle && <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>{subtitle}</p>}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        {children}
      </div>
    </div>
  );

  const StatCard = ({ label, value, unit, icon: Icon, color, trend }) => (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: '16px',
      border: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
          {value} <span style={{ fontSize: 12, color: '#94a3b8' }}>{unit}</span>
        </div>
      </div>
    </div>
  );

  // --- Custom Treemap Content ---
  const CustomizedTreemapContent = (props) => {
    const { root, depth, x, y, width, height, index, name, size } = props;
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: depth < 2 ? PRIMARY_BLUE : '#ffffff',
            stroke: '#fff',
            strokeWidth: 2 / (depth + 1e-10),
            fillOpacity: 1 / (depth + 2),
          }}
        />
        {depth === 2 && width > 50 && height > 30 && (
          <text
            x={x + width / 2}
            y={y + height / 2}
            textAnchor="middle"
            fill="#fff"
            fontSize={11}
            fontWeight={600}
            style={{ pointerEvents: 'none' }}
          >
            {name}
          </text>
        )}
        {depth === 1 && (
          <text x={x + 4} y={y + 14} fill="#1e293b" fontSize={12} fontWeight={700}>
            {name}
          </text>
        )}
      </g>
    );
  };

  // --- Views ---

  const OverviewView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard label="QPS" value={metrics.qps} icon={Zap} color={PRIMARY_BLUE} />
        <StatCard label="Avg Latency" value={metrics.avgQueryTime} unit="ms" icon={Clock} color={PRIMARY_ORANGE} />
        <StatCard label="Connections" value={`${metrics.activeConnections}/${metrics.maxConnections}`} icon={Activity} color={PRIMARY_PURPLE} />
        <StatCard label="Cache Hit" value={metrics.cacheHitRatio} unit="%" icon={Database} color={PRIMARY_GREEN} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, height: 350 }}>
        <SectionCard title="Load vs Latency Correlation" subtitle="Dual-axis view to spot capacity bottlenecks">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis yAxisId="left" orientation="left" stroke={PRIMARY_BLUE} tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" stroke={PRIMARY_ORANGE} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="tps" name="Transactions/Sec" fill={PRIMARY_BLUE} radius={[4, 4, 0, 0]} fillOpacity={0.8} />
              <Line yAxisId="right" type="monotone" dataKey="latency" name="Latency (ms)" stroke={PRIMARY_ORANGE} strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="System Health Radar" subtitle="Current status vs Optimal Baseline">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Current Health"
                dataKey="A"
                stroke={PRIMARY_GREEN}
                strokeWidth={2}
                fill={PRIMARY_GREEN}
                fillOpacity={0.4}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>
    </div>
  );

  const PerformanceView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionCard title="Query Quadrant Analysis" subtitle="Scatter plot identifying Slow & Frequent queries (Top-Right is Critical)">
        <div style={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" dataKey="duration" name="Duration" unit="ms" label={{ value: 'Execution Time (ms)', position: 'bottom', offset: 0, fontSize: 12 }} />
              <YAxis type="number" dataKey="frequency" name="Frequency" label={{ value: 'Executions / Hour', angle: -90, position: 'insideLeft', fontSize: 12 }} />
              <ZAxis type="number" dataKey="duration" range={[50, 400]} name="Impact" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div style={{ background: '#fff', border: '1px solid #ccc', padding: '8px', borderRadius: '4px' }}>
                      <strong>{data.queryHash}</strong><br/>
                      Time: {data.duration.toFixed(1)}ms<br/>
                      Count: {data.frequency}
                    </div>
                  );
                }
                return null;
              }} />
              <Scatter name="Read Queries" data={queryScatterData.filter(d => d.type === 'READ')} fill={PRIMARY_BLUE} shape="circle" />
              <Scatter name="Write Queries" data={queryScatterData.filter(d => d.type === 'WRITE')} fill={PRIMARY_RED} shape="triangle" />
              <Legend verticalAlign="top" height={36}/>
              {/* Reference Lines to create Quadrants */}
              <line x1={250} y1={0} x2={250} y2={1000} stroke="#94a3b8" strokeDasharray="4 4" />
              <line x1={0} y1={500} x2={500} y2={500} stroke="#94a3b8" strokeDasharray="4 4" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
         <SectionCard title="Throughput Heatmap" subtitle="Activity Intensity by Hour of Day">
            <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={hourlyHeatmap}>
                      <XAxis dataKey="hour" tick={{fontSize: 10}} />
                      <Tooltip />
                      <Bar dataKey="load" name="Load Intensity">
                        {
                            hourlyHeatmap.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.load > 80 ? PRIMARY_RED : entry.load > 50 ? PRIMARY_ORANGE : PRIMARY_BLUE} />
                            ))
                        }
                      </Bar>
                   </BarChart>
                </ResponsiveContainer>
            </div>
         </SectionCard>
         <SectionCard title="Index Usage Efficiency" subtitle="Scan types breakdown">
            <div style={{ height: 200, display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={[
                                { name: 'Index Scan', value: 75 },
                                { name: 'Seq Scan', value: 15 },
                                { name: 'Index Only', value: 10 }
                            ]}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            <Cell fill={PRIMARY_GREEN} />
                            <Cell fill={PRIMARY_ORANGE} />
                            <Cell fill={PRIMARY_BLUE} />
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle"/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
         </SectionCard>
      </div>
    </div>
  );

  const StorageView = () => (
    <div style={{ height: 'calc(100vh - 120px)' }}>
      <SectionCard title="Database Topology (Treemap)" subtitle="Relative size of Schemas and Tables. Drill down to identify space hogs.">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={storageTreeData}
            dataKey="size"
            ratio={4 / 3}
            stroke="#fff"
            fill="#8884d8"
            content={<CustomizedTreemapContent />}
          >
            <Tooltip content={({ active, payload }) => {
                 if(active && payload && payload.length) {
                     return (
                         <div style={{background:'white', padding: '8px', border:'1px solid #ccc'}}>
                             <b>{payload[0].payload.name}</b>: {payload[0].value} MB
                         </div>
                     )
                 }
                 return null;
            }}/>
          </Treemap>
        </ResponsiveContainer>
      </SectionCard>
    </div>
  );

  // --- Main Render ---

  const sidebarWidth = sidebarCollapsed ? 64 : 240;

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: BG_GRADIENT,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#1e293b'
    }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarWidth,
        background: '#fff',
        borderRight: '1px solid #e2e8f0',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 20
      }}>
        <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #f1f5f9' }}>
          <div style={{
            width: 32, height: 32, background: PRIMARY_BLUE, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Database color="white" size={18} />
          </div>
          {!sidebarCollapsed && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>PostgresMonitor</div>
              <div style={{ fontSize: 11, color: PRIMARY_GREEN, fontWeight: 500 }}>● Connected</div>
            </div>
          )}
        </div>

        <nav style={{ padding: 12, flex: 1 }}>
          {[
            { id: 'overview', icon: Activity, label: 'Overview' },
            { id: 'performance', icon: Crosshair, label: 'Performance' }, // Changed Icon
            { id: 'storage', icon: HardDrive, label: 'Storage' },
            { id: 'reliability', icon: AlertCircle, label: 'Reliability' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                border: 'none',
                background: activeTab === item.id ? '#eff6ff' : 'transparent',
                color: activeTab === item.id ? PRIMARY_BLUE : '#64748b',
                borderRadius: 8,
                cursor: 'pointer',
                marginBottom: 4,
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
              }}
            >
              <item.icon size={20} />
              {!sidebarCollapsed && <span style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</span>}
            </button>
          ))}
        </nav>

        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            border: 'none',
            borderTop: '1px solid #f1f5f9',
            background: 'transparent',
            padding: 16,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            color: '#94a3b8'
          }}
        >
          {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </aside>

      {/* Main Content */}
      <main style={{
        marginLeft: sidebarWidth,
        flex: 1,
        transition: 'margin-left 0.3s ease',
        padding: '24px 32px',
        maxWidth: 1600,
        marginRight: 'auto'
      }}>
        <header style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, textTransform: 'capitalize' }}>
              {activeTab} Dashboard
            </h1>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>
              Production Cluster (pg-prod-01) • Uptime: 24d 5h
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
             <span style={{padding: '6px 12px', background: '#dcfce7', color: '#166534', borderRadius: 20, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6}}>
                <CheckCircle size={14}/> Healthy
             </span>
             <span style={{padding: '6px 12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, fontSize: 12, fontWeight: 600}}>
                v14.5
             </span>
          </div>
        </header>

        {activeTab === 'overview' && <OverviewView />}
        {activeTab === 'performance' && <PerformanceView />}
        {activeTab === 'storage' && <StorageView />}
        {/* Placeholder for others */}
        {activeTab === 'reliability' && (
             <div style={{display:'flex', justifyContent:'center', alignItems:'center', height: 400, color: '#94a3b8'}}>
                Placeholder for Logs & Error Tracking
             </div>
        )}

      </main>
    </div>
  );
};

export default PostgreSQLMonitor;