"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Phone, FileText, Camera, X, Check, Sparkles } from 'lucide-react';
import api from '@/api/axios';
import toast from 'react-hot-toast';

export default function ProfileModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { user, setUser } = useAuth() as any;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: ''
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || ''
      });
      setPreview(user.avatar ? `http://localhost:5000${user.avatar}` : '');
    }
  }, [user]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('bio', formData.bio);
    if (avatar) {
      data.append('avatar', avatar);
    }

    try {
      const res = await api.put('/auth/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(res.data.data);
      toast.success('Profile updated successfully!');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-500 font-display">
        <div className="h-32 bg-slate-900 relative overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.2),transparent)]" />
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
           
           <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-20">
             <X size={18} />
           </button>
           
           <div className="absolute -bottom-16 left-12 p-1.5 bg-white rounded-[2.5rem] shadow-xl z-10">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2rem] bg-slate-100 border-4 border-white overflow-hidden flex items-center justify-center">
                  {preview ? (
                    <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-slate-300" />
                  )}
                </div>
                <label className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-[2rem]">
                  <Camera size={24} className="text-white" />
                  <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
              </div>
           </div>
        </div>

        <div className="pt-20 px-12 pb-12">
          <div className="mb-10">
             <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-brand-primary" />
                <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Profile Settings</span>
             </div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tight">Account Identity</h2>
             <p className="text-slate-500 text-sm font-medium">Update your professional details across the platform.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all text-sm font-bold"
                    />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all text-sm font-bold"
                    />
                  </div>
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
              <div className="relative">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all text-sm font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Bio</label>
              <div className="relative">
                <FileText className="absolute left-5 top-5 text-slate-300" size={16} />
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full pl-12 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all text-sm font-medium h-32 resize-none"
                  placeholder="Share a brief overview of your role..."
                />
              </div>
            </div>

            <div className="pt-6 flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-[1.5rem] text-sm font-black hover:bg-slate-200 transition-all uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] py-5 bg-brand-primary text-white rounded-[1.5rem] text-sm font-black hover:shadow-2xl hover:shadow-brand-primary/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-widest"
              >
                {loading ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                   <>
                     <Check size={20} />
                     Save Profiles
                   </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
