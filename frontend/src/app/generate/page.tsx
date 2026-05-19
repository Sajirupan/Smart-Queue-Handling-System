"use client";

import { useState } from 'react';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { useRouter } from 'next/navigation';
import { Ticket, Users, Clock, CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, Heart, Zap, Sparkles, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function GenerateToken() {
  const [serviceType, setServiceType] = useState('General');
  const [priority, setPriority] = useState('Normal');
  const [loading, setLoading] = useState(false);
  const [tokenResult, setTokenResult] = useState<any>(null);
  
  const { user } = useAuth() as any;
  const router = useRouter();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/queue/generate', { 
        serviceType, 
        priority,
        customerName: user?.name || 'Guest'
      });
      
      setTokenResult(res.data.data || res.data);
      toast.success('Token generated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate token');
    } finally {
      setLoading(false);
    }
  };

  if (tokenResult) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6 font-display">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl shadow-brand-primary/10 p-12 border border-slate-100 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-500 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/30">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Success!</h1>
          <p className="text-slate-500 font-medium mb-10">Your position has been secured.</p>
          
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white mb-10 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-1000">
               <Ticket size={120} />
             </div>
             <div className="relative z-10">
               <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-4 block">Official Token</span>
               <div className="text-7xl font-black tracking-tightest mb-8 text-gradient">{tokenResult.tokenNumber}</div>
               <div className="flex items-center justify-between pt-8 border-t border-white/5">
                  <div className="text-left">
                    <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Service</div>
                    <div className="font-bold text-sm">{tokenResult.serviceType}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Priority</div>
                    <div className="font-bold text-sm">{tokenResult.priority}</div>
                  </div>
               </div>
             </div>
          </div>

          <div className="space-y-4">
            <Link href="/status" className="flex items-center justify-center gap-3 w-full py-5 bg-brand-primary text-white rounded-2xl font-black text-lg hover:shadow-xl hover:shadow-brand-primary/20 transition-all active:scale-95">
              Live Board <ArrowRight size={20} />
            </Link>
            <button onClick={() => setTokenResult(null)} className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
              New Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col font-display">


      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="inline-flex items-center gap-2 bg-brand-primary/10 px-4 py-1.5 rounded-full mb-8">
                 <Sparkles size={14} className="text-brand-primary" />
                 <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Customer Portal</span>
              </div>
              <h1 className="text-6xl font-black text-slate-900 leading-[0.95] tracking-tightest mb-8">
                Skip the line. <br />
                <span className="text-gradient">Join the flow.</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md">
                Select your service type below to receive an instant digital token. We'll handle the rest.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 premium-shadow">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Users size={24} />
                </div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">Zero Friction</div>
                <p className="text-xs font-bold text-slate-400 uppercase mt-2">Instant check-in</p>
              </div>
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 premium-shadow">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                  <Clock size={24} />
                </div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">Real-time</div>
                <p className="text-xs font-bold text-slate-400 uppercase mt-2">Live synchronization</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-brand-primary/5 border border-slate-100 animate-in fade-in zoom-in-95 duration-700">
            <form onSubmit={handleGenerate} className="space-y-10">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                  Select Service Category
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {['General', 'Billing', 'Support', 'Account'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setServiceType(type)}
                        className={`relative py-5 rounded-[1.5rem] text-sm font-black transition-all border-2 overflow-hidden group ${
                        serviceType === type 
                        ? 'border-slate-900 bg-slate-50 text-slate-900 shadow-sm' 
                        : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                         {serviceType === type && <Star size={14} className="fill-brand-primary" />}
                         {type}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                  Priority Status
                </label>
                <div className="flex gap-4">
                  {[
                    { label: 'Normal', icon: <Heart size={18}/>, color: 'brand-primary' },
                    { label: 'VIP', icon: <Zap size={18}/>, color: 'amber-500' },
                    { label: 'Emergency', icon: <Zap size={18}/>, color: 'red-500' }
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setPriority(p.label)}
                        className={`flex-1 py-6 rounded-[1.5rem] text-[10px] font-black transition-all flex flex-col items-center gap-3 border-2 uppercase tracking-widest ${
                        priority === p.label 
                        ? `border-slate-900 bg-slate-900 text-white shadow-xl` 
                        : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div style={{ color: priority === p.label ? 'white' : 'inherit' }}>{p.icon}</div>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-7 bg-slate-950 text-white rounded-[2rem] font-black text-xl hover:shadow-2xl hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                   <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                   <>
                     <Ticket size={24} className="text-indigo-400" />
                     GENERATE MY TOKEN
                   </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
