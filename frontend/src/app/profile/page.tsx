'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useAccount } from 'wagmi';
import { Briefcase, Building2, Mail, Loader2, Star, MapPin, Clock, Edit3, Tag, DollarSign, AlertCircle, Sparkles } from 'lucide-react';

interface ProfileData {
  user: {
    email: string;
    role: string;
    createdAt: string;
  };
  profile: any | null; // Freelancer data if role === 'freelancer'
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { address } = useAccount();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/profile');
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-mesh bg-grid">
        <Navbar />
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-mesh bg-grid">
        <Navbar />
        <div className="text-center py-32 text-zinc-600">Failed to load profile.</div>
      </div>
    );
  }

  const { user: userData, profile } = data;
  const isFreelancer = userData.role === 'freelancer';

  return (
    <div className="min-h-screen bg-mesh bg-grid">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-400 text-xs font-medium mb-2">
            {isFreelancer ? <Briefcase className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
            {isFreelancer ? 'Freelancer Profile' : 'Client Profile'}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Your Account</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Account Details */}
          <div className="md:col-span-1 space-y-6">
            <div className="glass-card">
              <h2 className="text-lg font-bold text-zinc-900 mb-4 border-b border-zinc-200 pb-2">Account</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-600 uppercase tracking-wider">Email</label>
                  <div className="flex items-center gap-2 mt-1 text-zinc-800">
                    <Mail className="w-4 h-4 text-zinc-500" />
                    <span className="truncate">{userData.email}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-600 uppercase tracking-wider">Role</label>
                  <p className="mt-1 text-zinc-900 font-medium capitalize">{userData.role}</p>
                </div>
                <div>
                  <label className="text-xs text-zinc-600 uppercase tracking-wider">Connected Wallet</label>
                  {address ? (
                    <p className="mt-1 text-emerald-600 font-mono text-sm break-all">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </p>
                  ) : (
                    <p className="mt-1 text-amber-600 text-sm">Not connected</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Extended Profile (if Freelancer) */}
          <div className="md:col-span-2">
            {!isFreelancer ? (
              <div className="glow-card h-full flex flex-col items-center justify-center text-center p-12">
                <Building2 className="w-12 h-12 text-zinc-400 mb-4" />
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Client Account</h3>
                <p className="text-zinc-600 text-sm max-w-sm">
                  You are all set to start hiring top talent and creating smart contract escrows. Head over to the Dashboard or use the AI Hire engine.
                </p>
              </div>
            ) : !profile ? (
              <div className="glow-card p-12 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4 border border-amber-200">
                  <AlertCircle className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Profile Incomplete</h3>
                <p className="text-zinc-600 text-sm max-w-sm mb-6">
                  You need to complete the AI setup questionnaire to build out your freelancer profile before you can start receiving job matches.
                </p>
                <Link href="/onboarding" className="btn-primary inline-flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Start Onboarding Setup
                </Link>
              </div>
            ) : (
              <div className="glow-card relative">
                <button className="absolute top-6 right-6 p-2 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-900 transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
                
                <div className="flex items-start gap-6 mb-8">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-24 h-24 rounded-2xl border-2 border-violet-200 object-cover"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900 mb-1">{profile.name}</h2>
                    <p className="text-violet-600 font-medium mb-3">{profile.title}</p>
                    <div className="flex items-center gap-4 text-sm text-zinc-600">
                      <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-400" /> {profile.rating} Rating</span>
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {profile.responseTime}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-700 mb-2">About</h3>
                    <p className="text-zinc-600 text-sm leading-relaxed">{profile.bio || 'No bio provided.'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-700 mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-cyan-500" /> Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills?.map((skill: string, i: number) => (
                        <span key={i} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-zinc-200">
                    <div>
                      <p className="text-sm text-zinc-600">Hourly Rate Target</p>
                      <p className="text-2xl font-bold text-zinc-900 mt-1 flex items-center gap-1">
                        <DollarSign className="w-5 h-5 text-emerald-500" />
                        {profile.hourlyRate}
                        <span className="text-sm font-normal text-zinc-500">/hr</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-zinc-600">Jobs Completed</p>
                      <p className="text-2xl font-bold text-zinc-900 mt-1">{profile.completedJobs}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
