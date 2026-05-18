"use client";

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, LogOut, LogIn, Ticket, LayoutDashboard, QrCode } from 'lucide-react';
import Link from 'next/link';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth() as any;

  // Don't show navigation bar on admin/staff workspaces since they already have comprehensive sidebar systems
  if (pathname.startsWith('/admin') || pathname.startsWith('/staff')) {
    return null;
  }

  const handleBack = () => {
    // If we are on the landing page, we can't go "back" further, so default to home
    if (pathname === '/') {
      return;
    }
    
    // Check if window exists and history has states
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/40 backdrop-blur-md border-b border-slate-200/50 px-6 md:px-12 py-4 flex items-center justify-between transition-all">
      {/* Brand logo & Back button */}
      <div className="flex items-center gap-4">
        {pathname !== '/' && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 rounded-full transition-all text-xs font-black uppercase tracking-wider group cursor-pointer shadow-sm shadow-slate-100/50 animate-in fade-in slide-in-from-left-4 duration-300"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
        )}
        
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:rotate-6 transition-transform">
            <Ticket className="text-white" size={20} />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900">
            Smart<span className="text-brand-primary">Queue</span>
          </span>
        </Link>
      </div>

      {/* Middle Links (Visible on desktop screens md+) */}
      <div className="hidden md:flex items-center gap-8">
        <div className="flex items-center gap-6 text-sm font-bold text-slate-500">
          <Link href="/status" className={`hover:text-brand-primary transition-colors ${pathname === '/status' ? 'text-brand-primary' : ''}`}>
            Live Board
          </Link>
          <Link href="/generate" className={`hover:text-brand-primary transition-colors ${pathname === '/generate' ? 'text-brand-primary' : ''}`}>
            Join Queue
          </Link>
          <Link href="/scan" className={`flex items-center gap-1.5 hover:text-brand-primary transition-colors ${pathname === '/scan' ? 'text-brand-primary' : ''}`}>
            <QrCode size={16} /> Scan QR
          </Link>
        </div>
      </div>

      {/* Auth action buttons */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3 bg-slate-100/50 pl-3 pr-2 py-1.5 rounded-full border border-slate-200/20">
            <Link 
              href={user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/status'}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full transition-all text-xs font-bold hover:shadow-md flex items-center gap-1.5"
            >
              <LayoutDashboard size={12} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all text-[10px] font-black uppercase tracking-wider cursor-pointer hover:shadow-lg hover:shadow-red-500/20"
            >
              <LogOut size={10} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {pathname !== '/login' && (
              <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors px-3 py-2">
                Sign In
              </Link>
            )}
            {pathname !== '/signup' && (
              <Link
                href="/signup"
                className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl transition-all text-xs font-black uppercase tracking-wider hover:shadow-lg hover:shadow-brand-primary/20 cursor-pointer"
              >
                Get Started
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
