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
  Crosshair
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  ScatterChart,
  Scatter,
  ZAxis,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Treemap
} from 'recharts';

const PRIMARY_BLUE = '#2563eb';
const PRIMARY_GREEN = '#22c55e';
const PRIMARY_ORANGE = '#f97316';
const PRIMARY_RED = '#ef4444';
const PRIMARY_PURPLE = '#8b5cf6';

const PostgreSQLMonitor = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // --- State Data ---
  const [metrics, setMetrics] = useState({
    avgQueryTime: 45.2,
    slowQueryCount: 23,
    qps: 1847,
    tps: 892,
    selectPerSec: 1245,
    insertPerSec: 342,
    updatePerSec: 198,
    deletePerSec: 62,
    readWriteRatio: 68,
    cpuUsage: 42.5,
    cpuAvg: 38.2,
    memoryUsage: 67.8,
    memoryAllocated: 16,
    memoryUsed: 10.8,
    diskUsed: 54.3,
    diskAvailable: 456,
    diskTotal: 1000,
    diskIOReadRate: 245,
    diskIOWriteRate: 128,
    diskIOLatency: 8.5,
    activeConnections: 45,
    idleConnections: 23,
    totalConnections: 68,
    maxConnections: 100,
    failedConnections: 12,
    connectionWaitTime: 125,
    uptime: 2592000,
    availability: 99.94,
    downtimeIncidents: 2,
    errorRate: 3.2,
    failedQueries: 18,
    deadlockCount: 5,
    lockWaitTime: 234,
    clusterHealth: 'Healthy',
    criticalAlerts: 2,
    warningAlerts: 8,
    indexHitRatio: 96.7,
    missingIndexes: 7,
    unusedIndexes: 12,
    tableScanRate: 15.3,
    fragmentationLevel: 23.4
  });

  // Advanced Data States
  const [timeSeriesData, setTimeSeriesData] = useState([]); 
  const [queryScatterData, setQueryScatterData] = useState([]); 
  const [storageTreeData, setStorageTreeData] = useState([]); 
  const [radarData, setRadarData] = useState([]); 
  const [hourlyHeatmap, setHourlyHeatmap] = useState([]); 
  const [topErrors, setTopErrors] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);

  // --- Data Generation ---
  useEffect(() => {
    // 1. Time Series (Dual Axis: TPS vs Latency)
    const series = [];
    for (let i = 0; i < 24; i++) {
      series.push({
        time: `${i}:00`,
        tps: Math.floor(Math.random() * 500) + 800,
        latency: Math.random() * 40 + 20,
        connections: Math.floor(Math.random() * 40) + 20
      });
    }
    setTimeSeriesData(series);

    // 2. Query Scatter (Frequency vs Duration vs Impact)
    const queries = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      queryHash: `Q-${Math.floor(Math.random() * 10000)}`,
      duration: Math.random() * 800 + 10,
      frequency: Math.floor(Math.random() * 1000) + 10,
      impact: Math.floor(Math.random() * 100),
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
          { name: 'logs_2024', size: 2100 },
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

    // 5. Hourly Heatmap
    const heatmap = [];
    for(let i=0; i<24; i++) {
        heatmap.push({
            hour: i,
            load: Math.floor(Math.random() * 100),
        })
    }
    setHourlyHeatmap(heatmap);

    setTopErrors([
      { type: 'Connection Timeout', count: 145, percentage: 38 },
      { type: 'Deadlock Detected', count: 89, percentage: 23 },
      { type: 'Query Timeout', count: 67, percentage: 17 },
      { type: 'Lock Wait Timeout', count: 45, percentage: 12 },
      { type: 'Constraint Violation', count: 38, percentage: 10 }
    ]);

    setRecentAlerts([
      { severity: 'critical', message: 'CPU usage exceeded 90%', time: '5 min ago' },
      { severity: 'warning', message: 'High slow queries', time: '12 min ago' },
      { severity: 'critical', message: 'Pool near capacity', time: '18 min ago' },
    ]);
  }, []);

  // Live simulation
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

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) setActiveTab(hash);
  }, []);

  // --- Helper Components ---

  const CustomizedTreemapContent = (props) => {
    const { depth, x, y, width, height, name } = props;
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
      </g>
    );
  };

  const FancyTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div style={{ background: '#fff', border: '1px solid #ccc', padding: '10px', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>{label}</p>
        {payload.map((entry, index) => (
          <div key={index} style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
            {entry.unit}
          </div>
        ))}
      </div>
    );
  };

  const TabGrid = ({ children }) => (
    <div style={{ width: '100%', marginLeft: 0, marginRight: 'auto', display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', rowGap: 16 }}>
      {children}
    </div>
  );

  const sectionCard = (title, children, rightNode) => (
    <div style={{ background: 'linear-gradient(135deg,#ffffff 0%,#f4f5ff 40%,#e5edf7 100%)', borderRadius: 18, border: '1px solid #d1d5db', padding: '14px 16px 18px', boxShadow: '0 12px 32px rgba(15,23,42,0.10)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{title}</h2>
        {rightNode || null}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </div>
  );

  const MetricCard = ({ icon: Icon, title, value, unit, subtitle, color }) => (
    <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #d1d5db', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 10, background: '#e5edf7', border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={14} color={color || '#0f172a'} />
          </div>
          <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{title}</span>
        </div>
      </div>
      <div style={{ marginTop: 4 }}>
        <span style={{ fontSize: 22, fontWeight: 600, color: '#0f172a' }}>{value}</span>
        {unit && <span style={{ marginLeft: 4, fontSize: 12, color: '#6b7280' }}>{unit}</span>}
      </div>
      {subtitle && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{subtitle}</div>}
    </div>
  );

  const ProgressBar = ({ value, max, color }) => (
    <div style={{ width: '100%' }}>
      <div style={{ width: '100%', backgroundColor: '#e5edf7', borderRadius: 999, height: 6, overflow: 'hidden', border: '1px solid #d1d5db' }}>
        <div style={{ height: '100%', width: `${Math.min((value / max) * 100, 100)}%`, backgroundColor: color || PRIMARY_GREEN, borderRadius: 999, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );

  // --- TABS ---

  const OverviewTab = () => (
    <TabGrid>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1.2fr)', gap: 16, height: 350 }}>
        {sectionCard(
          'Load vs Latency Correlation',
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis yAxisId="left" orientation="left" stroke={PRIMARY_BLUE} tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" stroke={PRIMARY_ORANGE} tick={{ fontSize: 11 }} />
              <Tooltip content={<FancyTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="tps" name="TPS" fill={PRIMARY_BLUE} radius={[4, 4, 0, 0]} fillOpacity={0.8} />
              <Line yAxisId="right" type="monotone" dataKey="latency" name="Latency (ms)" stroke={PRIMARY_ORANGE} strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {sectionCard(
          'System Health Radar',
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Current Health" dataKey="A" stroke={PRIMARY_GREEN} strokeWidth={2} fill={PRIMARY_GREEN} fillOpacity={0.4} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 16 }}>
        <MetricCard icon={Zap} title="QPS" value={metrics.qps} color={PRIMARY_BLUE} />
        <MetricCard icon={Clock} title="Avg Query" value={metrics.avgQueryTime.toFixed(1)} unit="ms" color="#eab308" />
        <MetricCard icon={Activity} title="Active Conn" value={metrics.activeConnections} color={PRIMARY_PURPLE} />
        <MetricCard icon={CheckCircle} title="Availability" value={metrics.availability} unit="%" color={PRIMARY_GREEN} />
      </div>
    </TabGrid>
  );

  const PerformanceTab = () => (
    <TabGrid>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', gap: 16 }}>
        {sectionCard(
          'Query Quadrant (Freq vs Duration)',
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="duration" name="Duration" unit="ms" label={{ value: 'Duration (ms)', position: 'bottom', offset: 0, fontSize: 10 }} />
                <YAxis type="number" dataKey="frequency" name="Frequency" label={{ value: 'Freq', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                <ZAxis type="number" dataKey="impact" range={[50, 400]} name="Impact" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Read Queries" data={queryScatterData.filter(d => d.type === 'READ')} fill={PRIMARY_BLUE} />
                <Scatter name="Write Queries" data={queryScatterData.filter(d => d.type === 'WRITE')} fill={PRIMARY_RED} shape="triangle" />
                <Legend />
                {/* Reference lines to show danger zone */}
                <line x1={400} y1={0} x2={400} y2={1000} stroke={PRIMARY_RED} strokeDasharray="4 4" strokeWidth={1} />
                <line x1={0} y1={500} x2={1000} y2={500} stroke={PRIMARY_RED} strokeDasharray="4 4" strokeWidth={1} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        {sectionCard(
          'Hourly Activity Heatmap',
          <div style={{ height: 350 }}>
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyHeatmap} layout="vertical">
                   <XAxis type="number" hide />
                   <YAxis dataKey="hour" type="category" width={30} tick={{fontSize: 10}} />
                   <Tooltip />
                   <Bar dataKey="load" name="Load Intensity" barSize={15}>
                     {hourlyHeatmap.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.load > 80 ? PRIMARY_RED : entry.load > 50 ? PRIMARY_ORANGE : PRIMARY_BLUE} />
                     ))}
                   </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 16 }}>
        <MetricCard icon={AlertCircle} title="Slow Queries (>1s)" value={metrics.slowQueryCount} color={PRIMARY_RED} />
        <MetricCard icon={Activity} title="Transactions/sec" value={metrics.tps} color={PRIMARY_GREEN} />
      </div>
    </TabGrid>
  );

  const ResourcesTab = () => (
    <TabGrid>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16 }}>
        <MetricCard icon={Activity} title="CPU Usage" value={metrics.cpuUsage.toFixed(1)} unit="%" color={PRIMARY_ORANGE} />
        <MetricCard icon={Database} title="Memory Usage" value={metrics.memoryUsage.toFixed(1)} unit="%" color={PRIMARY_BLUE} />
        <MetricCard icon={HardDrive} title="Disk Used" value={metrics.diskUsed.toFixed(1)} unit="%" color={PRIMARY_GREEN} />
      </div>

      <div style={{ height: 400 }}>
        {sectionCard(
          'Storage Topology (Treemap)',
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={storageTreeData}
              dataKey="size"
              ratio={4 / 3}
              stroke="#fff"
              fill="#8884d8"
              content={<CustomizedTreemapContent />}
            >
              <Tooltip />
            </Treemap>
          </ResponsiveContainer>
        )}
      </div>
    </TabGrid>
  );

  const ReliabilityTab = () => (
    <TabGrid>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,minmax(0,1fr))', gap: 16 }}>
        <MetricCard icon={CheckCircle} title="Availability" value={metrics.availability} unit="%" color={PRIMARY_GREEN} />
        <MetricCard icon={XCircle} title="Downtime" value={metrics.downtimeIncidents} color={PRIMARY_RED} />
        <MetricCard icon={AlertCircle} title="Error Rate" value={metrics.errorRate.toFixed(1)} unit="/min" color={PRIMARY_ORANGE} />
        <MetricCard icon={Lock} title="Deadlocks" value={metrics.deadlockCount} color="#4b5563" />
        <MetricCard icon={Clock} title="Lock Wait" value={metrics.lockWaitTime} unit="ms" color={PRIMARY_BLUE} />
      </div>

      {sectionCard(
        'Top Error Types',
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {topErrors.map((error, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>{error.type}</span>
                  <span style={{ fontSize: 11, color: '#6b7280' }}>{error.percentage}%</span>
                </div>
                <ProgressBar value={error.percentage} max={100} color={PRIMARY_RED} />
              </div>
            </div>
          ))}
        </div>
      )}
    </TabGrid>
  );

  const IndexesTab = () => (
    <TabGrid>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16 }}>
        <MetricCard icon={TrendingUp} title="Index Hit Ratio" value={metrics.indexHitRatio.toFixed(1)} unit="%" color={PRIMARY_GREEN} />
        <MetricCard icon={AlertTriangle} title="Missing Indexes" value={metrics.missingIndexes} color={PRIMARY_ORANGE} />
        <MetricCard icon={AlertCircle} title="Unused Indexes" value={metrics.unusedIndexes} color={PRIMARY_RED} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)', gap: 16 }}>
        {sectionCard(
          'Table Scan vs Index Usage',
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ name: 'Stats', tableScanRate: metrics.tableScanRate, indexHitRatio: metrics.indexHitRatio }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                <YAxis tick={{ fill: '#6b7280' }} />
                <Tooltip content={<FancyTooltip />} />
                <Legend />
                <Bar dataKey="tableScanRate" name="Scan Rate" fill={PRIMARY_ORANGE} radius={[4, 4, 0, 0]} />
                <Bar dataKey="indexHitRatio" name="Hit Ratio" fill={PRIMARY_GREEN} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </TabGrid>
  );

  const sidebarWidth = sidebarCollapsed ? 64 : 220;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #e5edf7 0%, #f3f4ff 40%, #e0ecff 100%)', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* SIDEBAR */}
      <aside style={{ width: sidebarWidth, borderRight: '1px solid #d1d5db', padding: '16px 12px', background: '#f3f4ff', display: 'flex', flexDirection: 'column', gap: 18, transition: 'width 0.25s ease', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 999, background: 'linear-gradient(135deg,#2563eb,#22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Database size={18} color="#ffffff" />
          </div>
          {!sidebarCollapsed && (
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>PostgreSQL Monitor</div>
            </div>
          )}
        </div>
        <div>
          {!sidebarCollapsed && <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, paddingLeft: 8 }}>Views</div>}
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
              <button key={item.id} onClick={() => { setActiveTab(item.id); window.location.hash = item.id; }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? 0 : 10, padding: '8px', marginBottom: 4, borderRadius: 6, border: 'none', cursor: 'pointer', background: active ? '#e5edf7' : 'transparent', color: active ? '#0f172a' : '#6b7280', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
                <Icon size={18} color={active ? PRIMARY_BLUE : '#6b7280'} />
                {!sidebarCollapsed && <span style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</span>}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button onClick={() => setSidebarCollapsed(prev => !prev)} style={{ width: '100%', borderRadius: 6, border: 'none', background: 'transparent', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', gap: 10, cursor: 'pointer', fontSize: 13, color: '#4b5563', fontWeight: 500 }}>
            {sidebarCollapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /><span>Hide Views</span></>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <header style={{ borderBottom: '1px solid #d1d5db', padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: 12, background: '#ffffff', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <div style={{ textAlign: 'right', fontSize: 12, display: 'flex', gap: 16 }}>
                <div>
                  <div style={{ color: '#64748b', marginBottom: 2 }}>Active Connections</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    <span style={{ color: PRIMARY_BLUE }}>{metrics.activeConnections}</span>
                    <span style={{ color: '#cbd5e1', margin: '0 4px' }}>/</span>{metrics.maxConnections}
                  </div>
                </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
            {recentAlerts.map((alert, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, border: '1px solid transparent', background: alert.severity === 'critical' ? '#fee2e2' : alert.severity === 'warning' ? '#ffedd5' : '#f1f5f9', color: alert.severity === 'critical' ? '#991b1b' : alert.severity === 'warning' ? '#9a3412' : '#475569' }}>
                <AlertTriangle size={12} /><span>{alert.message}</span>
              </div>
            ))}
          </div>
        </header>

        <main style={{ padding: '24px', width: '100%', boxSizing: 'border-box', overflowY: 'auto', flex: 1 }}>
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