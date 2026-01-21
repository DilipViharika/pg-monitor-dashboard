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
    qps: 1997, // Matched image
    tps: 892,
    cpuUsage: 42.5,
    memoryUsage: 67.8,
    diskUsed: 54.3,
    diskTotal: 1000,
    diskIOReadRate: 245,
    diskIOWriteRate: 128,
    diskIOLatency: 8.5,
    activeConnections: 43, // Matched image
    maxConnections: 100,
    availability: 99.94,
    downtimeIncidents: 2,
    errorRate: 3.2,
    deadlockCount: 5,
    lockWaitTime: 234,
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
      });
    }
    setTimeSeriesData(series);

    // 2. Query Scatter
    const queries = Array.from({ length: 40 }, (_, i) => ({
      id: i,
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
        heatmap.push({ hour: i, load: Math.floor(Math.random() * 100) })
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
        activeConnections: Math.floor(Math.random() * 5) + 40 // keep around 43 for demo
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // --- Helper Components ---

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

  const TabGrid = ({ children }) => (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {children}
    </div>
  );

  const sectionCard = (title, children) => (
    <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>{title}</h2>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </div>
  );

  const MetricCard = ({ icon: Icon, title, value, unit, color }) => (
    <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: 16, boxShadow: '0 2px 4px -1px rgba(0,0,0,0.05)' }}>
       <div style={{ padding: 10, borderRadius: 10, background: `${color}15` }}>
          <Icon size={20} color={color} />
       </div>
       <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginBottom: 4 }}>{title}</span>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
             <span style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>{value}</span>
             {unit && <span style={{ marginLeft: 4, fontSize: 13, color: '#94a3b8' }}>{unit}</span>}
          </div>
       </div>
    </div>
  );

  const ProgressBar = ({ value, max, color }) => (
    <div style={{ width: '100%' }}>
      <div style={{ width: '100%', backgroundColor: '#f1f5f9', borderRadius: 999, height: 6, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min((value / max) * 100, 100)}%`, backgroundColor: color || PRIMARY_GREEN, borderRadius: 999 }} />
      </div>
    </div>
  );

  // --- TABS ---

  const OverviewTab = () => (
    <TabGrid>
      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 20, height: 400 }}>
        {sectionCard(
          'Load vs Latency Correlation',
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timeSeriesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis yAxisId="left" orientation="left" stroke={PRIMARY_BLUE} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke={PRIMARY_ORANGE} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<FancyTooltip />} />
              <Legend iconType="plainline" />
              <Bar yAxisId="left" dataKey="tps" name="TPS" fill={PRIMARY_BLUE} radius={[4, 4, 0, 0]} fillOpacity={0.9} barSize={20} />
              <Line yAxisId="right" type="monotone" dataKey="latency" name="Latency (ms)" stroke={PRIMARY_ORANGE} strokeWidth={3} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {sectionCard(
          'System Health Radar',
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Health" dataKey="A" stroke={PRIMARY_GREEN} strokeWidth={2} fill={PRIMARY_GREEN} fillOpacity={0.3} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 20 }}>
        <MetricCard icon={Zap} title="QPS" value={metrics.qps} color={PRIMARY_BLUE} />
        <MetricCard icon={Clock} title="Avg Query" value={metrics.avgQueryTime.toFixed(1)} unit="ms" color="#eab308" />
        <MetricCard icon={Activity} title="Active Conn" value={metrics.activeConnections} color={PRIMARY_PURPLE} />
        <MetricCard icon={CheckCircle} title="Availability" value={metrics.availability} unit="%" color={PRIMARY_GREEN} />
      </div>
    </TabGrid>
  );

  const PerformanceTab = () => (
    <TabGrid>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 20 }}>
        {sectionCard(
          'Query Quadrant (Freq vs Duration)',
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="duration" name="Duration" unit="ms" label={{ value: 'Duration', position: 'bottom', offset: 0, fontSize: 11 }} tick={{fontSize: 11}}/>
                <YAxis type="number" dataKey="frequency" name="Frequency" label={{ value: 'Freq', angle: -90, position: 'insideLeft', fontSize: 11 }} tick={{fontSize: 11}}/>
                <ZAxis type="number" dataKey="impact" range={[60, 400]} name="Impact" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Read" data={queryScatterData.filter(d => d.type === 'READ')} fill={PRIMARY_BLUE} />
                <Scatter name="Write" data={queryScatterData.filter(d => d.type === 'WRITE')} fill={PRIMARY_RED} shape="triangle" />
                <Legend />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        {sectionCard(
          'Hourly Activity Heatmap',
          <div style={{ height: 350 }}>
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyHeatmap} layout="vertical" margin={{ left: 10 }}>
                   <XAxis type="number" hide />
                   <YAxis dataKey="hour" type="category" width={30} tick={{fontSize: 11}} />
                   <Tooltip />
                   <Bar dataKey="load" name="Load Intensity" barSize={12} radius={[0, 4, 4, 0]}>
                     {hourlyHeatmap.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.load > 80 ? PRIMARY_RED : entry.load > 50 ? PRIMARY_ORANGE : PRIMARY_BLUE} />
                     ))}
                   </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 20 }}>
        <MetricCard icon={AlertCircle} title="Slow Queries (>1s)" value={metrics.slowQueryCount} color={PRIMARY_RED} />
        <MetricCard icon={Activity} title="Transactions/sec" value={metrics.tps} color={PRIMARY_GREEN} />
      </div>
    </TabGrid>
  );

  const ResourcesTab = () => (
    <TabGrid>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 20 }}>
        <MetricCard icon={Activity} title="CPU Usage" value={metrics.cpuUsage.toFixed(1)} unit="%" color={PRIMARY_ORANGE} />
        <MetricCard icon={Database} title="Memory Usage" value={metrics.memoryUsage.toFixed(1)} unit="%" color={PRIMARY_BLUE} />
        <MetricCard icon={HardDrive} title="Disk Used" value={metrics.diskUsed.toFixed(1)} unit="%" color={PRIMARY_GREEN} />
      </div>

      <div style={{ height: 400 }}>
        {sectionCard(
          'Storage Topology',
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 20 }}>
        <MetricCard icon={CheckCircle} title="Availability" value={metrics.availability} unit="%" color={PRIMARY_GREEN} />
        <MetricCard icon={XCircle} title="Downtime" value={metrics.downtimeIncidents} color={PRIMARY_RED} />
        <MetricCard icon={AlertCircle} title="Error Rate" value={metrics.errorRate.toFixed(1)} unit="/min" color={PRIMARY_ORANGE} />
        <MetricCard icon={Lock} title="Deadlocks" value={metrics.deadlockCount} color="#4b5563" />
        <MetricCard icon={Clock} title="Lock Wait" value={metrics.lockWaitTime} unit="ms" color={PRIMARY_BLUE} />
      </div>

      {sectionCard(
        'Top Error Types',
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {topErrors.map((error, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
              <div style={{ width: 150, color: '#475569' }}>{error.type}</div>
              <div style={{ flex: 1 }}>
                <ProgressBar value={error.percentage} max={100} color={PRIMARY_RED} />
              </div>
              <div style={{ width: 40, textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>{error.percentage}%</div>
            </div>
          ))}
        </div>
      )}
    </TabGrid>
  );

  const IndexesTab = () => (
    <TabGrid>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 20 }}>
        <MetricCard icon={TrendingUp} title="Index Hit Ratio" value={metrics.indexHitRatio.toFixed(1)} unit="%" color={PRIMARY_GREEN} />
        <MetricCard icon={AlertTriangle} title="Missing Indexes" value={metrics.missingIndexes} color={PRIMARY_ORANGE} />
        <MetricCard icon={AlertCircle} title="Unused Indexes" value={metrics.unusedIndexes} color={PRIMARY_RED} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 20 }}>
        {sectionCard(
          'Table Scan vs Index Usage',
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ name: 'Usage', tableScanRate: metrics.tableScanRate, indexHitRatio: metrics.indexHitRatio }]} layout="vertical" barSize={30}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} tick={{fontSize: 11}} />
                <YAxis dataKey="name" type="category" hide />
                <Tooltip content={<FancyTooltip />} />
                <Legend />
                <Bar dataKey="tableScanRate" name="Scan Rate" fill={PRIMARY_ORANGE} radius={[0, 4, 4, 0]} />
                <Bar dataKey="indexHitRatio" name="Hit Ratio" fill={PRIMARY_GREEN} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </TabGrid>
  );

  const sidebarWidth = sidebarCollapsed ? 70 : 240;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f3f6fc', color: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: sidebarWidth, borderRight: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', flexDirection: 'column', transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', flexShrink: 0, zIndex: 20 }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', padding: sidebarCollapsed ? '0' : '0 24px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${PRIMARY_BLUE}, ${PRIMARY_PURPLE})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Database size={18} color="#ffffff" />
          </div>
          {!sidebarCollapsed && <span style={{ marginLeft: 12, fontWeight: 700, fontSize: 15, color: '#1e293b' }}>DB Monitor</span>}
        </div>
        
        <div style={{ padding: '24px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'performance', label: 'Performance', icon: Zap },
            { id: 'resources', label: 'Resources', icon: HardDrive },
            { id: 'reliability', label: 'Reliability', icon: CheckCircle },
            { id: 'indexes', label: 'Indexes', icon: TrendingUp }
          ].map(item => {
            const active = activeTab === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => { setActiveTab(item.id); window.location.hash = item.id; }} 
                style={{ 
                  width: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12, 
                  padding: '12px', 
                  borderRadius: 8, 
                  border: 'none', 
                  cursor: 'pointer', 
                  background: active ? '#eff6ff' : 'transparent', 
                  color: active ? PRIMARY_BLUE : '#64748b',
                  transition: 'all 0.2s',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                }}
              >
                <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
                {!sidebarCollapsed && <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>}
              </button>
            );
          })}
        </div>

        <div style={{ padding: 12, borderTop: '1px solid #f1f5f9' }}>
          <button onClick={() => setSidebarCollapsed(prev => !prev)} style={{ width: '100%', borderRadius: 8, border: 'none', background: '#f8fafc', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* HEADER */}
        <header style={{ height: 64, borderBottom: '1px solid #e2e8f0', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', background: '#ffffff', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
             <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Connections</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                   <span style={{ fontSize: 16, fontWeight: 700, color: PRIMARY_BLUE }}>{metrics.activeConnections}</span>
                   <span style={{ fontSize: 14, color: '#cbd5e1' }}>/</span>
                   <span style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>{metrics.maxConnections}</span>
                </div>
             </div>
          </div>
        </header>

        {/* SCROLLABLE DASHBOARD AREA */}
        <main style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
          <div style={{ maxWidth: 1600, margin: '0 auto' }}>
            
            {/* ALERTS SECTION (Moved out of header) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
              {recentAlerts.map((alert, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  padding: '8px 16px', 
                  borderRadius: 20, 
                  fontSize: 12, 
                  fontWeight: 600, 
                  background: alert.severity === 'critical' ? '#fef2f2' : alert.severity === 'warning' ? '#fff7ed' : '#f0f9ff', 
                  color: alert.severity === 'critical' ? '#dc2626' : alert.severity === 'warning' ? '#c2410c' : '#0369a1',
                  border: `1px solid ${alert.severity === 'critical' ? '#fecaca' : alert.severity === 'warning' ? '#fed7aa' : '#e0f2fe'}`
                }}>
                  <AlertTriangle size={14} />
                  <span>{alert.message}</span>
                </div>
              ))}
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'performance' && <PerformanceTab />}
            {activeTab === 'resources' && <ResourcesTab />}
            {activeTab === 'reliability' && <ReliabilityTab />}
            {activeTab === 'indexes' && <IndexesTab />}
            
          </div>
        </main>
      </div>
    </div>
  );
};

export default PostgreSQLMonitor;