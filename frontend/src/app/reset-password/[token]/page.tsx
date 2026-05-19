"use client";

import { useState } from 'react';
import api from '@/api/axios';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPassword({ params }: { params: { token: string } }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      await api.put(`/auth/resetpassword/${params.token}`, { password });
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid or expired token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex font-display items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2rem] p-10 border border-slate-200 premium-shadow text-center">
        {success ? (
           <div className="animate-in zoom-in-95 duration-500">
             <div className="w-20 h-20 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20">
                <CheckCircle2 size={40} />
             </div>
             <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Success!</h1>
             <p className="text-slate-500 font-medium mb-8">Your password has been successfully reset. Redirecting to login...</p>
           </div>
        ) : (
           <div className="animate-in fade-in duration-500">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                 <ShieldCheck className="text-brand-primary" size={32} />
              </div>

              <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Secure Reset</h1>
              <p className="text-slate-500 font-medium mb-8">
                Please enter and confirm your new password below.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6 text-left">
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        type="password"
                        required
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all text-slate-900 font-medium"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={6}
                      />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        type="password"
                        required
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all text-slate-900 font-medium"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        minLength={6}
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
                         Update Password
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
