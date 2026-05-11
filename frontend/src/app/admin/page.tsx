"use client";

import { useState, useEffect } from 'react';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import toast from 'react-hot-toast';
import { 
  LayoutDashboard, 
  Users, 
  Monitor, 
  LogOut, 
  ShieldAlert, 
  UserCheck, 
  Trash2, 
  Home, 
  CheckCircle, 
  Clock, 
  Activity, 
  Settings, 
  User as UserIcon, 
  Plus, 
  BarChart3, 
  Search,
  ChevronRight,
  MoreVertical,
  QrCode,
  Download,
  Ticket
} from 'lucide-react';
import ProfileModal from '@/components/ProfileModal';

const COLORS = ["var(--color-brand-primary)", "var(--color-brand-secondary)", "#8b5cf6", "#f43f5e", "#f59e0b"];

export default function AdminDashboard() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, loading, logout } = useAuth() as any;
  const router = useRouter();
  const socket = useSocket();
  
  const [stats, setStats] = useState<any>({ totalCustomers: 0, completedQueues: 0, averageWaitingTime: 0, activeQueues: 0, hourlyData: [], weeklyData: [], serviceData: [] });
  const [counters, setCounters] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [newCounterName, setNewCounterName] = useState('');
  const [adminTab, setAdminTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      const [statsRes, countersRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/counters'),
        api.get('/admin/users')
      ]);
      setStats(statsRes.data.data || statsRes.data);
      setCounters(countersRes.data.data || countersRes.data);
      setAllUsers(usersRes.data.data || usersRes.data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
      return;
    }
    if (user?.role === 'admin') {
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!socket) return;
    socket.on('queue_updated', fetchData);
    socket.on('counter_updated', fetchData);
    return () => {
      socket.off('queue_updated');
      socket.off('counter_updated');
    };
  }, [socket]);

  const handleUpdateUser = async (id: string, updates: any) => {
    try {
      await api.put(`/admin/users/${id}`, updates);
      toast.success('User updated successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const handleCreateCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCounterName) return;
    try {
      await api.post('/admin/counters', { counterName: newCounterName });
      toast.success('Counter created successfully');
      setNewCounterName('');
      fetchData();
    } catch (err) {
      toast.error('Failed to create counter');
    }
  };

   const handleUpdateCounter = async (id: string, updates: any) => {
    try {
      await api.put(`/admin/counters/${id}`, updates);
      toast.success('Counter updated');
      fetchData();
    } catch (err) {
      toast.error('Failed to update counter');
    }
  };

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
       <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-50 flex overflow-hidden font-display">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-950 text-white p-8 flex flex-col z-20">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <ShieldAlert className="text-white" size={24} />
          </div>
          <span className="text-xl font-black tracking-tightest">ADMIN<span className="text-brand-primary">PANEL</span></span>
        </div>

        <nav className="space-y-2 flex-1">
          <SidebarLink active={adminTab === 'dashboard'} onClick={() => setAdminTab('dashboard')} icon={<LayoutDashboard size={20} />} label="Overview" />
          <SidebarLink active={adminTab === 'counters'} onClick={() => setAdminTab('counters')} icon={<Monitor size={20} />} label="Counters" />
          <SidebarLink active={adminTab === 'staff'} onClick={() => setAdminTab('staff')} icon={<Users size={20} />} label="User Management" />
        </nav>

        <div className="pt-8 border-t border-white/5 space-y-2">
          <SidebarLink active={false} onClick={() => setIsProfileOpen(true)} icon={<UserIcon size={20} />} label="Settings" />
          <SidebarLink active={false} onClick={() => router.push('/')} icon={<Home size={20} />} label="View Live Site" />
          <button 
            onClick={logout} 
            className="w-full flex items-center gap-4 px-4 py-3.5 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-bold text-sm mt-4"
          >
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-24 bg-white/50 backdrop-blur-md border-b border-slate-200 px-10 flex items-center justify-between">
           <div>
              <h1 className="text-2xl font-black text-slate-900 capitalize">{adminTab}</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">SmartQueue Intelligence System</p>
           </div>

           <div className="flex items-center gap-6">
              <div className="relative hidden md:block">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   type="text" 
                   placeholder="Global search..." 
                   className="bg-slate-100 border-none rounded-2xl pl-12 pr-6 py-2.5 text-sm w-64 focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
              <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                 <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">{user.name}</div>
                    <div className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Administrator</div>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                    <UserIcon size={20} className="text-slate-400" />
                 </div>
              </div>
           </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50">
          {adminTab === 'dashboard' && (
            <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AdminStatCard label="Tokens Generated" value={stats.totalCustomers} icon={<Ticket size={24}/>} trend="+12.5%" color="brand-primary" />
                <AdminStatCard label="Served Today" value={stats.completedQueues} icon={<CheckCircle size={24}/>} trend="+4.2%" color="emerald-500" />
                <AdminStatCard label="Currently Waiting" value={stats.activeQueues} icon={<Clock size={24}/>} trend="-2.1%" color="amber-500" />
                <AdminStatCard label="Avg. Wait Time" value={`${stats.averageWaitingTime}m`} icon={<Activity size={24}/>} trend="-5.4%" color="violet-500" />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 p-8 premium-shadow">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-lg font-black text-slate-900">Traffic Analysis</h3>
                       <select className="text-xs font-bold bg-slate-50 border-none rounded-lg px-3 py-1.5 outline-none">
                          <option>Last 24 Hours</option>
                          <option>Last 7 Days</option>
                       </select>
                    </div>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.hourlyData.length > 0 ? stats.hourlyData : []}>
                          <XAxis dataKey="hour" axisLine={false} tickLine={false} fontSize={10} tick={{fill: '#94a3b8', fontWeight: 700}} />
                          <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{fill: '#94a3b8', fontWeight: 700}} />
                          <Tooltip 
                             cursor={{fill: 'rgba(0,0,0,0.02)'}} 
                             contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', padding: '15px'}} 
                          />
                          <Bar dataKey="count" fill="var(--color-brand-primary)" radius={[6, 6, 0, 0]} barSize={24} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                 </div>

                 <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 premium-shadow">
                    <h3 className="text-lg font-black text-slate-900 mb-8">Service Distribution</h3>
                    <div className="h-[250px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                             <Pie
                                data={stats.serviceData.length > 0 ? stats.serviceData.map((d: any) => ({ name: d.serviceType, value: parseInt(d.count) })) : [{name: 'Empty', value: 1}]}
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={8}
                                dataKey="value"
                             >
                                {stats.serviceData.map((_: any, i: number) => (
                                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} strokeWidth={0} />
                                ))}
                             </Pie>
                             <Tooltip />
                          </PieChart>
                       </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 mt-4">
                       {stats.serviceData.slice(0, 3).map((d: any, i: number) => (
                          <div key={i} className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                <span className="text-xs font-bold text-slate-500 uppercase">{d.serviceType}</span>
                             </div>
                             <span className="text-sm font-black text-slate-900">{d.count}</span>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
            </div>
          )}

          {adminTab === 'counters' && (
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 premium-shadow">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                       <h2 className="text-2xl font-black text-slate-900">Manage Counters</h2>
                       <p className="text-slate-500 text-sm font-medium">Create and monitor service terminals</p>
                    </div>
                    <form onSubmit={handleCreateCounter} className="w-full md:w-auto flex gap-3">
                      <input 
                        type="text" 
                        value={newCounterName}
                        onChange={(e) => setNewCounterName(e.target.value)}
                        placeholder="Counter Name..." 
                        className="flex-1 md:w-64 px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm font-medium"
                        required
                      />
                      <button type="submit" className="bg-brand-primary text-white px-6 py-3 rounded-2xl text-sm font-black hover:shadow-lg hover:shadow-brand-primary/30 transition-all flex items-center gap-2">
                        <Plus size={18} /> ADD
                      </button>
                    </form>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {counters.map((counter: any) => (
                      <div key={counter._id} className="group bg-slate-50 border border-slate-100 rounded-3xl p-8 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                        <div className="flex justify-between items-center mb-6">
                           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-brand-primary group-hover:scale-110 transition-transform">
                              <Monitor size={24} />
                           </div>
                            <button 
                              onClick={() => handleUpdateCounter(counter._id, { status: counter.status === 'Active' ? 'Inactive' : 'Active' })}
                              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                                counter.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                              }`}
                            >
                              {counter.status}
                            </button>
                        </div>
                        
                        <h4 className="text-xl font-black text-slate-900 mb-2">{counter.counterName}</h4>
                        <div className="space-y-4">
                           <div className="flex justify-between text-xs font-bold">
                              <span className="text-slate-400 uppercase tracking-wider">Current Token</span>
                              <span className="text-brand-primary">{counter.currentToken || 'Waiting...'}</span>
                           </div>
                           <div className="flex justify-between items-center text-xs font-bold">
                              <span className="text-slate-400 uppercase tracking-wider">Staff</span>
                              <select 
                                value={counter.staff?._id || ''}
                                onChange={(e) => handleUpdateCounter(counter._id, { staff: e.target.value || null })}
                                className="bg-transparent text-slate-900 border-none focus:ring-0 cursor-pointer outline-none text-right"
                              >
                                <option value="">Unassigned</option>
                                {allUsers.filter(u => u.role === 'staff').map(s => (
                                  <option key={s._id} value={s._id}>{s.name}</option>
                                ))}
                              </select>
                           </div>

                           {counter.qrCode && (
                             <div className="mt-6 p-4 bg-white border border-slate-100 rounded-3xl flex flex-col items-center gap-3 relative overflow-hidden group/qr">
                                <img src={counter.qrCode} alt="QR" className="w-24 h-24 opacity-80 group-hover/qr:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 bg-brand-primary/95 flex flex-col items-center justify-center gap-2 opacity-0 group-hover/qr:opacity-100 transition-all duration-300">
                                   <button 
                                     onClick={() => {
                                       const a = document.createElement('a');
                                       a.href = counter.qrCode;
                                       a.download = `QR-${counter.counterName}.png`;
                                       a.click();
                                     }}
                                     className="w-10 h-10 bg-white text-brand-primary rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                   >
                                      <Download size={20} />
                                   </button>
                                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Download QR</span>
                                </div>
                             </div>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          )}

          {adminTab === 'staff' && (
            <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="bg-white rounded-[2.5rem] border border-slate-200 premium-shadow overflow-hidden">
                  <div className="p-10 border-b border-slate-100 flex flex-col md:row justify-between items-center gap-6">
                     <div>
                        <h2 className="text-2xl font-black text-slate-900">User Management</h2>
                        <p className="text-slate-500 text-sm font-medium">Manage system access and permissions</p>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total: {allUsers.length}</span>
                        <div className="h-6 w-px bg-slate-200" />
                        <button className="p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                           <MoreVertical size={20} className="text-slate-600" />
                        </button>
                     </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/50">
                          <th className="px-10 py-5 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">User Profile</th>
                          <th className="px-6 py-5 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Contact</th>
                          <th className="px-6 py-5 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Access Level</th>
                          <th className="px-6 py-5 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em]">Status</th>
                          <th className="px-10 py-5 font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {allUsers.map((u) => (
                          <tr key={u._id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-10 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 text-slate-600 flex items-center justify-center font-black text-lg shadow-sm">
                                  {u.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-black text-slate-900">{u.name}</div>
                                  <div className="text-xs font-medium text-slate-400">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-6">
                              <div className="text-sm font-bold text-slate-600">{u.phone || '—'}</div>
                            </td>
                            <td className="px-6 py-6">
                              <select 
                                value={u.role}
                                onChange={(e) => handleUpdateUser(u._id, { role: e.target.value })}
                                className={`text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 outline-none cursor-pointer border-none shadow-sm appearance-none pr-8 relative ${
                                  u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' :
                                  u.role === 'staff' ? 'bg-brand-primary/10 text-brand-primary' :
                                  'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                <option value="customer">Customer</option>
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="px-6 py-6">
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                u.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                              }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                {u.status}
                              </div>
                            </td>
                            <td className="px-10 py-6">
                              <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => handleUpdateUser(u._id, { status: u.status === 'active' ? 'suspended' : 'active' })}
                                  className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-600 rounded-xl hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                                  title={u.status === 'active' ? 'Suspend User' : 'Activate User'}
                                >
                                  {u.status === 'active' ? <ShieldAlert size={18} /> : <UserCheck size={18} />}
                                </button>
                                <button 
                                  onClick={() => handleDeleteUser(u._id)}
                                  className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                  title="Delete User"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${
        active 
          ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30' 
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function AdminStatCard({ label, value, icon, trend, color }: any) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 premium-shadow flex flex-col justify-between hover:translate-y-[-4px] transition-all">
       <div className="flex justify-between items-start mb-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-50 text-${color} shadow-sm`}>
             {icon}
          </div>
          <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
             {trend}
          </div>
       </div>
       <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-3xl font-black text-slate-900 tabular-nums tracking-tight">{value}</p>
       </div>
    </div>
  );
}
