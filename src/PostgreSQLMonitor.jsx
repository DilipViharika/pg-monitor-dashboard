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
  HeartPulse,
  ChevronRight
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
  Legend
} from 'recharts';

const PRIMARY_BLUE = '#2563eb';
const PRIMARY_GREEN = '#22c55e';
const PRIMARY_ORANGE = '#f97316';
const PRIMARY_RED = '#ef4444';

const PostgreSQLMonitor = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    infoAlerts: 15,
    indexHitRatio: 96.7,
    missingIndexes: 7,
    unusedIndexes: 12,
    tableScanRate: 15.3,
    fragmentationLevel: 23.4
  });

  const [last30Days, setLast30Days] = useState([]);
  const [queryTimeDistribution, setQueryTimeDistribution] = useState([]);
  const [tableGrowth, setTableGrowth] = useState([]);
  const [topErrors, setTopErrors] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);

  // fake data generation
  useEffect(() => {
    const thirtyDayData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      thirtyDayData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        qps: Math.floor(Math.random() * 800) + 1200,
        tps: Math.floor(Math.random() * 400) + 600,
        avgQuery: Math.random() * 30 + 30,
        errors: Math.floor(Math.random() * 15)
      });
    }
    setLast30Days(thirtyDayData);

    setQueryTimeDistribution([
      { range: '0-10ms', count: 45230, percentage: 62 },
      { range: '10-50ms', count: 18920, percentage: 26 },
      { range: '50-100ms', count: 5430, percentage: 7.5 },
      { range: '100-500ms', count: 2120, percentage: 2.9 },
      { range: '500ms-1s', count: 890, percentage: 1.2 },
      { range: '>1s', count: 310, percentage: 0.4 }
    ]);

    const growthData = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      growthData.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        orders: Math.floor(Math.random() * 50) + 150,
        customers: Math.floor(Math.random() * 30) + 80,
        products: Math.floor(Math.random() * 20) + 40,
        transactions: Math.floor(Math.random() * 70) + 200
      });
    }
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
      { severity: 'warning', message: 'High number of slow queries detected', time: '12 min ago', resolved: false },
      { severity: 'critical', message: 'Connection pool near capacity', time: '18 min ago', resolved: true },
      { severity: 'warning', message: 'Disk I/O latency increased', time: '35 min ago', resolved: true },
      { severity: 'info', message: 'Table fragmentation above threshold', time: '1 hour ago', resolved: false }
    ]);
  }, []);

  // live updates simulation
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
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) setActiveTab(hash);
  }, []);

  const formatUptime = seconds => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  };

  const sparklineData = useMemo(
    () =>
      last30Days.slice(-7).map(d => ({
        date: d.date,
        qps: d.qps,
        avgQuery: d.avgQuery
      })),
    [last30Days]
  );

  // --- Components ---

  const TabGrid = ({ children }) => (
    <div
      style={{
        width: '100%',
        // maxWidth: 1200, // REMOVED to allow full expansion
        marginLeft: 0,
        marginRight: 'auto',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr)',
        rowGap: 16
      }}
    >
      {children}
    </div>
  );

  const sectionCard = (title, children, rightNode) => (
    <div
      style={{
        background: 'linear-gradient(135deg,#ffffff 0%,#f4f5ff 40%,#e5edf7 100%)',
        borderRadius: 18,
        border: '1px solid #d1d5db',
        padding: '14px 16px 18px',
        boxShadow: '0 12px 32px rgba(15,23,42,0.10)'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8
        }}
      >
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{title}</h2>
        {rightNode || null}
      </div>
      {children}
    </div>
  );

  const MetricCard = ({ icon: Icon, title, value, unit, subtitle, color, showSpark }) => (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 16,
        border: '1px solid #d1d5db',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 10,
              background: '#e5edf7',
              border: '1px solid #d1d5db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon size={14} color={color || '#0f172a'} />
          </div>
          <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{title}</span>
        </div>
        {showSpark && sparklineData.length > 1 && (
          <div style={{ width: 60, height: 24 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="qps"
                  stroke={color || PRIMARY_BLUE}
                  strokeWidth={1.2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <div style={{ marginTop: 4 }}>
        <span style={{ fontSize: 22, fontWeight: 600, color: '#0f172a' }}>{value}</span>
        {unit && (
          <span style={{ marginLeft: 4, fontSize: 12, color: '#6b7280' }}>{unit}</span>
        )}
      </div>
      {subtitle && (
        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{subtitle}</div>
      )}
    </div>
  );

  const ProgressBar = ({ value, max, color, showPercentage }) => (
    <div style={{ width: '100%' }}>
      <div
        style={{
          width: '100%',
          backgroundColor: '#e5edf7',
          borderRadius: 999,
          height: 6,
          overflow: 'hidden',
          border: '1px solid #d1d5db'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.min((value / max) * 100, 100)}%`,
            backgroundColor: color || PRIMARY_GREEN,
            borderRadius: 999,
            transition: 'width 0.4s ease'
          }}
        />
      </div>
      {showPercentage && (
        <div
          style={{
            textAlign: 'right',
            fontSize: 10,
            color: '#6b7280',
            marginTop: 2
          }}
        >
          {((value / max) * 100).toFixed(1)}%
        </div>
      )}
    </div>
  );

  const FancyTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #d1d5db',
          borderRadius: 10,
          padding: '6px 8px',
          fontSize: 11,
          boxShadow: '0 8px 20px rgba(15,23,42,0.1)'
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
        {payload.map(entry => (
          <div key={entry.dataKey} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span style={{ marginLeft: 8 }}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  // --- Tabs ---

  const OverviewTab = () => (
    <TabGrid>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,2fr) minmax(0,1.2fr)',
          gap: 16
        }}
      >
        {sectionCard(
          'Database Activity – Last 30 Days',
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last30Days}>
                <defs>
                  <linearGradient id="qpsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PRIMARY_BLUE} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={PRIMARY_BLUE} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="tpsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PRIMARY_GREEN} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={PRIMARY_GREEN} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip content={<FancyTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="qps"
                  stroke={PRIMARY_BLUE}
                  fill="url(#qpsGrad)"
                  name="QPS"
                />
                <Area
                  type="monotone"
                  dataKey="tps"
                  stroke={PRIMARY_GREEN}
                  fill="url(#tpsGrad)"
                  name="TPS"
                />
                <Line
                  type="monotone"
                  dataKey="avgQuery"
                  stroke="#eab308"
                  strokeWidth={2}
                  name="Avg Query (ms)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {sectionCard(
          'Key Metrics',
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
              gap: 10
            }}
          >
            <MetricCard
              icon={Clock}
              title="Avg Query Time"
              value={metrics.avgQueryTime.toFixed(1)}
              unit="ms"
              color="#eab308"
              showSpark
            />
            <MetricCard
              icon={AlertCircle}
              title="Slow Queries"
              value={metrics.slowQueryCount}
              color={PRIMARY_RED}
            />
            <MetricCard
              icon={Zap}
              title="QPS"
              value={metrics.qps}
              color={PRIMARY_BLUE}
              showSpark
            />
            <MetricCard icon={Activity} title="TPS" value={metrics.tps} color={PRIMARY_GREEN} />
            <MetricCard
              icon={Server}
              title="CPU Usage"
              value={metrics.cpuUsage.toFixed(1)}
              unit="%"
              color={PRIMARY_ORANGE}
            />
            <MetricCard
              icon={Database}
              title="Memory Usage"
              value={metrics.memoryUsage.toFixed(1)}
              unit="%"
              color={PRIMARY_BLUE}
            />
          </div>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)',
          gap: 16
        }}
      >
        {sectionCard(
          'Operations Per Second',
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'SELECT', value: metrics.selectPerSec, color: PRIMARY_BLUE },
              { label: 'INSERT', value: metrics.insertPerSec, color: PRIMARY_GREEN },
              { label: 'UPDATE', value: metrics.updatePerSec, color: PRIMARY_ORANGE },
              { label: 'DELETE', value: metrics.deletePerSec, color: PRIMARY_RED }
            ].map(row => (
              <div
                key={row.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <div
                  style={{
                    width: 70,
                    fontSize: 12,
                    color: '#374151'
                  }}
                >
                  {row.label}
                </div>
                <div style={{ flex: 1 }}>
                  <ProgressBar value={row.value} max={2000} color={row.color} />
                </div>
                <div
                  style={{
                    width: 60,
                    textAlign: 'right',
                    fontSize: 12,
                    color: '#6b7280'
                  }}
                >
                  {row.value}/s
                </div>
              </div>
            ))}
          </div>
        )}

        {sectionCard(
          'Read vs Write Ratio',
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Read', value: metrics.readWriteRatio },
                    { name: 'Write', value: 100 - metrics.readWriteRatio }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  <Cell fill={PRIMARY_BLUE} />
                  <Cell fill={PRIMARY_GREEN} />
                </Pie>
                <Tooltip content={<FancyTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </TabGrid>
  );

  const PerformanceTab = () => (
    <TabGrid>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)',
          gap: 16
        }}
      >
        {sectionCard(
          'Query Execution Time Distribution',
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={queryTimeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip content={<FancyTooltip />} />
                <Bar dataKey="count" fill={PRIMARY_BLUE} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {sectionCard(
          'Performance KPIs',
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
              gap: 10
            }}
          >
            <MetricCard
              icon={Clock}
              title="Avg Query Time"
              value={metrics.avgQueryTime.toFixed(1)}
              unit="ms"
              color="#eab308"
              showSpark
            />
            <MetricCard
              icon={AlertCircle}
              title="Slow Queries"
              value={metrics.slowQueryCount}
              subtitle="> 1s"
              color={PRIMARY_RED}
            />
            <MetricCard icon={Zap} title="Queries/sec" value={metrics.qps} color={PRIMARY_BLUE} />
            <MetricCard
              icon={Activity}
              title="Transactions/sec"
              value={metrics.tps}
              color={PRIMARY_GREEN}
            />
          </div>
        )}
      </div>

      <div>
        {sectionCard(
          'Performance Trends (Last 10 Days)',
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last30Days.slice(-10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip content={<FancyTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgQuery"
                  stroke={PRIMARY_BLUE}
                  strokeWidth={2}
                  name="Avg Query (ms)"
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="errors"
                  stroke={PRIMARY_RED}
                  strokeWidth={2}
                  name="Errors"
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </TabGrid>
  );

  const ResourcesTab = () => (
    <TabGrid>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
          gap: 16
        }}
      >
        <MetricCard
          icon={Activity}
          title="CPU Usage"
          value={metrics.cpuUsage.toFixed(1)}
          unit="%"
          subtitle={`Avg: ${metrics.cpuAvg.toFixed(1)}%`}
          color={PRIMARY_ORANGE}
        />
        <MetricCard
          icon={Database}
          title="Memory Usage"
          value={metrics.memoryUsage.toFixed(1)}
          unit="%"
          subtitle={`${metrics.memoryUsed}GB / ${metrics.memoryAllocated}GB`}
          color={PRIMARY_BLUE}
        />
        <MetricCard
          icon={HardDrive}
          title="Disk Used"
          value={metrics.diskUsed.toFixed(1)}
          unit="%"
          subtitle={`${metrics.diskAvailable}GB free`}
          color={PRIMARY_GREEN}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)',
          gap: 16
        }}
      >
        {sectionCard(
          'System Resources',
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  marginBottom: 4
                }}
              >
                <span>CPU Utilization</span>
                <span style={{ fontWeight: 500 }}>
                  {metrics.cpuUsage.toFixed(1)}%
                </span>
              </div>
              <ProgressBar value={metrics.cpuUsage} max={100} color={PRIMARY_ORANGE} />
            </div>
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  marginBottom: 4
                }}
              >
                <span>Memory</span>
                <span style={{ fontWeight: 500 }}>
                  {metrics.memoryUsed}GB / {metrics.memoryAllocated}GB
                </span>
              </div>
              <ProgressBar
                value={metrics.memoryUsed}
                max={metrics.memoryAllocated}
                color={PRIMARY_GREEN}
              />
            </div>
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  marginBottom: 4
                }}
              >
                <span>Disk</span>
                <span style={{ fontWeight: 500 }}>
                  {(metrics.diskTotal - metrics.diskAvailable).toFixed(0)}GB /{' '}
                  {metrics.diskTotal}GB
                </span>
              </div>
              <ProgressBar
                value={metrics.diskTotal - metrics.diskAvailable}
                max={metrics.diskTotal}
                color={PRIMARY_BLUE}
              />
            </div>
          </div>
        )}

        {sectionCard(
          'Disk I/O Operations',
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              style={{
                padding: 10,
                borderRadius: 10,
                background: '#ffffff',
                border: '1px solid #d1d5db',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Read Rate</div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>
                  {metrics.diskIOReadRate}
                </div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>ops/sec</div>
              </div>
              <TrendingUp size={22} color={PRIMARY_BLUE} />
            </div>
            <div
              style={{
                padding: 10,
                borderRadius: 10,
                background: '#ffffff',
                border: '1px solid #d1d5db',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Write Rate</div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>
                  {metrics.diskIOWriteRate}
                </div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>ops/sec</div>
              </div>
              <TrendingDown size={22} color={PRIMARY_GREEN} />
            </div>
            <div
              style={{
                padding: 10,
                borderRadius: 10,
                background: '#ffffff',
                border: '1px solid #d1d5db',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>I/O Latency</div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>
                  {metrics.diskIOLatency.toFixed(1)}
                </div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>ms avg</div>
              </div>
              <Clock size={22} color={PRIMARY_ORANGE} />
            </div>
          </div>
        )}
      </div>

      <div>
        {sectionCard(
          'Table Size Growth – Last 12 Months',
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tableGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip content={<FancyTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stackId="1"
                  stroke={PRIMARY_BLUE}
                  fill="#60a5fa"
                  fillOpacity={0.3}
                  name="Orders (MB)"
                />
                <Area
                  type="monotone"
                  dataKey="customers"
                  stackId="1"
                  stroke={PRIMARY_GREEN}
                  fill="#4ade80"
                  fillOpacity={0.3}
                  name="Customers (MB)"
                />
                <Area
                  type="monotone"
                  dataKey="products"
                  stackId="1"
                  stroke={PRIMARY_ORANGE}
                  fill="#fdba74"
                  fillOpacity={0.3}
                  name="Products (MB)"
                />
                <Area
                  type="monotone"
                  dataKey="transactions"
                  stackId="1"
                  stroke="#a855f7"
                  fill="#c4b5fd"
                  fillOpacity={0.3}
                  name="Transactions (MB)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </TabGrid>
  );

  const ReliabilityTab = () => (
    <TabGrid>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5,minmax(0,1fr))',
          gap: 16
        }}
      >
        <MetricCard
          icon={CheckCircle}
          title="Availability"
          value={metrics.availability}
          unit="%"
          color={PRIMARY_GREEN}
        />
        <MetricCard
          icon={XCircle}
          title="Downtime Events"
          value={metrics.downtimeIncidents}
          color={PRIMARY_RED}
        />
        <MetricCard
          icon={AlertCircle}
          title="Error Rate"
          value={metrics.errorRate.toFixed(1)}
          unit="/min"
          color={PRIMARY_ORANGE}
        />
        <MetricCard icon={Lock} title="Deadlocks" value={metrics.deadlockCount} color="#4b5563" />
        <MetricCard
          icon={Clock}
          title="Lock Wait Time"
          value={metrics.lockWaitTime}
          unit="ms"
          color={PRIMARY_BLUE}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)',
          gap: 16
        }}
      >
        {sectionCard(
          'Connection Health',
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  marginBottom: 4
                }}
              >
                <span>Active Connections</span>
                <span>
                  {metrics.activeConnections} / {metrics.maxConnections}
                </span>
              </div>
              <ProgressBar
                value={metrics.activeConnections}
                max={metrics.maxConnections}
                color={PRIMARY_GREEN}
              />
            </div>
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  marginBottom: 4
                }}
              >
                <span>Idle Connections</span>
                <span>
                  {metrics.idleConnections} / {metrics.maxConnections}
                </span>
              </div>
              <ProgressBar
                value={metrics.idleConnections}
                max={metrics.maxConnections}
                color={PRIMARY_BLUE}
              />
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
                gap: 10,
                marginTop: 8
              }}
            >
              <div
                style={{
                  textAlign: 'center',
                  borderRadius: 12,
                  padding: 10,
                  background: '#fee2e2',
                  border: '1px solid #fecaca'
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 600 }}>
                  {metrics.failedConnections}
                </div>
                <div style={{ fontSize: 11, color: '#b91c1c' }}>Failed Attempts</div>
              </div>
              <div
                style={{
                  textAlign: 'center',
                  borderRadius: 12,
                  padding: 10,
                  background: '#ffedd5',
                  border: '1px solid #fed7aa'
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 600 }}>
                  {metrics.connectionWaitTime}ms
                </div>
                <div style={{ fontSize: 11, color: '#c2410c' }}>Avg Wait Time</div>
              </div>
            </div>
          </div>
        )}

        {sectionCard(
          'Top Error Types',
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topErrors.map((error, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 12
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 4
                    }}
                  >
                    <span>{error.type}</span>
                    <span style={{ fontSize: 11, color: '#6b7280' }}>
                      {error.percentage}%
                    </span>
                  </div>
                  <ProgressBar
                    value={error.percentage}
                    max={100}
                    color={PRIMARY_RED}
                    showPercentage={false}
                  />
                </div>
                <span style={{ fontSize: 11, color: '#6b7280' }}>
                  {error.count} events
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        {sectionCard(
          'Table Size Distribution',
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { name: 'Orders', size: 300, color: PRIMARY_BLUE },
              { name: 'Customers', size: 250, color: PRIMARY_GREEN },
              { name: 'Products', size: 180, color: PRIMARY_ORANGE },
              { name: 'Transactions', size: 400, color: '#a855f7' },
              { name: 'Others', size: 120, color: PRIMARY_RED }
            ].map(table => (
              <div key={table.name}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    marginBottom: 4
                  }}
                >
                  <span>{table.name}</span>
                  <span style={{ color: '#6b7280' }}>{table.size} GB</span>
                </div>
                <ProgressBar value={table.size} max={500} color={table.color} />
              </div>
            ))}
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
              Total Disk Used:{' '}
              {(metrics.diskTotal - metrics.diskAvailable).toFixed(0)} GB
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              Free Space: {metrics.diskAvailable} GB
            </div>
          </div>
        )}
      </div>
    </TabGrid>
  );

  const IndexesTab = () => (
    <TabGrid>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
          gap: 16
        }}
      >
        <MetricCard
          icon={TrendingUp}
          title="Index Hit Ratio"
          value={metrics.indexHitRatio.toFixed(1)}
          unit="%"
          color={PRIMARY_GREEN}
        />
        <MetricCard
          icon={AlertTriangle}
          title="Missing Indexes"
          value={metrics.missingIndexes}
          color={PRIMARY_ORANGE}
        />
        <MetricCard
          icon={AlertCircle}
          title="Unused Indexes"
          value={metrics.unusedIndexes}
          color={PRIMARY_RED}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)',
          gap: 16
        }}
      >
        {sectionCard(
          'Table Scan vs Index Usage',
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    name: 'Scan Stats',
                    tableScanRate: metrics.tableScanRate,
                    indexHitRatio: metrics.indexHitRatio
                  }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                <YAxis tick={{ fill: '#6b7280' }} />
                <Tooltip content={<FancyTooltip />} />
                <Legend />
                <Bar
                  dataKey="tableScanRate"
                  name="Table Scan Rate (%)"
                  fill={PRIMARY_ORANGE}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="indexHitRatio"
                  name="Index Hit Ratio (%)"
                  fill={PRIMARY_GREEN}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {sectionCard(
          'Fragmentation & Maintenance',
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  marginBottom: 4
                }}
              >
                <span>Fragmentation Level</span>
                <span style={{ fontWeight: 500 }}>
                  {metrics.fragmentationLevel.toFixed(1)}%
                </span>
              </div>
              <ProgressBar
                value={metrics.fragmentationLevel}
                max={100}
                color={
                  metrics.fragmentationLevel > 40
                    ? PRIMARY_RED
                    : metrics.fragmentationLevel > 20
                    ? PRIMARY_ORANGE
                    : PRIMARY_GREEN
                }
                showPercentage
              />
            </div>
            <p style={{ fontSize: 11, color: '#6b7280' }}>
              Higher fragmentation and table scan rate suggest VACUUM / REINDEX and
              index tuning may be needed.
            </p>
          </div>
        )}
      </div>
    </TabGrid>
  );

  const sidebarWidth = sidebarCollapsed ? 64 : 220;

  return (
    <div
      style={{
        minHeight: '100vh',
        height: '100%',
        width: '100%',
        display: 'flex',
        background: 'linear-gradient(135deg, #e5edf7 0%, #f3f4ff 40%, #e0ecff 100%)',
        color: '#0f172a',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
      }}
    >
      {/* SIDEBAR */}
      <aside
        style={{
          width: sidebarWidth,
          borderRight: '1px solid #d1d5db',
          padding: '16px 12px',
          background: '#f3f4ff',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          transition: 'width 0.25s ease',
          flexShrink: 0 // Ensure sidebar doesn't shrink when main expands
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: 'linear-gradient(135deg,#2563eb,#22c55e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Database size={18} color="#ffffff" />
          </div>
          {!sidebarCollapsed && (
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>PostgreSQL Monitor</div>
              {/*<div style={{ fontSize: 11, color: '#6b7280' }}>Prod Cluster</div> */}
            </div>
          )}
        </div>

        <div>
          {!sidebarCollapsed && (
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, paddingLeft: 8 }}>Views</div>
          )}
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
                onClick={() => {
                  setActiveTab(item.id);
                  window.location.hash = item.id;
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: sidebarCollapsed ? 0 : 10,
                  padding: '8px',
                  marginBottom: 4,
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  background: active ? '#e5edf7' : 'transparent',
                  color: active ? '#0f172a' : '#6b7280',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
                }}
              >
                <Icon size={18} color={active ? PRIMARY_BLUE : '#6b7280'} />
                {!sidebarCollapsed && (
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* FOOTER SECTION FIX */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 12,
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}
        >
          {!sidebarCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 8, marginBottom: 4 }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: '#16a34a',
                  flexShrink: 0,
                  boxShadow: '0 0 0 2px #dcfce7'
                }}
              />
              <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>
                Live metrics on
              </span>
            </div>
          )}

          <button
            onClick={() => setSidebarCollapsed(prev => !prev)}
            style={{
              width: '100%',
              borderRadius: 6,
              border: 'none',
              background: 'transparent', // Changed from white to transparent
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              gap: 10,
              cursor: 'pointer',
              fontSize: 13,
              color: '#4b5563',
              fontWeight: 500,
              transition: 'background 0.2s ease, color 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#e5edf7'; // Match nav hover style
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#4b5563';
            }}
          >
            {sidebarCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <>
                <ChevronLeft size={18} />
                <span>Hide Views</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT (Header + Main) */}
      <div 
        style={{ 
          flex: 1,             // Take all remaining space
          display: 'flex', 
          flexDirection: 'column', 
          height: '100vh', 
          overflow: 'hidden',
          minWidth: 0          // Crucial for nested flex containers to shrink/grow properly
        }}
      >
        <header
          style={{
            borderBottom: '1px solid #d1d5db',
            padding: '12px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            background: '#ffffff',
            zIndex: 10
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#1e293b' }}>Live Monitoring</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Queries, resources, locks, and index health</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 12 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                {/* Removed Cluster Health from here */}

                
                <div>
                  <div style={{ color: '#64748b', marginBottom: 2 }}>Active Connections</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    <span style={{ color: PRIMARY_BLUE }}>{metrics.activeConnections}</span>
                    <span style={{ color: '#cbd5e1', margin: '0 4px' }}>/</span>
                    {metrics.maxConnections}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}
          >
            {recentAlerts.slice(0, 3).map((alert, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 500,
                  border: '1px solid transparent',
                  background:
                    alert.severity === 'critical'
                      ? '#fee2e2'
                      : alert.severity === 'warning'
                      ? '#ffedd5'
                      : '#f1f5f9',
                   color: 
                    alert.severity === 'critical'
                      ? '#991b1b'
                      : alert.severity === 'warning'
                      ? '#9a3412'
                      : '#475569'
                }}
              >
                <AlertTriangle size={12} />
                <span>{alert.message}</span>
              </div>
            ))}
          </div>
        </header>

        <main
          style={{
            padding: '24px',
            width: '100%',
            boxSizing: 'border-box',
            overflowY: 'auto',
            flex: 1 // Scroll independently from header
          }}
        >
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