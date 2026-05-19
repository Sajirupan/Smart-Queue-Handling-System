"use client";

import { useState } from 'react';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, ArrowLeft, MessageSquare, CheckCircle2, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FeedbackPage() {
  const { user } = useAuth() as any;
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [message, setMessage] = useState('');
  const [serviceType, setServiceType] = useState('General');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }
    if (!user) {
      toast.error('Please sign in to submit feedback');
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      await api.post('/feedback', { rating, message, serviceType });
      setSubmitted(true);
      toast.success('Thank you for your feedback!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6 font-display">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-12 border border-slate-200 premium-shadow text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Thank You!</h1>
          <p className="text-slate-500 font-medium mb-10">Your feedback helps us improve the experience for everyone.</p>
          <div className="text-amber-400 text-3xl mb-10">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</div>
          <Link href="/" className="inline-flex items-center justify-center gap-2 w-full py-4 bg-brand-primary text-white rounded-2xl font-black hover:bg-indigo-600 transition-all">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6 font-display">
      <div className="w-full max-w-lg">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-brand-primary uppercase tracking-widest transition-all mb-8">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 premium-shadow">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
              <MessageSquare size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Share Feedback</h1>
              <p className="text-sm text-slate-500 font-medium">How was your experience today?</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Star Rating */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Your Rating</label>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="text-5xl transition-all hover:scale-110 active:scale-95"
                  >
                    <span className={(hovered || rating) >= star ? 'text-amber-400' : 'text-slate-200'}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">
                  {['', 'Very Poor', 'Poor', 'Average', 'Good', 'Excellent!'][rating]}
                </p>
              )}
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Service Used</label>
              <div className="grid grid-cols-2 gap-3">
                {['General', 'Billing', 'Support', 'Account'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setServiceType(type)}
                    className={`py-3 rounded-2xl text-sm font-black border-2 transition-all ${
                      serviceType === type
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Additional Comments (Optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder="Tell us more about your experience..."
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-sm font-medium text-slate-900 resize-none"
              />
              <div className="text-right text-[10px] text-slate-400 mt-1">{message.length}/500</div>
            </div>

            <button
              type="submit"
              disabled={loading || rating === 0}
              className="w-full flex items-center justify-center gap-3 py-5 bg-brand-primary text-white rounded-2xl font-black text-sm hover:bg-indigo-600 shadow-xl shadow-brand-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={18} />
                  Submit Feedback
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
