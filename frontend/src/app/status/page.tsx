"use client";

import { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { getActiveQueue } from '@/api/queueApi';
import { 
  Monitor, 
  Users, 
  Clock, 
  ArrowLeft, 
  RefreshCw, 
  Star, 
  Info, 
  Layers, 
  ChevronRight,
  TrendingUp,
  Volume2
} from 'lucide-react';
import Link from 'next/link';

export default function StatusPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastCalled, setLastCalled] = useState<string | null>(null);
  const socket = useSocket();

  const fetchQueue = async () => {
    try {
      const res = await getActiveQueue();
      // Assume res is the array if backend returns it directly, or res.data
      const data = res.data || res;
      setQueue(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();

    if (socket) {
      socket.on('new_token', (newToken: any) => {
        setQueue((prev) => [...prev, newToken]);
      });

      socket.on('queue_updated', () => {
        fetchQueue();
      });

      socket.on('token_called', (data: any) => {
        setLastCalled(`${data.tokenNumber} to ${data.counterName}`);
        fetchQueue();
        // Play sound if possible
        try {
           const audio = new Audio('/notification.mp3');
           audio.play().catch(() => {});
        } catch(e) {}
      });
    }

    return () => {
      if (socket) {
        socket.off('new_token');
        socket.off('queue_updated');
        socket.off('token_called');
      }
    };
  }, [socket]);

  const serving = queue.filter(q => q.status === 'Serving');
  const waiting = queue.filter(q => q.status === 'Waiting');

  return (
    <div className="min-h-screen bg-slate-950 text-white font-display overflow-hidden flex flex-col">
      {/* Top Navigation / Header */}
      <header className="h-20 glass-dark border-b border-white/5 px-8 flex items-center justify-between z-10">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
               <Monitor size={18} />
            </div>
            <span className="text-xl font-black tracking-tighter">LIVE BOARD</span>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2 text-emerald-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">System Operational</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Time</span>
              <div className="text-lg font-bold tabular-nums">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
           </div>
           <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <Volume2 size={18} className="text-slate-400" />
           </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-8 grid grid-cols-12 gap-8 overflow-hidden">
        
        {/* Left Side: Serving (Primary Focus) */}
        <div className="col-span-8 flex flex-col gap-8 h-full">
           <div className="flex-1 bg-linear-to-br from-brand-primary/20 to-brand-secondary/5 rounded-[3rem] border border-white/5 p-12 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5">
                 <TrendingUp size={400} />
              </div>

              <div className="flex items-center gap-3 mb-8">
                 <div className="px-4 py-1.5 bg-brand-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Now Serving</div>
                 {lastCalled && (
                   <div className="flex items-center gap-2 text-brand-secondary animate-in fade-in slide-in-from-left-4">
                      <ChevronRight size={14} />
                      <span className="text-xs font-bold uppercase tracking-widest">Last Called: {lastCalled}</span>
                   </div>
                 )}
              </div>

              <div className="grid grid-cols-2 gap-12">
                 {serving.length > 0 ? serving.map((item, idx) => (
                   <div key={item._id} className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-10 shadow-2xl animate-in zoom-in-95 duration-500">
                      <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Counter 0{item.counter || idx + 1}</div>
                      <div className="text-8xl font-black tracking-tighter text-gradient mb-6">{item.tokenNumber}</div>
                      <div className="flex items-center justify-between pt-6 border-t border-white/5">
                         <div className="text-sm font-bold text-slate-300">{item.serviceType}</div>
                         <div className="flex items-center gap-2 text-emerald-400">
                            <RefreshCw size={14} className="animate-spin" />
                            <span className="text-[10px] font-black uppercase">In Progress</span>
                         </div>
                      </div>
                   </div>
                 )) : (
                   <div className="col-span-2 py-32 flex flex-col items-center justify-center text-center opacity-30">
                      <Monitor size={80} className="mb-6" />
                      <h3 className="text-3xl font-black tracking-tight">NO ACTIVE SESSIONS</h3>
                      <p className="text-slate-400 font-medium">Counters will appear here when active</p>
                   </div>
                 )}
              </div>
           </div>

           {/* Stats Footer */}
           <div className="grid grid-cols-3 gap-6">
              <StatItem icon={<Users size={20} />} label="Total Waiting" value={waiting.length} color="text-brand-primary" />
              <StatItem icon={<Clock size={20} />} label="Average Time" value="12m" color="text-brand-secondary" />
              <StatItem icon={<TrendingUp size={20} />} label="Throughput" value="94%" color="text-emerald-400" />
           </div>
        </div>

        {/* Right Side: Up Next (Queue) */}
        <div className="col-span-4 glass-dark rounded-[3rem] border border-white/5 p-8 flex flex-col h-full">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black tracking-tight flex items-center gap-3">
                 <Layers size={20} className="text-brand-primary" />
                 UP NEXT
              </h2>
              <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {waiting.length} QUEUED
              </div>
           </div>

           <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {waiting.length > 0 ? waiting.map((item, idx) => (
                <div key={item._id} className={`group p-6 rounded-3xl border transition-all flex items-center justify-between animate-in slide-in-from-right-4 duration-500 delay-${idx * 100} ${
                  idx === 0 ? 'bg-brand-primary/10 border-brand-primary/30' : 'bg-white/5 border-white/5'
                }`}>
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                      idx === 0 ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-white/10 text-slate-400'
                    }`}>
                      {item.tokenNumber.split('-')[1] || item.tokenNumber}
                    </div>
                    <div>
                      <div className="font-black text-lg">{item.tokenNumber}</div>
                      <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.15em]">{item.serviceType}</div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    item.priority === 'Emergency' ? 'bg-red-500/20 text-red-400' :
                    item.priority === 'VIP' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-white/5 text-slate-500'
                  }`}>
                    {item.priority}
                  </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                  <Info size={48} className="mb-4" />
                  <p className="text-lg font-black uppercase tracking-widest">Queue is clear</p>
                </div>
              )}
           </div>

           <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] leading-loose">
                 Please wait for your token to be called<br />and proceed to the designated counter.
              </p>
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

function StatItem({ icon, label, value, color }: any) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6 flex items-center gap-5">
       <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${color}`}>
          {icon}
       </div>
       <div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</div>
          <div className="text-2xl font-black tabular-nums">{value}</div>
       </div>
    </div>
  );
}
