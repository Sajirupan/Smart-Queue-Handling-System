"use client";

import { useState, useEffect } from 'react';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  Users, 
  Monitor, 
  LogOut, 
  Home, 
  CheckCircle, 
  Clock, 
  Activity, 
  User as UserIcon, 
  Play,
  SkipForward,
  RotateCcw,
  AlertCircle,
  Hash,
  ChevronRight,
  BellRing,
  LayoutGrid
} from 'lucide-react';
import ProfileModal from '@/components/ProfileModal';
import Link from 'next/link';

export default function StaffDashboard() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, loading, logout } = useAuth() as any;
  const router = useRouter();
  const socket = useSocket();

  const [counter, setCounter] = useState<any>(null);
  const [counters, setCounters] = useState<any[]>([]);
  const [waitingQueue, setWaitingQueue] = useState<any[]>([]);
  const [activeToken, setActiveToken] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingTime, setEditingTime] = useState(false);
  const [avgWaitTimeInput, setAvgWaitTimeInput] = useState('');

  const fetchQueue = async () => {
    try {
      const res = await api.get('/queue/active');
      const data = res.data.data || res.data;
      setWaitingQueue(Array.isArray(data) ? data.filter((q: any) => q.status === 'Waiting') : []);
      if (counter) {
        const serving = Array.isArray(data) ? data.find((q: any) => q.status === 'Serving' && q.counter === counter._id) : null;
        setActiveToken(serving);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCounters = async () => {
    try {
      const res = await api.get('/staff/counters');
      setCounters(res.data.data);
    } catch (err) {
      toast.error('Failed to load counters');
    }
  };

  useEffect(() => {
    if (!loading && (!user || user.role !== 'staff')) {
      router.push('/login');
      return;
    }
    
    const initialize = async () => {
      await fetchCounters();
      try {
        const res = await api.get('/staff/counter-info');
        if (res.data.data) {
          setCounter(res.data.data);
        }
      } catch (err) {
        // Not assigned yet, that's fine
      }
      fetchQueue();
    };

    if (user?.role === 'staff') {
      initialize();
    }
  }, [user, loading]);

  useEffect(() => {
    if (!socket) return;
    socket.on('queue_updated', fetchQueue);
    return () => {
      socket.off('queue_updated');
    };
  }, [socket, counter]);

  const handleSelectCounter = async (counterId: string) => {
    try {
      const res = await api.post('/staff/assign-counter', { counterId });
      setCounter(res.data.data);
      toast.success(`Assigned to ${res.data.data.counterName}`);
    } catch (err) {
      toast.error('Failed to assign counter');
    }
  };

  const handleCallNext = async () => {
    if (!counter) return;
    setIsProcessing(true);
    try {
      const res = await api.post('/staff/call-next', { counterId: counter._id });
      toast.success(`Calling Token ${res.data.data.tokenNumber}`);
      fetchQueue();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'No customers in queue');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = async () => {
    if (!activeToken || !counter) return;
    setIsProcessing(true);
    try {
      await api.post('/staff/complete', { counterId: counter._id });
      toast.success('Service completed');
      fetchQueue();
    } catch (err) {
      toast.error('Failed to complete service');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateTime = async () => {
    if (!counter || !avgWaitTimeInput) return;
    try {
      const res = await api.put('/staff/counter-time', { avgWaitTime: avgWaitTimeInput });
      setCounter(res.data.data);
      setEditingTime(false);
      toast.success('Wait time updated successfully');
    } catch (err) {
      toast.error('Failed to update wait time');
    }
  };

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
       <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!counter) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6 font-display">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
             <div className="w-16 h-16 bg-brand-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-primary/20">
                <Monitor className="text-white" size={32} />
             </div>
             <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Counter Selection</h1>
             <p className="text-slate-500 font-medium">Please assign yourself to a service terminal to begin.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {counters.map((c) => (
              <button
                key={c._id}
                onClick={() => handleSelectCounter(c._id)}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-brand-primary/10 hover:border-brand-primary/30 transition-all text-left group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 text-brand-primary group-hover:scale-150 transition-transform duration-500">
                   <LayoutGrid size={80} />
                </div>
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-primary group-hover:text-white transition-all">
                  <LayoutGrid size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-1">{c.counterName}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {c.staff ? `Occupied by ${c.staff.name}` : 'Ready for assignment'}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col font-display">
      <header className="h-20 glass border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 group cursor-pointer" onClick={() => router.push('/')}>
              <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
                 <Monitor size={18} className="text-white" />
              </div>
              <span className="text-xl font-black tracking-tightest">STAFF<span className="text-brand-primary">HUB</span></span>
           </div>
           <div className="h-4 w-px bg-slate-200" />
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Counter:</span>
              <div className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black uppercase flex items-center gap-2">
                 {counter.counterName}
              </div>
           </div>
           <div className="h-4 w-px bg-slate-200" />
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Clock size={12}/> Wait Time:</span>
              {editingTime ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    min="1" 
                    className="w-16 px-2 py-1 text-xs border rounded outline-none" 
                    value={avgWaitTimeInput} 
                    onChange={(e) => setAvgWaitTimeInput(e.target.value)} 
                    placeholder="Mins"
                  />
                  <button onClick={handleUpdateTime} className="text-[10px] bg-brand-primary text-white px-2 py-1 rounded font-bold hover:bg-brand-primary/80 transition-colors">Save</button>
                  <button onClick={() => setEditingTime(false)} className="text-[10px] bg-slate-200 text-slate-600 px-2 py-1 rounded font-bold hover:bg-slate-300 transition-colors">Cancel</button>
                </div>
              ) : (
                <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => { setEditingTime(true); setAvgWaitTimeInput(counter.avgWaitTime || 5); }} title="Click to edit average wait time per person">
                  {counter.avgWaitTime || 5} MIN / PERSON
                </div>
              )}
           </div>
        </div>

        <div className="flex items-center gap-4">
           <button onClick={() => setCounter(null)} className="px-4 py-2 text-[10px] font-black text-slate-500 hover:text-brand-primary uppercase tracking-widest transition-colors">
              Switch Terminal
           </button>
           <div className="h-4 w-px bg-slate-200" />
           <button onClick={() => setIsProfileOpen(true)} className="flex items-center gap-3 px-4 py-2 hover:bg-slate-100 rounded-xl transition-all">
              <div className="text-right hidden sm:block">
                 <div className="text-xs font-black text-slate-900">{user.name}</div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Online</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white shadow-sm">
                 <UserIcon size={18} className="text-slate-500" />
              </div>
           </button>
           <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
              <LogOut size={20} />
           </button>
        </div>
      </header>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 grid grid-cols-12 gap-8">
         <div className="col-span-12 lg:col-span-7 flex flex-col gap-8">
            <div className="bg-white rounded-[3rem] border border-slate-200 p-12 premium-shadow flex flex-col items-center justify-center text-center relative overflow-hidden flex-1 min-h-[550px]">
               <div className="absolute top-0 right-0 p-12 opacity-5 text-brand-primary">
                  <BellRing size={200} />
               </div>

               {activeToken ? (
                 <div className="animate-in zoom-in-95 duration-500 w-full">
                    <span className="bg-brand-primary/10 text-brand-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 inline-block">Service in Progress</span>
                    <h2 className="text-[10rem] font-black tracking-tightest leading-none text-slate-900 mb-4">{activeToken.tokenNumber}</h2>
                    <p className="text-xl font-bold text-slate-500 mb-12 uppercase tracking-widest">{activeToken.serviceType}</p>
                    
                    <div className="grid grid-cols-2 gap-4 w-full max-w-md mx-auto">
                       <button 
                         onClick={handleComplete}
                         disabled={isProcessing}
                         className="flex flex-col items-center gap-3 p-8 bg-emerald-500 text-white rounded-[2.5rem] hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                       >
                          <CheckCircle size={32} />
                          <span className="text-sm font-black uppercase">Finalize</span>
                       </button>
                       <button className="flex flex-col items-center gap-3 p-8 bg-slate-100 text-slate-600 rounded-[2.5rem] hover:bg-slate-200 transition-all active:scale-95">
                          <RotateCcw size={32} />
                          <span className="text-sm font-black uppercase">Recall</span>
                       </button>
                    </div>
                 </div>
               ) : (
                 <div className="animate-in fade-in duration-700">
                    <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-300 mb-8 mx-auto border border-slate-100">
                       <Activity size={48} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-4">Counter Ready</h3>
                    <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">Click below to notify and call the next customer from the waiting queue.</p>
                    
                    <button 
                      onClick={handleCallNext}
                      disabled={isProcessing || waitingQueue.length === 0}
                      className="group flex items-center gap-3 px-12 py-6 bg-brand-primary text-white rounded-[2.5rem] font-black text-xl hover:shadow-2xl hover:shadow-brand-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                    >
                       <Play size={24} className="fill-white" />
                       CALL NEXT
                       <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    {waitingQueue.length === 0 && (
                      <p className="mt-8 text-xs font-black text-amber-600 flex items-center justify-center gap-2 uppercase tracking-widest">
                         <AlertCircle size={14} />
                         Queue Empty
                      </p>
                    )}
                 </div>
               )}
            </div>

            <div className="grid grid-cols-3 gap-6">
               <QuickStat icon={<Users size={18} />} label="In Queue" value={waitingQueue.length} />
               <QuickStat icon={<Clock size={18} />} label="Avg. Wait" value="12m" />
               <QuickStat icon={<CheckCircle size={18} />} label="Served" value="0" />
            </div>
         </div>

         <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            <div className="bg-slate-950 text-white rounded-[3rem] p-8 flex flex-col flex-1 h-full relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.1),transparent)] pointer-events-none" />
               
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-lg font-black tracking-tight flex items-center gap-3">
                     <Hash size={20} className="text-brand-primary" />
                     LIVE QUEUE
                  </h3>
                  <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500">
                     {waitingQueue.length} WAITING
                  </div>
               </div>

               <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                  {waitingQueue.length > 0 ? waitingQueue.map((item, idx) => (
                    <div key={item._id} className="bg-white/5 border border-white/5 p-6 rounded-[2rem] flex items-center justify-between group hover:bg-white/10 transition-all animate-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                       <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black text-lg text-slate-400 group-hover:text-brand-primary transition-colors">
                             {item.tokenNumber.split('-')[1] || item.tokenNumber}
                          </div>
                          <div>
                             <div className="font-black text-lg">{item.tokenNumber}</div>
                             <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{item.serviceType}</div>
                          </div>
                       </div>
                       <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          item.priority === 'Emergency' ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-500'
                       }`}>
                          {item.priority}
                       </div>
                    </div>
                  )) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                       <Users size={48} className="mb-4" />
                       <p className="text-sm font-black uppercase tracking-widest text-slate-500">System Ready</p>
                    </div>
                  )}
               </div>

               <div className="mt-8 pt-8 border-t border-white/5">
                  <div className="bg-white/5 rounded-2xl p-5 flex items-center gap-4">
                     <div className="w-10 h-10 bg-brand-primary/20 rounded-xl flex items-center justify-center">
                        <SkipForward size={20} className="text-brand-primary" />
                     </div>
                     <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">
                        Queue updates automatically.<br />Please maintain service standards.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}

function QuickStat({ icon, label, value }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center gap-4 premium-shadow">
       <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
          {icon}
       </div>
       <div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
          <div className="text-xl font-black text-slate-900">{value}</div>
       </div>
    </div>
  );
}
