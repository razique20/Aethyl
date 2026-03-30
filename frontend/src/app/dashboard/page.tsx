'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Wallet, CheckCircle, Clock, AlertCircle,
  Loader2, Sparkles, ArrowRight, FolderOpen, DollarSign, Activity, FileText, Bell
} from 'lucide-react';

interface OffChainJob {
  _id: string;
  title: string;
  category: string;
  skills: string[];
  status: string;
  escrowStatus: string;
  quotingStatus?: string;
  escrowAmount?: number;
  milestones: any[];
  selectedFreelancer?: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  draft: { color: 'text-zinc-500', icon: Clock, label: 'Draft' },
  matching: { color: 'text-cyan-400', icon: Activity, label: 'Matching' },
  matched: { color: 'text-violet-400', icon: CheckCircle, label: 'Matched' },
  scoped: { color: 'text-amber-400', icon: FolderOpen, label: 'Scoped' },
  funded: { color: 'text-emerald-400', icon: Wallet, label: 'Funded' },
  active: { color: 'text-blue-400', icon: Activity, label: 'Active' },
  completed: { color: 'text-emerald-400', icon: CheckCircle, label: 'Completed' },
};

export default function Dashboard() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const [offChainJobs, setOffChainJobs] = useState<OffChainJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'quotes' | 'active' | 'completed' | 'notifications'>('quotes');

  // On-chain data
  const { data: onChainJobs } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllJobs',
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      if (data.success) setOffChainJobs(data.jobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const totalProjects = offChainJobs.length;
  
  const quoteJobs = offChainJobs.filter(j => ['scoped', 'pending_quote', 'negotiating'].includes(j.quotingStatus || j.status));
  const activeJobs = offChainJobs.filter(j => ['agreed', 'dual_signed', 'funded', 'active'].includes(j.quotingStatus || j.status));
  const pastJobs = offChainJobs.filter(j => ['completed', 'declined', 'canceled'].includes(j.quotingStatus || j.status));

  const totalEscrowed = offChainJobs.reduce((sum, j) => sum + (j.escrowAmount || 0), 0);
  const onChainCount = (onChainJobs as any[])?.length || 0;

  // Notification Badges
  const quoteRequestsCount = quoteJobs.length;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-mesh bg-grid">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32 px-6 text-center">
          <Wallet className="w-12 h-12 text-violet-600 mb-6" />
          <h2 className="text-3xl font-extrabold mb-3 text-zinc-900">Connect Your Wallet</h2>
          <p className="text-zinc-600 max-w-md">Connect your MetaMask wallet to view your projects and escrow status.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh bg-grid">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-400 text-xs font-medium mb-2">
              <LayoutDashboard className="w-3 h-3" />
              Execution Dashboard
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Your Projects</h1>
          </div>
          <Link href="/hire" className="btn-primary flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            New AI Hire
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Projects', value: totalProjects, icon: FolderOpen, color: 'text-violet-600' },
            { label: 'Active', value: activeJobs.length, icon: Activity, color: 'text-cyan-600' },
            { label: 'Total Escrowed', value: `$${totalEscrowed.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600' },
            { label: 'On-Chain Jobs', value: onChainCount, icon: Wallet, color: 'text-fuchsia-600' },
          ].map((stat, i) => (
            <div key={i} className="glass-card bg-slate-50 border-zinc-200 py-4 px-5">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
              <p className="text-2xl font-extrabold text-zinc-900">{stat.value}</p>
              <p className="text-xs text-zinc-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Dashboard Tabs */}
        <div className="flex items-center gap-6 border-b border-zinc-200 mb-6">
          <button 
            onClick={() => setActiveTab('quotes')}
            className={`pb-4 text-sm font-semibold transition-all relative ${activeTab === 'quotes' ? 'text-violet-600' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Quotes & Requests
              {quoteRequestsCount > 0 && <span className="bg-violet-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{quoteRequestsCount}</span>}
            </div>
            {activeTab === 'quotes' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600 rounded-t" />}
          </button>
          
          <button 
            onClick={() => setActiveTab('active')}
            className={`pb-4 text-sm font-semibold transition-all relative ${activeTab === 'active' ? 'text-cyan-600' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            <div className="flex items-center gap-2"><Activity className="w-4 h-4" /> Active Tasks</div>
            {activeTab === 'active' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-600 rounded-t" />}
          </button>

          <button 
            onClick={() => setActiveTab('completed')}
            className={`pb-4 text-sm font-semibold transition-all relative ${activeTab === 'completed' ? 'text-emerald-600' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Completed</div>
            {activeTab === 'completed' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-t" />}
          </button>

          <button 
            onClick={() => setActiveTab('notifications')}
            className={`pb-4 text-sm font-semibold transition-all relative ${activeTab === 'notifications' ? 'text-fuchsia-600' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            <div className="flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</div>
            {activeTab === 'notifications' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-fuchsia-600 rounded-t" />}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'notifications' ? (
          <div className="glass-card text-center py-16">
            <Bell className="w-10 h-10 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500">You have no new notifications.</p>
          </div>
        ) : (
          <>
            {loading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500 mb-3" />
            <p className="text-zinc-600 text-sm">Loading projects...</p>
          </div>
        ) : offChainJobs.length === 0 ? (
          <div className="glass-card text-center py-16">
            <FolderOpen className="w-10 h-10 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500 mb-4">No projects in this category.</p>
            <Link href="/hire" className="btn-primary inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Find Work
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {(activeTab === 'quotes' ? quoteJobs : activeTab === 'active' ? activeJobs : pastJobs).map((job) => {
              const config = STATUS_CONFIG[job.status] || STATUS_CONFIG.draft;
              const StatusIcon = config.icon;
              const completedMilestones = job.milestones?.filter((m: any) => m.status === 'approved' || m.status === 'completed').length || 0;
              const totalMilestones = job.milestones?.length || 0;
              const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

              return (
                <div 
                  key={job._id} 
                  className="glow-card group cursor-pointer transition-transform hover:-translate-y-1" 
                  onClick={() => {
                    if (['pending_quote', 'negotiating', 'agreed'].includes(job.quotingStatus || '')) {
                      router.push(`/dashboard/negotiate/${job._id}`);
                    } else {
                      router.push(`/dashboard/job/${job._id}`);
                    }
                  }}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <StatusIcon className={`w-4 h-4 ${config.color}`} />
                        <span className={`text-xs font-semibold uppercase tracking-wider ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-zinc-900 mb-1">{job.title}</h3>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {job.skills?.slice(0, 4).map((s: string, i: number) => (
                          <span key={i} className="skill-tag text-xs">{s}</span>
                        ))}
                      </div>
                      {/* Progress */}
                      {totalMilestones > 0 && job.quotingStatus === 'dual_signed' ? (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-zinc-600">{completedMilestones}/{totalMilestones} milestones</span>
                            <span className="text-xs text-zinc-600">{Math.round(progress)}%</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      ) : (
                        job.quotingStatus !== 'dual_signed' && (
                          <div className="text-xs font-semibold text-amber-500 bg-amber-50 px-2 py-1 inline-block rounded-md">
                            Action Required: {job.quotingStatus?.replace('_', ' ') || 'Negotiation'}
                          </div>
                        )
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      {job.escrowAmount && (
                        <>
                          <p className="text-xl font-bold text-zinc-900">${job.escrowAmount.toLocaleString()}</p>
                          <p className="text-xs text-zinc-600">escrowed</p>
                        </>
                      )}
                      <p className="text-xs text-zinc-500 mt-2">
                        {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </>
        )}
      </main>
    </div>
  );
}
