"use client";

import { useState } from 'react';
import api from '@/api/axios';
import Link from 'next/link';
import { Mail, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgotpassword', { email });
      setSent(true);
      toast.success('Password reset email sent (or simulated in console)');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex font-display items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2rem] p-10 border border-slate-200 premium-shadow text-center">
        <Link href="/login" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-brand-primary uppercase tracking-widest transition-all mb-8">
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
        
        <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
           <ShieldCheck className="text-brand-primary" size={32} />
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Forgot Password</h1>
        
        {sent ? (
          <div className="animate-in fade-in zoom-in-95 duration-500">
             <p className="text-slate-500 font-medium mb-8">
               If an account exists with that email, we have sent instructions to reset your password. Please check your inbox.
             </p>
             <Link href="/login" className="w-full inline-flex justify-center items-center gap-3 py-4 bg-slate-900 text-white rounded-[1.5rem] text-sm font-black hover:bg-brand-primary transition-all">
                Return to Login
             </Link>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
             <p className="text-slate-500 font-medium mb-8">
               Enter your registered email address and we'll send you a link to reset your password.
             </p>
             <form onSubmit={handleSubmit} className="space-y-6 text-left">
                <div className="space-y-2">
                   <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                   <div className="relative">
                     <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                     <input
                       type="email"
                       required
                       className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all text-slate-900 font-medium"
                       placeholder="e.g. your@email.com"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                     />
                   </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-3 py-5 bg-brand-primary text-white rounded-[1.5rem] text-sm font-black hover:bg-indigo-600 shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                     <>
                        Send Reset Link
                        <ArrowRight size={20} />
                     </>
                  )}
                </button>
             </form>
          </div>
        )}
      </div>
    </div>
  );
}
