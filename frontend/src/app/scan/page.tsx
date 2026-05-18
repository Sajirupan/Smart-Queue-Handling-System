"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { QrCode, ArrowLeft, Camera, ShieldCheck, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GlobalScanPage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    // We only want the scanner to initialize on the client side
    if (typeof window === 'undefined') return;

    // Initialize the scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true,
      },
      false
    );

    const onScanSuccess = (decodedText: string) => {
      // Stop the scanner
      scanner.clear().catch(console.error);
      setScanning(false);
      toast.success('QR Code Detected!');
      
      try {
        // If the QR code is a full URL (e.g. http://localhost:3000/scan/COUNTER_ID?date=...)
        if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
          const url = new URL(decodedText);
          // Navigate to the path + search params extracted from the QR code
          router.push(`${url.pathname}${url.search}`);
        } else {
          // If the QR code is just the counter ID
          router.push(`/scan/${decodedText}`);
        }
      } catch (err) {
        // Fallback if URL parsing fails
        router.push(`/scan/${decodedText}`);
      }
    };

    const onScanFailure = (error: any) => {
      // Html5QrcodeScanner throws continuous errors while scanning for a code.
      // We ignore these as they just mean "no QR code found yet in this frame".
    };

    // Render the scanner
    scanner.render(onScanSuccess, onScanFailure);

    // Cleanup function when component unmounts
    return () => {
      scanner.clear().catch(console.error);
    };
  }, [router]);

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
             <div 
               id="reader" 
               className="w-full max-w-[300px] aspect-square rounded-3xl overflow-hidden border-4 border-slate-100 shadow-inner bg-slate-50 relative [&_video]:object-cover"
             >
               {/* Note: html5-qrcode dynamically injects UI elements here.
                   We'll rely on its default rendering but house it in a sleek container. */}
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
