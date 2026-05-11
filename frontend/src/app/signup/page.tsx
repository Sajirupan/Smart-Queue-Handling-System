"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Phone, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, user, loading: authLoading } = useAuth() as any;
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'staff') router.push('/staff');
      else router.push('/status');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await register(name, email, password, phone);
      toast.success('Registration successful!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex font-display overflow-hidden">
      {/* Left Side: Art/Info (Dark) */}
      <div className="hidden lg:flex w-2/5 bg-slate-950 relative overflow-hidden items-center justify-center p-16">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
         <div className="relative z-10 max-w-sm space-y-12">
            <Link href="/" className="inline-flex items-center gap-2 group">
               <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                  <ShieldCheck className="text-white" size={24} />
               </div>
               <span className="text-xl font-black text-white tracking-tighter">SmartQueue</span>
            </Link>

            <div className="space-y-6">
               <h1 className="text-5xl font-black text-white leading-tight">Scale your service flow.</h1>
               <p className="text-slate-400 font-medium leading-relaxed">
                  Join our enterprise network of service providers and experience the future of queue orchestration.
               </p>
            </div>

            <div className="space-y-4">
               <div className="flex items-center gap-4 text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                     <CheckCircle2 size={14} />
                  </div>
                  <span className="text-sm font-bold">Real-time Analytics</span>
               </div>
               <div className="flex items-center gap-4 text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                     <CheckCircle2 size={14} />
                  </div>
                  <span className="text-sm font-bold">Role-based Access</span>
               </div>
               <div className="flex items-center gap-4 text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                     <CheckCircle2 size={14} />
                  </div>
                  <span className="text-sm font-bold">Daily QR Rotation</span>
               </div>
            </div>
         </div>
         <div className="absolute top-[-20%] left-[-20%] w-96 h-96 bg-brand-secondary/10 blur-[100px] rounded-full" />
      </div>

      {/* Right Side: Form (Light) */}
      <div className="w-full lg:w-3/5 flex flex-col items-center justify-center p-8 lg:p-20 overflow-y-auto">
         <div className="w-full max-w-lg space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col items-center text-center">
               <Link href="/login" className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-brand-primary uppercase tracking-widest transition-all mb-8">
                  <ArrowLeft size={14} /> Back to Sign In
               </Link>
               <div className="inline-flex items-center gap-2 bg-brand-primary/10 px-3 py-1 rounded-full mb-6">
                  <Sparkles size={12} className="text-brand-primary" />
                  <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Global Network</span>
               </div>
               <h2 className="text-4xl font-black text-slate-900 tracking-tight">Create your account</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                     <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                           type="text"
                           required
                           value={name}
                           onChange={(e) => setName(e.target.value)}
                           className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.25rem] focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-sm font-medium"
                           placeholder="John Doe"
                        />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                     <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                           type="tel"
                           required
                           value={phone}
                           onChange={(e) => setPhone(e.target.value)}
                           className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.25rem] focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-sm font-medium"
                           placeholder="+94 77 123 4567"
                        />
                     </div>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                     <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.25rem] focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-sm font-medium"
                        placeholder="john@example.com"
                     />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                     <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                           type="password"
                           required
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.25rem] focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-sm font-medium"
                           placeholder="••••••••"
                        />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm</label>
                     <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input
                           type="password"
                           required
                           value={confirmPassword}
                           onChange={(e) => setConfirmPassword(e.target.value)}
                           className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.25rem] focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all text-sm font-medium"
                           placeholder="••••••••"
                        />
                     </div>
                  </div>
               </div>

               <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-3 py-5 bg-slate-900 text-white rounded-[1.5rem] text-sm font-black hover:bg-brand-primary hover:shadow-2xl hover:shadow-brand-primary/30 transition-all active:scale-[0.98] disabled:opacity-50"
               >
                  {loading ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                     <>
                        Create My Account
                        <ArrowRight size={20} />
                     </>
                  )}
               </button>
            </form>

            <p className="text-center text-slate-500 font-medium pt-6">
               By joining, you agree to our <Link href="#" className="text-slate-900 font-bold hover:underline">Terms</Link> and <Link href="#" className="text-slate-900 font-bold hover:underline">Privacy</Link>.
            </p>
         </div>
      </div>
    </div>
  );
}
