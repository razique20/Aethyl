'use client';

import { useState } from 'react';
import { useReadContract, useAccount } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants';
import Navbar from '@/components/Navbar';
import JobCard from '@/components/JobCard';
import { Loader2, Briefcase, UserCheck, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function MyJobs() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'hired' | 'posted'>('hired');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: jobs, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllJobs',
  });

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-mesh text-center">
        <Navbar />
        <main className="pt-32 px-6">
          <h2 className="text-4xl font-black mb-4 text-black dark:text-white uppercase tracking-tighter">Connect Wallet</h2>
          <p className="text-lg font-bold text-slate-600 dark:text-slate-400">Please connect your wallet to view your personalized jobs.</p>
        </main>
      </div>
    );
  }

  const hiredJobs = (jobs as any[])?.filter(j => j.freelancer.toLowerCase() === address?.toLowerCase()) || [];
  const postedJobs = (jobs as any[])?.filter(j => j.client.toLowerCase() === address?.toLowerCase()) || [];

  const filteredJobs = (activeTab === 'hired' ? hiredJobs : postedJobs).filter(j => 
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.id.toString().includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black text-black dark:text-white mb-2 tracking-tighter uppercase">My Project Hub</h1>
            <p className="text-slate-500 font-medium">Manage your active contracts and hiring pipelines.</p>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-900 rounded-2xl p-1.5 border border-black/5 dark:border-white/10 shadow-sm">
            <button 
              onClick={() => setActiveTab('hired')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'hired' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-black/5'}`}
            >
              <Briefcase className="w-4 h-4" /> Hired Projects ({hiredJobs.length})
            </button>
            <button 
              onClick={() => setActiveTab('posted')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'posted' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-black/5'}`}
            >
              <UserCheck className="w-4 h-4" /> Posted Jobs ({postedJobs.length})
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Title, Description or Unique ID..." 
              className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:border-blue-500 outline-none transition-all shadow-sm text-slate-900 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-blue-500 transition-all shadow-sm">
            <Filter className="w-4 h-4" /> Advanced Filter
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="text-slate-500 font-medium">Loading your projects...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 bg-red-500/5 rounded-3xl border border-red-500/10">
            <p className="font-black text-xl mb-2">Error Connecting to Chain</p>
            <p className="text-sm opacity-70">Please check your network and try again.</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-32 glass border-2 border-dashed border-black/5 dark:border-white/5 rounded-[40px] flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
              {activeTab === 'hired' ? <Briefcase className="w-8 h-8 text-slate-400" /> : <UserCheck className="w-8 h-8 text-slate-400" />}
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-6 font-bold text-xl">
              {searchQuery ? 'No matching projects found.' : activeTab === 'hired' ? "You haven't been hired for any projects yet." : "You haven't posted any jobs yet."}
            </p>
            {!searchQuery && (
              <Link href={activeTab === 'hired' ? "/dashboard" : "/jobs/create"} className="btn-primary px-10 py-4 rounded-2xl">
                {activeTab === 'hired' ? 'Explore Marketplace' : 'Create Your First Job'}
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredJobs.map((job) => (
              <JobCard key={Number(job.id)} job={job} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
