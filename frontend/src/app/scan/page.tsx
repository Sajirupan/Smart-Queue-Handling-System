"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scanner } from '@yudiel/react-qr-scanner';
import { QrCode, ArrowLeft, Camera, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GlobalScanPage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleScan = (detectedCodes: any[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const decodedText = detectedCodes[0].rawValue;
      setScanning(false);
      toast.success('QR Code Detected!');
      
      try {
        if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
          const url = new URL(decodedText);
          router.push(`${url.pathname}${url.search}`);
        } else {
          router.push(`/scan/${decodedText}`);
        }
      } catch (err) {
        router.push(`/scan/${decodedText}`);
      }
    }
  };

  const handleError = (error: any) => {
    console.error(error);
    if (error?.name === 'NotAllowedError') {
      setError('Camera access denied. Please allow camera permissions in your browser settings.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center font-display relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-brand-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-brand-secondary/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-brand-primary/10 overflow-hidden border border-slate-800 flex flex-col">
          
          <div className="bg-slate-900 p-8 text-center relative border-b border-white/10">
            <div className="inline-flex items-center gap-2 bg-brand-primary/10 px-4 py-1.5 rounded-full mb-4">
               <Camera size={14} className="text-brand-primary" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Active Scanner</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mb-2">Scan Counter Code</h1>
            <p className="text-slate-400 text-xs font-bold leading-relaxed">
              Point your camera at the digital display screen on the service terminal.
            </p>
          </div>

          <div className="p-8 bg-white flex flex-col items-center">
             {/* The container where html5-qrcode mounts its video stream */}
             <div className="w-full max-w-[300px] aspect-square rounded-3xl overflow-hidden border-4 border-slate-100 shadow-inner bg-slate-50 relative flex items-center justify-center">
               {error ? (
                 <div className="text-center p-6 flex flex-col items-center">
                   <AlertCircle className="text-red-500 mb-2" size={32} />
                   <p className="text-xs font-bold text-red-500">{error}</p>
                 </div>
               ) : scanning ? (
                 <Scanner 
                   onScan={handleScan} 
                   onError={handleError}
                   components={{ tracker: true }}
                 />
               ) : (
                 <div className="text-center p-6 flex flex-col items-center">
                   <ShieldCheck className="text-emerald-500 mb-2" size={32} />
                   <p className="text-xs font-bold text-emerald-500">Scan Complete</p>
                 </div>
               )}
             </div>
             
             {scanning ? (
               <div className="mt-8 flex items-center gap-3 text-brand-primary animate-pulse">
                  <QrCode size={20} />
                  <span className="text-xs font-black uppercase tracking-widest">Searching for code...</span>
               </div>
             ) : (
               <div className="mt-8 flex items-center gap-3 text-emerald-500">
                  <ShieldCheck size={20} />
                  <span className="text-xs font-black uppercase tracking-widest">Processing verification...</span>
               </div>
             )}
          </div>

        </div>

        <button 
          onClick={() => router.back()} 
          className="mt-8 w-full py-5 bg-white/5 hover:bg-white/10 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all border border-white/10 backdrop-blur-sm flex items-center justify-center gap-3"
        >
          <ArrowLeft size={16} /> Cancel Scan
        </button>
      </div>
    </div>
  );
}
