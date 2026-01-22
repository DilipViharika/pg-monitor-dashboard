import React, { useState, useEffect } from 'react';
import {
  Activity, Database, HardDrive, Zap, Clock, AlertTriangle,
  TrendingUp, TrendingDown, Server, Lock, AlertCircle, CheckCircle,
  XCircle, Search, Cpu, Layers, Terminal, Power, RefreshCw, 
  ChevronLeft, ChevronRight, User as UserIcon, Globe, Network, 
  LogOut, Shield, Key, Mail, Chrome, UserPlus, Settings, Eye, Edit3
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';

// --- THEME & CONSTANTS ---
const THEME = {
  bg: '#020617', // Deep Ink Black
  glass: 'rgba(15, 23, 42, 0.6)',
  glassBorder: 'rgba(56, 189, 248, 0.1)',
  textMain: '#F8FAFC',
  textMuted: '#94A3B8',
  primary: '#0EA5E9', // Sky Blue
  secondary: '#8B5CF6', // Violet
  success: '#10B981', // Emerald
  warning: '#F59E0B', // Amber
  danger: '#F43F5E', // Rose
  grid: '#1E293B',
  ai: '#a855f7' // Purple for AI
};

// --- AUTHENTICATION & USER MANAGEMENT HOOK ---
const useMockAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Default Admin User
  const defaultAdmin = { 
    id: 1, 
    email: 'admin', 
    name: 'System Administrator', 
    role: 'Super Admin', 
    accessLevel: 'write',
    allowedScreens: ['overview', 'performance', 'resources', 'reliability', 'indexes', 'api', 'admin'] 
  };

  // Mock Database
  const [allUsers, setAllUsers] = useState(() => {
    const saved = localStorage.getItem('pg_monitor_users_db');
    return saved ? JSON.parse(saved) : [defaultAdmin];
  });

  useEffect(() => {
    localStorage.setItem('pg_monitor_users_db', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    const storedUserRaw = localStorage.getItem('pg_monitor_user');
    if (storedUserRaw) {
      try {
        const storedUser = JSON.parse(storedUserRaw);
        if (!storedUser.allowedScreens) {
           localStorage.removeItem('pg_monitor_user');
           setCurrentUser(null);
        } else {
           setCurrentUser(storedUser);
        }
      } catch (e) {
        localStorage.removeItem('pg_monitor_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (loginId, password) => {
    setLoading(true);
    setError(null);
    return new Promise((resolve) => {
      setTimeout(() => {
        const normalizedId = loginId.toLowerCase().trim();
        const foundUser = allUsers.find(u => u.email.toLowerCase() === normalizedId);
        
        if (normalizedId === 'admin') {
            if (password === 'admin') {
                setCurrentUser(foundUser);
                localStorage.setItem('pg_monitor_user', JSON.stringify(foundUser));
                setLoading(false);
                resolve(true);
                return;
            } else {
                setError('Invalid admin credentials.');
                setLoading(false);
                resolve(false);
                return;
            }
        }

        if (foundUser && password.length >= 4) { 
           setCurrentUser(foundUser);
           localStorage.setItem('pg_monitor_user', JSON.stringify(foundUser));
           setLoading(false);
           resolve(true);
           return;
        }

        setError('Invalid credentials or access denied.');
        setLoading(false);
        resolve(false);
      }, 1000); 
    });
  };

  const googleLogin = async () => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const googleUser = { 
            id: 999,
            email: 'google_user@gmail.com', 
            name: 'Google User', 
            role: 'Viewer', 
            accessLevel: 'read',
            allowedScreens: ['overview', 'resources']
        };
        setCurrentUser(googleUser);
        localStorage.setItem('pg_monitor_user', JSON.stringify(googleUser));
        setLoading(false);
        resolve(true);
      }, 1500);
    });
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pg_monitor_user');
  };

  const createUser = (newUser) => {
      const userWithId = { ...newUser, id: Date.now() };
      setAllUsers(prev => [...prev, userWithId]);
  };

  return { currentUser, loading, error, login, googleLogin, logout, allUsers, createUser };
};

// --- MOCK DATA ---
const mockConnections = [
  { pid: 14023, user: 'postgres', db: 'production', app: 'pgAdmin 4', state: 'active', duration: '00:00:04', query: 'SELECT * FROM pg_stat_activity WHERE state = \'active\';', ip: '192.168.1.5' },
  { pid: 14099, user: 'app_user', db: 'production', app: 'NodeJS Backend', state: 'idle in transaction', duration: '00:15:23', query: 'UPDATE orders SET status = \'processing\' WHERE id = 4591;', ip: '10.0.0.12' },
];

const apiQueryData = [
  { id: 'api_1', method: 'GET', endpoint: '/api/v1/stats', avg_duration: 320, calls_per_min: 850, db_time_pct: 85, queries: [], ai_insight: 'Heavy aggregation detected.' },
  { id: 'api_2', method: 'POST', endpoint: '/api/v1/orders', avg_duration: 180, calls_per_min: 120, db_time_pct: 60, queries: [], ai_insight: 'N+1 Query issue detected.' }
];

// --- GLOBAL SVG FILTERS ---
const ChartDefs = () => (
  <svg style={{ height: 0, width: 0, position: 'absolute' }}>
    <defs>
      <filter id="neonGlow" height="300%" width="300%" x="-75%" y="-75%">
        <feGaussianBlur stdDeviation="5" result="coloredBlur" />
        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.4} />
        <stop offset="100%" stopColor={THEME.primary} stopOpacity={0} />
      </linearGradient>
    </defs>
  </svg>
);

// --- COMPONENT: LOGIN PAGE (ALIGNED) ---
const LoginPage = ({ onLogin, onGoogleLogin, loading, error }) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div style={{ height: '100vh', width: '100vw', background: THEME.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {/* Background Graphic */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.2, pointerEvents: 'none' }}>
         <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={Array.from({length:20}, (_,i)=>({v: Math.random()*100}))}>
               <ChartDefs />
               <Area type="monotone" dataKey="v" stroke={THEME.primary} fill="url(#primaryGradient)" strokeWidth={2} />
            </AreaChart>
         </ResponsiveContainer>
      </div>
      
      <div style={{ width: 400, padding: 40, borderRadius: 24, background: 'rgba(15, 23, 42, 0.7)', border: `1px solid ${THEME.glassBorder}`, backdropFilter: 'blur(20px)', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, margin: '0 auto 16px', background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${THEME.primary}40` }}>
            <Database color="#fff" size={32} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: THEME.textMain }}>PG Monitor</h1>
          <p style={{ color: THEME.textMuted, fontSize: 13, marginTop: 4 }}>Secure Database Intelligence</p>
        </div>

        {error && (
            <div style={{ color: '#fca5a5', padding: 12, background: 'rgba(244,63,94,0.1)', borderRadius: 8, marginBottom: 20, fontSize: 12, border: `1px solid ${THEME.danger}40`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={16} /> {error}
            </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); onLogin(loginId, password); }}>
           {/* ALIGNED INPUT GROUP 1 */}
           <div style={{ position: 'relative', marginBottom: 16 }}>
               <Mail size={18} color={THEME.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
               <input 
                 type="text" 
                 placeholder="Login ID (default: admin)" 
                 value={loginId} 
                 onChange={e => setLoginId(e.target.value)} 
                 style={{ 
                    width: '100%', 
                    padding: '12px 12px 12px 44px', // Consistent padding for icon
                    background: 'rgba(2, 6, 23, 0.5)', 
                    border: `1px solid ${THEME.grid}`, 
                    borderRadius: 8, 
                    color: 'white',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.2s'
                 }} 
                 onFocus={(e) => e.target.style.borderColor = THEME.primary}
                 onBlur={(e) => e.target.style.borderColor = THEME.grid}
               />
           </div>

           {/* ALIGNED INPUT GROUP 2 */}
           <div style={{ position: 'relative', marginBottom: 24 }}>
               <Key size={18} color={THEME.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
               <input 
                 type="password" 
                 placeholder="Password (default: admin)" 
                 value={password} 
                 onChange={e => setPassword(e.target.value)} 
                 style={{ 
                    width: '100%', 
                    padding: '12px 12px 12px 44px', // Consistent padding for icon
                    background: 'rgba(2, 6, 23, 0.5)', 
                    border: `1px solid ${THEME.grid}`, 
                    borderRadius: 8, 
                    color: 'white',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.2s'
                 }} 
                 onFocus={(e) => e.target.style.borderColor = THEME.primary}
                 onBlur={(e) => e.target.style.borderColor = THEME.grid}
               />
           </div>

           <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, background: `linear-gradient(90deg, ${THEME.primary}, ${THEME.secondary})`, border: 'none', borderRadius: 8, color: 'white', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
               {loading ? 'Authenticating...' : 'Sign In'}
           </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ height: 1, flex: 1, background: THEME.grid }}></div>
            <span style={{ fontSize: 11, color: THEME.textMuted }}>OR CONTINUE WITH</span>
            <div style={{ height: 1, flex: 1, background: THEME.grid }}></div>
        </div>
        
        <button onClick={onGoogleLogin} style={{ width: '100%', padding: 12, background: 'white', border: 'none', borderRadius: 8, color: '#1e293b', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Chrome size={18} /> Google
        </button>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: THEME.success }}>
                <Shield size={12} /> Secure Connection
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: THEME.textMuted }}>
                <Lock size={12} /> End-to-End Encrypted
            </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: ADMIN USER MANAGEMENT (Cleaned) ---
const UserManagementTab = ({ users, onCreateUser }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        accessLevel: 'read',
        allowedScreens: {
            overview: true,
            performance: false,
            resources: false,
            reliability: false,
            indexes: false,
            api: false
        }
    });

    const handleScreenChange = (screen) => {
        setFormData(prev => ({
            ...prev,
            allowedScreens: { ...prev.allowedScreens, [screen]: !prev.allowedScreens[screen] }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const screenArray = Object.keys(formData.allowedScreens).filter(key => formData.allowedScreens[key]);
        onCreateUser({
            name: formData.name,
            email: formData.email,
            role: 'User',
            accessLevel: formData.accessLevel,
            allowedScreens: screenArray
        });
        setFormData({
            name: '', email: '', accessLevel: 'read',
            allowedScreens: { overview: true, performance: false, resources: false, reliability: false, indexes: false, api: false }
        });
        alert("User Created!");
    };

    const GlassCard = ({ children, title, rightNode }) => (
        <div style={{ background: THEME.glass, border: `1px solid ${THEME.glassBorder}`, borderRadius: 16, padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 14, color: THEME.textMain, textTransform: 'uppercase' }}>{title}</h3>
                {rightNode}
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>{children}</div>
        </div>
    );

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24, height: 'calc(100vh - 140px)' }}>
            {/* Create User Form */}
            <GlassCard title="Create New User" rightNode={<UserPlus size={16} color={THEME.success} />}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, color: THEME.textMuted, marginBottom: 6 }}>Full Name</label>
                        <input required type="text" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: 10, background: 'rgba(255,255,255,0.05)', border: `1px solid ${THEME.grid}`, borderRadius: 6, color: 'white' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, color: THEME.textMuted, marginBottom: 6 }}>Login ID</label>
                        <input required type="text" placeholder="johndoe" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: 10, background: 'rgba(255,255,255,0.05)', border: `1px solid ${THEME.grid}`, borderRadius: 6, color: 'white' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, color: THEME.textMuted, marginBottom: 6 }}>Access Level</label>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button type="button" onClick={() => setFormData({...formData, accessLevel: 'read'})} style={{ flex: 1, padding: 10, borderRadius: 6, border: `1px solid ${formData.accessLevel === 'read' ? THEME.primary : THEME.grid}`, background: formData.accessLevel === 'read' ? 'rgba(14, 165, 233, 0.2)' : 'transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Eye size={14} /> Read Only</button>
                            <button type="button" onClick={() => setFormData({...formData, accessLevel: 'write'})} style={{ flex: 1, padding: 10, borderRadius: 6, border: `1px solid ${formData.accessLevel === 'write' ? THEME.success : THEME.grid}`, background: formData.accessLevel === 'write' ? 'rgba(16, 185, 129, 0.2)' : 'transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Edit3 size={14} /> Read & Write</button>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, color: THEME.textMuted, marginBottom: 10 }}>Allowed Screens</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {Object.keys(formData.allowedScreens).map(key => (
                                <div key={key} onClick={() => handleScreenChange(key)} style={{ padding: '8px 12px', borderRadius: 6, cursor: 'pointer', border: `1px solid ${formData.allowedScreens[key] ? THEME.secondary : THEME.grid}`, background: formData.allowedScreens[key] ? 'rgba(139, 92, 246, 0.2)' : 'transparent', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'white', textTransform: 'capitalize' }}>
                                    <div style={{ width: 14, height: 14, borderRadius: 3, border: `1px solid ${THEME.textMuted}`, background: formData.allowedScreens[key] ? THEME.secondary : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {formData.allowedScreens[key] && <CheckCircle size={10} color="white" />}
                                    </div>
                                    {key}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button type="submit" style={{ marginTop: 10, padding: 12, background: THEME.primary, border: 'none', borderRadius: 8, color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Create User</button>
                </form>
            </GlassCard>

            {/* Active Users List - CLEANED (No Deletion) */}
            <GlassCard title="Active Users" rightNode={<Settings size={16} color={THEME.textMuted} />}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 4 }}>
                    {users.map((u) => (
                        <div key={u.id} style={{ padding: 16, background: 'rgba(255,255,255,0.03)', border: `1px solid ${THEME.grid}`, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: 14, color: 'white' }}>{u.name}</div>
                                <div style={{ fontSize: 12, color: THEME.textMuted }}>{u.email}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: u.accessLevel === 'write' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(14, 165, 233, 0.2)', color: u.accessLevel === 'write' ? THEME.success : THEME.primary }}>
                                    {u.accessLevel === 'write' ? 'Write Access' : 'Read Only'}
                                </span>
                                <div style={{ fontSize: 10, color: THEME.textMuted, marginTop: 4 }}>{u.allowedScreens?.length || 0} Screens</div>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
};

// --- COMPONENT: MAIN DASHBOARD ---
const PostgreSQLMonitor = ({ currentUser, onLogout, allUsers, onCreateUser }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Calculate available tabs based on permissions
  const availableTabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'resources', label: 'Resources', icon: HardDrive },
    { id: 'reliability', label: 'Reliability', icon: CheckCircle },
    { id: 'indexes', label: 'Indexes', icon: Layers },
    { id: 'api', label: 'API Tracing', icon: Network },
    { id: 'admin', label: 'System Admin', icon: Shield }
  ].filter(tab => currentUser?.allowedScreens?.includes(tab.id));

  const [activeTab, setActiveTab] = useState(availableTabs[0]?.id || 'overview');

  useEffect(() => {
    if (!availableTabs.find(t => t.id === activeTab)) {
        setActiveTab(availableTabs[0]?.id || 'overview');
    }
  }, [currentUser]);

  const SimpleCard = ({ title, children }) => (
      <div style={{ background: THEME.glass, border: `1px solid ${THEME.glassBorder}`, borderRadius: 16, padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: 14, color: THEME.textMain, textTransform: 'uppercase' }}>{title}</h3>
          <div style={{ flex: 1 }}>{children}</div>
      </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: THEME.bg, color: THEME.textMain }}>
        {/* SIDEBAR */}
        <aside style={{ width: isSidebarOpen ? 260 : 70, background: 'rgba(2, 6, 23, 0.95)', borderRight: `1px solid ${THEME.grid}`, display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease' }}>
            <div style={{ padding: '24px 12px', borderBottom: `1px solid ${THEME.grid}`, display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center' }}>
                {isSidebarOpen && <span style={{ fontWeight: 700, fontSize: 14 }}>PG Monitor</span>}
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'transparent', border: 'none', color: THEME.textMuted, cursor: 'pointer' }}><ChevronLeft size={18} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '16px 8px' }}>
                {availableTabs.map(item => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: isSidebarOpen ? '12px 16px' : '12px', justifyContent: isSidebarOpen ? 'flex-start' : 'center', background: activeTab === item.id ? `linear-gradient(90deg, ${THEME.primary}20, transparent)` : 'transparent', border: 'none', borderLeft: activeTab === item.id ? `3px solid ${THEME.primary}` : '3px solid transparent', color: activeTab === item.id ? THEME.primary : THEME.textMuted, cursor: 'pointer', borderRadius: '0 8px 8px 0' }}>
                    <item.icon size={20} />
                    {isSidebarOpen && <span>{item.label}</span>}
                </button>
                ))}
            </div>
            
            <div style={{ marginTop: 'auto', borderTop: `1px solid ${THEME.grid}` }}>
                <button onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '24px', background: 'transparent', border: 'none', color: THEME.textMuted, cursor: 'pointer', justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}>
                    <LogOut size={18} /> {isSidebarOpen && <span>Logout</span>}
                </button>
                {isSidebarOpen && <div style={{ padding: '0 24px 24px', fontSize: 10, color: THEME.textMuted }}>User: {currentUser.name}<br/>Level: {currentUser.accessLevel}</div>}
            </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <header style={{ height: 70, borderBottom: `1px solid ${THEME.grid}`, display: 'flex', alignItems: 'center', padding: '0 32px' }}>
                <h1 style={{ fontSize: 20, fontWeight: 600 }}>{availableTabs.find(t => t.id === activeTab)?.label || 'Dashboard'}</h1>
            </header>
            <div style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
                <ChartDefs />
                {activeTab === 'overview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 24 }}>
                        <SimpleCard title="Cluster Activity"><ResponsiveContainer width="100%" height={300}><AreaChart data={Array.from({length:10},(_,i)=>({v:Math.random()*100}))}><Area type="monotone" dataKey="v" stroke={THEME.primary} fill="url(#primaryGradient)"/></AreaChart></ResponsiveContainer></SimpleCard>
                        <SimpleCard title="Status"><div style={{fontSize:24, fontWeight:'bold', color:THEME.success}}>Healthy</div></SimpleCard>
                    </div>
                )}
                {activeTab === 'performance' && <SimpleCard title="Performance"><div style={{color:THEME.textMuted}}>Performance Metrics loaded...</div></SimpleCard>}
                {activeTab === 'resources' && <SimpleCard title="Resources"><div style={{color:THEME.textMuted}}>CPU & Memory Usage...</div></SimpleCard>}
                {activeTab === 'reliability' && <SimpleCard title="Reliability"><div style={{color:THEME.textMuted}}>Connection Health...</div></SimpleCard>}
                {activeTab === 'indexes' && <SimpleCard title="Indexes"><div style={{color:THEME.textMuted}}>Index Optimization...</div></SimpleCard>}
                {activeTab === 'api' && <SimpleCard title="API Tracing"><div style={{color:THEME.textMuted}}>API Endpoint Stats...</div></SimpleCard>}
                
                {/* ADMIN TAB */}
                {activeTab === 'admin' && <UserManagementTab users={allUsers} onCreateUser={onCreateUser} />}
            </div>
        </main>
    </div>
  );
};

// --- APP ROOT ---
const App = () => {
    const { currentUser, loading, error, login, googleLogin, logout, allUsers, createUser } = useMockAuth();

    if (loading && !currentUser) {
        return <div style={{ height: '100vh', background: THEME.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Loading System...</div>;
    }

    if (!currentUser) {
        return <LoginPage onLogin={login} onGoogleLogin={googleLogin} loading={loading} error={error} />;
    }

    return <PostgreSQLMonitor currentUser={currentUser} onLogout={logout} allUsers={allUsers} onCreateUser={createUser} />;
};

export default App;