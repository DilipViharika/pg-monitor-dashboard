import React, { useState, useEffect } from 'react';
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
  XCircle
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

const PostgreSQLMonitor = () => {
  const [activeTab, setActiveTab] = useState('overview');

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

  // fake data
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

  // live updates
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

  const formatUptime = seconds => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  };

  // ---- Light-theme helpers ----

  const sectionCard = (title, children, rightNode) => (
    <div
      style={{
        background: 'linear-gradient(135deg,#ffffff 0%,#f3f4ff 60%,#e5edf7 100%)',
        borderRadius: 16,
        border: '1px solid #d1d5db',
        padding: '14px 16px',
        boxShadow: '0 10px 30px rgba(15,23,42,0.08)'
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

  const MetricCard = ({ icon: Icon, title, value, unit, subtitle }) => (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 14,
        border: '1px solid #d1d5db',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}
    >
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
          <Icon size={14} color="#0f172a" />
        </div>
        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{title}</span>
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
            backgroundColor: color || '#22c55e',
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

  // ---- Tabs (same logic, light colors) ----

  const OverviewTab = () => (
    <>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 2 }}>
          {sectionCard(
            'Database Activity – Last 30 Days',
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last30Days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: 12,
                      border: '1px solid #d1d5db',
                      fontSize: 11
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="qps"
                    stroke="#2563eb"
                    fill="#60a5fa"
                    fillOpacity={0.3}
                    name="QPS"
                  />
                  <Area
                    type="monotone"
                    dataKey="tps"
                    stroke="#22c55e"
                    fill="#4ade80"
                    fillOpacity={0.3}
                    name="TPS"
                  />
                  <Line
                    type="monotone"
                    dataKey="avgQuery"
                    stroke="#eab308"
                    strokeWidth={2}
                    name="Avg Query (ms)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div style={{ flex: 1.2 }}>
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
              />
              <MetricCard
                icon={AlertCircle}
                title="Slow Queries"
                value={metrics.slowQueryCount}
              />
              <MetricCard icon={Zap} title="QPS" value={metrics.qps} />
              <MetricCard icon={Activity} title="TPS" value={metrics.tps} />
              <MetricCard
                icon={Server}
                title="CPU Usage"
                value={metrics.cpuUsage.toFixed(1)}
                unit="%"
              />
              <MetricCard
                icon={Database}
                title="Memory Usage"
                value={metrics.memoryUsage.toFixed(1)}
                unit="%"
              />
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1.6 }}>
          {sectionCard(
            'Operations Per Second',
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'SELECT', value: metrics.selectPerSec, color: '#2563eb' },
                { label: 'INSERT', value: metrics.insertPerSec, color: '#22c55e' },
                { label: 'UPDATE', value: metrics.updatePerSec, color: '#f97316' },
                { label: 'DELETE', value: metrics.deletePerSec, color: '#ef4444' }
              ].map(row => (
                <div key={row.label}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 12,
                      marginBottom: 4
                    }}
                  >
                    <span>{row.label}</span>
                    <span style={{ color: '#6b7280' }}>{row.value}/s</span>
                  </div>
                  <ProgressBar value={row.value} max={2000} color={row.color} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
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
                    outerRadius={80}
                    dataKey="value"
                  >
                    <Cell fill="#2563eb" />
                    <Cell fill="#22c55e" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: 12,
                      border: '1px solid #d1d5db',
                      fontSize: 11
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </>
  );

  const PerformanceTab = () => (
    <>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1.3 }}>
          {sectionCard(
            'Query Execution Time Distribution',
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={queryTimeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: 12,
                      border: '1px solid #d1d5db',
                      fontSize: 11
                    }}
                  />
                  <Bar dataKey="count" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
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
              />
              <MetricCard
                icon={AlertCircle}
                title="Slow Queries"
                value={metrics.slowQueryCount}
                subtitle="> 1s"
              />
              <MetricCard icon={Zap} title="Queries/sec" value={metrics.qps} />
              <MetricCard icon={Activity} title="Transactions/sec" value={metrics.tps} />
            </div>
          )}
        </div>
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: 12,
                    border: '1px solid #d1d5db',
                    fontSize: 11
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgQuery"
                  stroke="#2563eb"
                  strokeWidth={2}
                  name="Avg Query (ms)"
                />
                <Line
                  type="monotone"
                  dataKey="errors"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Errors"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </>
  );

  const ResourcesTab = () => (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
          gap: 16,
          marginBottom: 16
        }}
      >
        <MetricCard
          icon={Activity}
          title="CPU Usage"
          value={metrics.cpuUsage.toFixed(1)}
          unit="%"
          subtitle={`Avg: ${metrics.cpuAvg.toFixed(1)}%`}
        />
        <MetricCard
          icon={Database}
          title="Memory Usage"
          value={metrics.memoryUsage.toFixed(1)}
          unit="%"
          subtitle={`${metrics.memoryUsed}GB / ${metrics.memoryAllocated}GB`}
        />
        <MetricCard
          icon={HardDrive}
          title="Disk Used"
          value={metrics.diskUsed.toFixed(1)}
          unit="%"
          subtitle={`${metrics.diskAvailable}GB free`}
        />
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1.3 }}>
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
                <ProgressBar value={metrics.cpuUsage} max={100} />
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
                <ProgressBar value={metrics.memoryUsed} max={metrics.memoryAllocated} />
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
                />
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>
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
                <TrendingUp size={22} color="#2563eb" />
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
                <TrendingDown size={22} color="#22c55e" />
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
                <Clock size={22} color="#f97316" />
              </div>
            </div>
          )}
        </div>
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: 12,
                    border: '1px solid #d1d5db',
                    fontSize: 11
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stackId="1"
                  stroke="#2563eb"
                  fill="#60a5fa"
                  fillOpacity={0.3}
                  name="Orders (MB)"
                />
                <Area
                  type="monotone"
                  dataKey="customers"
                  stackId="1"
                  stroke="#22c55e"
                  fill="#4ade80"
                  fillOpacity={0.3}
                  name="Customers (MB)"
                />
                <Area
                  type="monotone"
                  dataKey="products"
                  stackId="1"
                  stroke="#f97316"
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
    </>
  );

  const ReliabilityTab = () => (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5,minmax(0,1fr))',
          gap: 16,
          marginBottom: 16
        }}
      >
        <MetricCard
          icon={CheckCircle}
          title="Availability"
          value={metrics.availability}
          unit="%"
        />
        <MetricCard
          icon={XCircle}
          title="Downtime Events"
          value={metrics.downtimeIncidents}
        />
        <MetricCard
          icon={AlertCircle}
          title="Error Rate"
          value={metrics.errorRate.toFixed(1)}
          unit="/min"
        />
        <MetricCard icon={Lock} title="Deadlocks" value={metrics.deadlockCount} />
        <MetricCard
          icon={Clock}
          title="Lock Wait Time"
          value={metrics.lockWaitTime}
          unit="ms"
        />
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1.3 }}>
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
                  color="#2563eb"
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
        </div>

        <div style={{ flex: 1 }}>
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
                      color="#ef4444"
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
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1.3 }}>
          {sectionCard(
            'Table Size Distribution',
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { name: 'Orders', size: 300, color: '#2563eb' },
                { name: 'Customers', size: 250, color: '#22c55e' },
                { name: 'Products', size: 180, color: '#f97316' },
                { name: 'Transactions', size: 400, color: '#a855f7' },
                { name: 'Others', size: 120, color: '#ef4444' }
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
                  <ProgressBar
                    value={table.size}
                    max={500} // Assuming a max size for visualization
                    color={table.color}
                  />
                </div>
              ))}
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
                Total Disk Used: {(metrics.diskTotal - metrics.diskAvailable).toFixed(0)} GB
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                Free Space: {metrics.diskAvailable} GB
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  const IndexesTab = () => (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
          gap: 16,
          marginBottom: 16
        }}
      >
        <MetricCard
          icon={TrendingUp}
          title="Index Hit Ratio"
          value={metrics.indexHitRatio.toFixed(1)}
          unit="%"
        />
        <MetricCard
          icon={AlertTriangle}
          title="Missing Indexes"
          value={metrics.missingIndexes}
        />
        <MetricCard
          icon={AlertCircle}
          title="Unused Indexes"
          value={metrics.unusedIndexes}
        />
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1.3 }}>
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
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: 12,
                      border: '1px solid #d1d5db',
                      fontSize: 11
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="tableScanRate"
                    name="Table Scan Rate (%)"
                    fill="#f97316"
                  />
                  <Bar
                    dataKey="indexHitRatio"
                    name="Index Hit Ratio (%)"
                    fill="#22c55e"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
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
                      ? '#ef4444'
                      : metrics.fragmentationLevel > 20
                      ? '#f97316'
                      : '#22c55e'
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
      </div>
    </>
  );

  // -------- MAIN SHELL (light background) --------
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
          width: 260,
          borderRight: '1px solid #d1d5db',
          padding: '16px 18px',
          background: '#f3f4ff',
          display: 'flex',
          flexDirection: 'column',
          gap: 18
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
              justifyContent: 'center'
            }}
          >
            <Database size={18} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>PostgreSQL Monitor</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>Prod Cluster</div>
          </div>
        </div>

        <div
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            background: '#ffffff',
            border: '1px solid #d1d5db'
          }}
        >
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
            Cluster Health
          </div>
          <div
            style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}
          >
            <span>Availability</span>
            <span style={{ color: '#16a34a', fontWeight: 600 }}>
              {metrics.availability}%
            </span>
          </div>
          <div
            style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}
          >
            <span>Uptime</span>
            <span>{formatUptime(metrics.uptime)}</span>
          </div>
        </div>

        <div
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            background: '#ffffff',
            border: '1px solid #d1d5db'
          }}
        >
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
            Disk Usage
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span>Total Disk</span>
            <span>{metrics.diskTotal}GB</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span>Used Disk</span>
            <span>{(metrics.diskTotal - metrics.diskAvailable).toFixed(0)}GB</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span>Free Disk</span>
            <span>{metrics.diskAvailable}GB</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>Views</div>
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
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 8px',
                  marginBottom: 4,
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  background: active ? '#e5edf7' : 'transparent',
                  color: active ? '#0f172a' : '#6b7280'
                }}
              >
                <Icon size={14} color={active ? '#2563eb' : '#6b7280'} />
                <span style={{ fontSize: 12 }}>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 'auto',
            fontSize: 11,
            color: '#6b7280',
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: '#16a34a'
              }}
            />
            Live metrics every 15 seconds
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header
          style={{
            borderBottom: '1px solid #d1d5db',
            padding: '12px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            background: '#e5edf7',
            position: 'sticky',
            top: 0,
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
              <div style={{ fontSize: 16, fontWeight: 600 }}>Live Monitoring</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>
                Queries, resources, locks, and index health
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 11 }}>
              <div style={{ color: '#6b7280' }}>Active Connections</div>
              <div style={{ fontWeight: 600 }}>
                {metrics.activeConnections}/{metrics.maxConnections}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
            {recentAlerts.slice(0, 3).map((alert, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 8px',
                  borderRadius: 999,
                  fontSize: 11,
                  border: '1px solid #e5e7eb',
                  background:
                    alert.severity === 'critical'
                      ? '#fee2e2'
                      : alert.severity === 'warning'
                      ? '#ffedd5'
                      : '#e5edf7'
                }}
              >
                <AlertTriangle size={12} color="#b91c1c" />
                <span>{alert.message}</span>
              </div>
            ))}
          </div>
        </header>

        <main
          style={{
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            width: '100%',
            boxSizing: 'border-box'
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
