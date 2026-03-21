'use client';

import { useReadContract, useWriteContract, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants';
import { formatEther } from 'viem';
import Navbar from '@/components/Navbar';
import { 
  User, Wallet, Award, Briefcase, PlusCircle, CheckCircle, 
  Settings, ExternalLink, ShieldCheck, Mail, ArrowUpRight, TrendingUp, Loader2,
  MapPin, Cpu, Edit3, X
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const ChevronRight = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const StatCard = ({ icon: Icon, label, value, bgClass, textClass, description }: any) => (
  <div className="glass-card flex flex-col justify-between group hover:scale-[1.02] transition-all duration-300">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-2xl ${bgClass}`}>
        <Icon className={`w-8 h-8 ${textClass}`} />
      </div>
      <div className="text-right">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status</span>
        <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded text-[9px] font-black uppercase">Active</span>
      </div>
    </div>
    <div>
      <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black text-black dark:text-white tracking-tighter mb-2 uppercase">{value}</h3>
      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{description}</p>
    </div>
  </div>
);

export default function Profile() {
  const { address, isConnected } = useAccount();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    skills: '',
    location: ''
  });

  // Fetch Jobs
  const { data: jobs, isLoading: isJobsLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllJobs',
  });

  // Fetch User Profile
  const { data: profileData, refetch: refetchProfile } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'profiles',
    args: [address as `0x${string}`],
    query: { enabled: !!address }
  });

  // Fetch Owner and admin mapping for Admin check
  const { data: ownerAddress } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  });

  const { data: isAdminInMapping } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'admins',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const isOwner = isConnected && address && ownerAddress && (address.toLowerCase() === (ownerAddress as string).toLowerCase());
  const hasAdminAccess = !!isOwner || !!isAdminInMapping;

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (profileData) {
      const [name, bio, skills, location, exists] = profileData as any;
      if (exists) {
        setFormData({ name, bio, skills, location });
      }
    }
  }, [profileData]);

  useEffect(() => {
    if (isSuccess) {
      refetchProfile();
      setIsEditModalOpen(false);
    }
  }, [isSuccess]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-mesh text-center">
        <Navbar />
        <main className="pt-32 px-6">
          <h2 className="text-4xl font-black mb-4 text-black dark:text-white uppercase tracking-tighter">Connect Wallet</h2>
          <p className="text-lg font-bold text-slate-600 dark:text-slate-400">Please connect your wallet to view your profile dashboard.</p>
        </main>
      </div>
    );
  }

  const profile = profileData ? {
    name: (profileData as any)[0] || 'Aethyl User',
    bio: (profileData as any)[1] || 'No bio provided yet.',
    skills: (profileData as any)[2] || 'Not specified',
    location: (profileData as any)[3] || 'Decentralized Space',
    exists: (profileData as any)[4]
  } : { name: 'Loading...', bio: '', skills: '', location: '', exists: false };

  const allJobs = (jobs as any[]) || [];
  const hiredJobs = allJobs.filter(j => j.freelancer.toLowerCase() === address?.toLowerCase());
  const postedJobs = allJobs.filter(j => j.client.toLowerCase() === address?.toLowerCase());
  const completedHired = hiredJobs.filter(j => j.status === 3);
  const totalEarned = completedHired.reduce((acc, j) => acc + Number(formatEther(j.amount || BigInt(0))), 0);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'updateProfile',
      args: [formData.name, formData.bio, formData.skills, formData.location],
    });
  };

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Profile Section */}
        <div className="glass-card rounded-[2.5rem] p-12 mb-12 relative overflow-hidden flex flex-col md:flex-row items-center gap-12 transition-all duration-300">
          <div className="absolute top-0 right-0 w-96 h-96  rounded-full blur-3xl -mr-48 -mt-48" />
          
          <div className="relative z-10 w-32 h-32 md:w-48 md:h-48 rounded-[40px] bg-blue-500/10 dark:bg-blue-500/20 p-1 flex items-center justify-center overflow-hidden group">
             <div className="absolute inset-0  opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
             <Cpu className="w-16 h-16 md:w-24 md:h-24 text-blue-500 drop-shadow-sm group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
          </div>
          
          <div className="relative z-10 flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div>
                <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                   <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-black dark:text-white">{profile.name}</h1>
                   <div className="px-4 py-1.5 bg-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest text-white hidden md:block">Verified Pro</div>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">
                   <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-500" /> {profile.location}</span>
                   <span className="flex items-center gap-1.5 font-mono"><ShieldCheck className="w-4 h-4 text-blue-500" /> {address?.slice(0,6)}...{address?.slice(-4)}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                {hasAdminAccess && (
                  <Link 
                    href="/admin"
                    className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" /> Admin Panel
                  </Link>
                )}
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-8 py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95"
                >
                  <Edit3 className="inline w-3.5 h-3.5 mr-2" /> Edit Profile
                </button>
              </div>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 text-lg font-medium leading-relaxed max-w-3xl mb-8">
              {profile.bio}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {profile.skills.split(',').map((skill: string, i: number) => (
                <span key={i} className="px-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                   {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <StatCard 
            icon={TrendingUp}
            label="Total Earnings"
            value={`${totalEarned.toFixed(6)} ETH`}
            bgClass="bg-green-500/10 dark:bg-green-500/20"
            textClass="text-green-500"
            description="Net income released from completed escrow contracts."
          />
          <StatCard 
            icon={Briefcase}
            label="Active Projects"
            value={hiredJobs.filter((j: any) => j.status < 3).length}
            bgClass="bg-blue-500/10 dark:bg-blue-500/20"
            textClass="text-blue-500"
            description="Ongoing projects where you are currently hired."
          />
          <StatCard 
            icon={PlusCircle}
            label="Jobs Posted"
            value={postedJobs.length}
            bgClass="bg-purple-500/10 dark:bg-purple-500/20"
            textClass="text-purple-500"
            description="Total number of job listings you've created."
          />
          <StatCard 
            icon={CheckCircle}
            label="Completion Rate"
            value={hiredJobs.length > 0 ? `${Math.round((completedHired.length / hiredJobs.length) * 100)}%` : 'N/A'}
            bgClass="bg-orange-500/10 dark:bg-orange-500/20"
            textClass="text-orange-500"
            description="Your reliability score based on successfully paid contracts."
          />
        </div>

        {/* Recent Activity */}
        <div className="glass-card !p-0 overflow-hidden border-2 border-slate-100 dark:border-white/5 mb-12">
           <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Recent Activity</h3>
              <Link href="/my-jobs" className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline">View All</Link>
           </div>
           <div className="p-8">
              {isJobsLoading ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /> : hiredJobs.length === 0 && postedJobs.length === 0 ? (
                 <p className="text-slate-500 text-center py-10">No recent activity detected.</p>
              ) : (
                 <div className="space-y-6">
                    {[...hiredJobs, ...postedJobs].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 5).map((job) => (
                       <div key={Number(job.id)} className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 transition-all group">
                          <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${job.client.toLowerCase() === address?.toLowerCase() ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                {job.client.toLowerCase() === address?.toLowerCase() ? <Mail className="w-6 h-6" /> : <Award className="w-6 h-6" />}
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{Number(job.id)} • {job.client.toLowerCase() === address?.toLowerCase() ? 'Posted' : 'Hired'}</p>
                                <h4 className="font-bold text-black dark:text-white uppercase tracking-tight">{job.title}</h4>
                             </div>
                          </div>
                          <Link href={`/jobs/${job.id}`} className="p-2 opacity-0 group-hover:opacity-100 transition-all text-blue-500">
                             <ArrowUpRight className="w-5 h-5" />
                          </Link>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>

        {/* Edit Profile Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="glass-card w-full max-w-xl !p-10 relative bg-white dark:bg-slate-900 overflow-y-auto max-h-[90vh]">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-8 right-8 p-2 bg-slate-100 dark:bg-white/5 rounded-xl hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter">Edit Identity</h2>
              <p className="text-slate-500 mb-10 text-sm font-medium">Your profile is stored on the Ethereum blockchain.</p>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Display Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Satoshi Nakamoto"
                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Professional Bio</label>
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell the community about your work..."
                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold min-h-[120px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Skills (Comma separated)</label>
                    <input 
                      type="text" 
                      value={formData.skills}
                      onChange={(e) => setFormData({...formData, skills: e.target.value})}
                      placeholder="Solidity, React, UI/UX"
                      className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Location</label>
                    <input 
                      type="text" 
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="e.g. Mars Base Alpha"
                      className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isPending || isConfirming}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isPending || isConfirming ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> {isConfirming ? 'Securing on Chain...' : 'Requesting Signature...'}
                    </>
                  ) : 'Update On-chain Profile'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

