"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Mail, Lock, ArrowLeft, Ticket, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, loading: authLoading } = useAuth() as any;
  const router = useRouter();

  useEffect(() => {
    if (user && !authLoading) {
      if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'staff') router.push('/staff');
      else router.push('/status');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex font-display">
      {/* Left Side: Art/Info */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 relative overflow-hidden items-center justify-center p-20">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.2),transparent)] pointer-events-none" />
         <div className="relative z-10 max-w-lg">
            <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center mb-10 shadow-2xl shadow-brand-primary/20">
               <Ticket className="text-white" size={32} />
            </div>
            <h1 className="text-6xl font-black text-white leading-tight tracking-tightest mb-8">
               Intelligence behind every <span className="text-brand-primary">queue</span>.
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
               Join thousands of businesses streamlining their customer flow with SmartQueue's state-of-the-art terminal system.
            </p>
            
            <div className="mt-16 grid grid-cols-2 gap-8">
               <div>
                  <div className="text-3xl font-black text-white">99.9%</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Uptime SLA</div>
               </div>
               <div>
                  <div className="text-3xl font-black text-white">2.4M</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Tokens Issued</div>
               </div>
            </div>
         </div>
         
         {/* Decorative Element */}
         <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-primary/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-24 relative">
         <Link href="/" className="absolute top-12 left-12 flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-brand-primary uppercase tracking-widest transition-all">
            <ArrowLeft size={14} /> Back to Site
         </Link>

         <div className="w-full max-w-md space-y-12">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full">
                  <Sparkles size={12} className="text-brand-primary" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Portal Access</span>
               </div>
               <h2 className="text-4xl font-black text-slate-900 tracking-tight">Welcome back</h2>
               <p className="text-slate-500 font-medium">Enter your administrative or staff credentials.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      type="email"
                      required
                      className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[1.25rem] focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all text-slate-900 font-medium shadow-sm"
                      placeholder="e.g. alex@smartqueue.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end px-1">
                     <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
                     <Link href="/forgot-password" className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">Forgot?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      type="password"
                      required
                      className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[1.25rem] focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all text-slate-900 font-medium shadow-sm"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-3 py-5 px-4 bg-slate-900 text-white rounded-[1.5rem] text-sm font-black hover:bg-brand-primary hover:shadow-2xl hover:shadow-brand-primary/30 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                   <>
                     <LogIn size={20} />
                     Sign In to Portal
                   </>
                )}
              </button>
            </form>

            <div className="text-center pt-8 border-t border-slate-100">
               <p className="text-sm font-medium text-slate-500">
                 Need a staff account?{' '}
                 <Link href="/signup" className="text-brand-primary font-black hover:underline uppercase text-xs tracking-widest ml-1">
                   Register
                 </Link>
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
