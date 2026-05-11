"use client";

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { 
  QrCode, 
  Clock, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Sparkles, 
  Smartphone, 
  ShieldCheck,
  User,
  Phone,
  ArrowLeft
} from 'lucide-react';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

function ScanContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  
  const [counter, setCounter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [queueInfo, setQueueInfo] = useState<any>(null);
  const [step, setStep] = useState(1); // 1: Info, 2: Registration
  
  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [priority, setPriority] = useState('Normal');

  const router = useRouter();
  const { user } = useAuth() as any;

  useEffect(() => {
    if (user && name === '') {
      setName(user.name);
    }
  }, [user]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (dateParam !== today) {
      setLoading(false);
      return;
    }

    const fetchCounterInfo = async () => {
      try {
        const res = await api.get(`/queue/counter/${id}`);
        const found = res.data.data;
        setCounter(found);
        
        // Fetch real queue stats for this counter/service
        const statsRes = await api.get('/queue/active');
        const activeQueue = statsRes.data.data;
        const waitingForThisService = activeQueue.filter((q: any) => q.serviceType === found.counterName).length;
        
        setQueueInfo({
          waitingCount: waitingForThisService,
          estWaitTime: waitingForThisService * 5 // 5 mins per person estimate
        });
      } catch (err) {
        toast.error('Could not fetch counter information');
      } finally {
        setLoading(false);
      }
    };

    fetchCounterInfo();
  }, [id, dateParam]);

  const handleJoinQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setJoining(true);
    try {
      await api.post('/queue/generate', { 
        serviceType: counter.counterName,
        priority: priority,
        customerName: name,
        userId: user?.id,
        phone: phone // Added to payload
      });
      toast.success('Successfully joined the queue!');
      router.push('/status');
    } catch (err) {
      toast.error('Failed to join queue');
    } finally {
      setJoining(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
       <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-6" />
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Establishing Secure Connection...</p>
    </div>
  );

  const today = new Date().toISOString().split('T')[0];
  if (dateParam !== today) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-display">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl shadow-red-500/5 border border-red-100">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
           <AlertCircle size={40} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Access Expired</h1>
        <p className="text-slate-500 font-medium mb-10 leading-relaxed">QR codes are rotated daily to ensure queue integrity. Please scan the latest code from the service terminal.</p>
        <button onClick={() => router.push('/')} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all">Return Home</button>
      </div>
    </div>
  );

  if (!counter) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-display">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl shadow-slate-200 border border-slate-100 text-center">
        <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
           <XCircle size={40} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Counter Offline</h1>
        <p className="text-slate-500 font-medium mb-10 leading-relaxed">This service counter is currently unavailable or has been de-registered from our system.</p>
        <button onClick={() => router.push('/')} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest">System Overview</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center font-display relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-brand-primary/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-brand-secondary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full bg-white rounded-[3.5rem] shadow-2xl shadow-brand-primary/10 overflow-hidden border border-slate-100 relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-slate-950 p-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
            <QrCode size={150} />
          </div>
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full mb-4 relative z-10">
             <Smartphone size={14} className="text-brand-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Digital Check-in</span>
          </div>
          <h1 className="text-3xl font-black tracking-tightest mb-1 relative z-10">{counter.counterName}</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest relative z-10">
            {step === 1 ? 'Service Availability' : 'Customer Registration'}
          </p>
        </div>

        <div className="p-10">
          {step === 1 ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-brand-primary mb-4">
                    <Users size={24} />
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Queue Size</div>
                  <div className="text-2xl font-black text-slate-900">{queueInfo.waitingCount}</div>
                </div>
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-brand-primary mb-4">
                    <Clock size={24} />
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Wait Time</div>
                  <div className="text-2xl font-black text-slate-900">~{queueInfo.estWaitTime}m</div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-5 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                   <div className="mt-1">
                      <ShieldCheck size={18} className="text-brand-primary" />
                   </div>
                   <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                      Real-time synchronization enabled. Your token will be valid for the next <span className="font-bold text-slate-900">4 hours</span> upon generation.
                   </p>
                </div>
                
                <button
                  onClick={() => setStep(2)}
                  className="group w-full py-6 bg-brand-primary text-white rounded-[2rem] font-black text-lg hover:shadow-2xl hover:shadow-brand-primary/30 transition-all flex items-center justify-center gap-4 active:scale-95"
                >
                  PROCEED TO REGISTER
                  <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleJoinQueue} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number (Optional)</label>
                    <div className="relative">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+94 7X XXX XXXX"
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Queue Priority</label>
                    <div className="flex gap-3">
                       {['Normal', 'VIP'].map((p) => (
                         <button
                           key={p}
                           type="button"
                           onClick={() => setPriority(p)}
                           className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                             priority === p 
                               ? 'bg-brand-primary/10 border-brand-primary text-brand-primary shadow-sm' 
                               : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                           }`}
                         >
                           {p}
                         </button>
                       ))}
                    </div>
                  </div>
               </div>

               <div className="pt-4 space-y-4">
                  <button
                    type="submit"
                    disabled={joining}
                    className="group w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:shadow-2xl hover:shadow-slate-900/30 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
                  >
                    {joining ? (
                       <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                       <>
                         JOIN QUEUE NOW
                         <Sparkles size={22} className="text-brand-primary" />
                       </>
                    )}
                  </button>

                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                  >
                    <ArrowLeft size={14} /> Back to Details
                  </button>
               </div>
            </form>
          )}

          <div className="mt-10 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
              SmartQueue Intelligence • v2.0
            </p>
          </div>
        </div>
      </div>
      
      <button onClick={() => router.push('/')} className="mt-12 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-primary transition-all">
        Abort and Return Home
      </button>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ScanContent />
    </Suspense>
  );
}

