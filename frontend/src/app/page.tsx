"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  Monitor, 
  Sparkles, 
  LayoutDashboard, 
  Ticket, 
  ChevronRight,
  MousePointer2,
  Zap,
  Globe
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth() as any;

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-brand-primary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-brand-secondary/5 blur-[100px] rounded-full animate-pulse delay-700" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-slate-200/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:rotate-6 transition-transform">
              <Ticket className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">
              Smart<span className="text-brand-primary">Queue</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6 text-sm font-bold text-slate-500">
              <Link href="/status" className="hover:text-brand-primary transition-colors">Live Board</Link>
              <Link href="/generate" className="hover:text-brand-primary transition-colors">Join Queue</Link>
            </div>
            
            <div className="h-4 w-px bg-slate-200" />

            {user ? (
              <Link href={user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/status'} 
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 text-sm font-bold">
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors px-4">Sign In</Link>
                <Link href="/signup" className="px-5 py-2.5 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20 text-sm font-bold">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-100 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Sparkles size={14} className="text-brand-primary" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Next Gen Queue Tech</span>
            <div className="w-1 h-1 bg-slate-200 rounded-full" />
            <span className="text-[10px] font-bold text-brand-primary uppercase">v2.0 is live</span>
          </div>
          
          <h1 className="text-6xl md:text-[5.5rem] font-black text-slate-900 leading-[0.95] tracking-tightest mb-8">
            Manage flow. <br />
            <span className="text-gradient">Master waiting.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-slate-500 font-medium leading-relaxed mb-12">
            The world's most elegant solution for physical queue handling. 
            Automated tokens, real-time analytics, and seamless staff integration.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/generate" className="group px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-brand-primary/30 transition-all flex items-center gap-3 active:scale-95">
              Join the Queue <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/status" className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-lg hover:border-brand-primary/30 transition-all shadow-sm flex items-center gap-3 active:scale-95">
              Live View Board
            </Link>
          </div>

          {/* Floating UI Elements Mockup */}
          <div className="mt-24 relative max-w-5xl mx-auto">
            <div className="aspect-[16/9] bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-slate-800 relative group">
              <div className="absolute inset-0 bg-linear-to-tr from-brand-primary/20 to-transparent opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-full h-full p-8 flex flex-col gap-4">
                    <div className="h-8 w-1/3 bg-slate-800 rounded-lg animate-pulse" />
                    <div className="grid grid-cols-3 gap-4 flex-1">
                       <div className="bg-slate-800/50 rounded-2xl border border-white/5" />
                       <div className="bg-slate-800/50 rounded-2xl border border-white/5" />
                       <div className="bg-slate-800/50 rounded-2xl border border-white/5" />
                    </div>
                 </div>
              </div>
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <MousePointer2 size={16} className="text-white" />
                <span className="text-white text-sm font-bold">Interactive Dashboard</span>
              </div>
            </div>
            
            {/* Floaties */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white rounded-3xl premium-shadow border border-slate-100 p-6 animate-float hidden lg:block">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-[10px] font-black uppercase text-slate-400">Live Status</span>
              </div>
              <div className="text-3xl font-black text-slate-900">A-042</div>
              <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase">Counter 01</div>
            </div>

            <div className="absolute -bottom-6 -left-6 w-56 h-32 bg-white rounded-3xl premium-shadow border border-slate-100 p-6 animate-float [animation-delay:2s] hidden lg:block">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-black uppercase text-slate-400">Average Wait</span>
              </div>
              <div className="text-2xl font-black text-slate-900">12.5 min</div>
              <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                <div className="w-[70%] h-full bg-brand-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <Feature 
            icon={<ShieldCheck className="text-brand-primary" size={32} />}
            title="Secure & Reliable"
            desc="Built on enterprise-grade infrastructure with real-time synchronization."
          />
          <Feature 
            icon={<Monitor className="text-brand-secondary" size={32} />}
            title="Multi-Counter Support"
            desc="Easily manage dozens of counters from a single administrative panel."
          />
          <Feature 
            icon={<Globe className="text-emerald-500" size={32} />}
            title="Cloud Integration"
            desc="Access your queue status from anywhere in the world, on any device."
          />
        </div>
      </section>

      {/* Portal Selection */}
      <section className="bg-slate-900 py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-white mb-4">Choose Your Portal</h2>
            <p className="text-slate-400 font-medium">Ready to streamline your workflow?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PortalCard 
              title="Administrator"
              desc="System control, counter provisioning, and deep business analytics."
              icon={<ShieldCheck size={32} />}
              link="/admin"
              color="from-indigo-500 to-violet-600"
              role="Super User"
            />
            <PortalCard 
              title="Service Staff"
              desc="Manage active customers, call next tokens, and finalize services."
              icon={<Monitor size={32} />}
              link="/staff"
              color="from-brand-primary to-brand-secondary"
              role="Operator"
            />
            <PortalCard 
              title="Customer Hub"
              desc="Get your digital token and track your position in real-time."
              icon={<Users size={32} />}
              link="/generate"
              color="from-emerald-500 to-teal-600"
              role="Public Access"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shadow-lg shadow-brand-primary/20">
                <Ticket className="text-white" size={18} />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tighter">SmartQueue</span>
            </div>
            <p className="text-sm text-slate-500 font-medium">© 2026 SmartQueue System. All rights reserved.</p>
          </div>
          
          <div className="flex gap-12">
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Platform</span>
              <Link href="/status" className="text-sm font-bold text-slate-600 hover:text-brand-primary transition-colors">Live Board</Link>
              <Link href="/generate" className="text-sm font-bold text-slate-600 hover:text-brand-primary transition-colors">Join Queue</Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Support</span>
              <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-brand-primary transition-colors">Help Center</Link>
              <Link href="/signup" className="text-sm font-bold text-slate-600 hover:text-brand-primary transition-colors">Register</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, desc }: any) {
  return (
    <div className="flex flex-col gap-6">
      <div className="w-16 h-16 bg-white rounded-2xl premium-shadow border border-slate-100 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function PortalCard({ title, desc, icon, link, color, role }: any) {
  return (
    <Link href={link} className="group relative block">
      <div className="absolute -inset-1 bg-linear-to-r opacity-25 group-hover:opacity-50 blur transition duration-1000 group-hover:duration-200 rounded-[2.5rem]" style={{ backgroundImage: `linear-gradient(to right, var(--color-brand-primary), var(--color-brand-secondary))` }} />
      <div className="relative bg-slate-900 border border-white/5 p-10 rounded-[2.5rem] transition-all group-hover:translate-y-[-4px]">
        <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${color} flex items-center justify-center mb-8 shadow-xl`}>
          <div className="text-white">{icon}</div>
        </div>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block">{role}</span>
        <h3 className="text-2xl font-black text-white mb-4">{title}</h3>
        <p className="text-slate-400 font-medium leading-relaxed mb-8">{desc}</p>
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          Access Portal <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
