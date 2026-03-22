'use client';

import { useReadContract, useAccount } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants';
import Navbar from '@/components/Navbar';
import JobCard from '@/components/JobCard';
import { Loader2, PlusCircle, LayoutDashboard, Bell, Star } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import ReviewForm from '@/components/ReviewForm';
export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const [selectedJobForReview, setSelectedJobForReview] = useState<number | null>(null);

  const { data: jobs, isLoading, error, refetch } = useReadContract({
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
          <p className="text-lg font-bold text-slate-600 dark:text-slate-400">Please connect your MetaMask wallet to view your dashboard.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-10 h-10 text-blue-600 dark:text-blue-500" />
            <h1 className="text-4xl font-black text-black dark:text-white">Marketplace Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
             <Link href="/jobs/create" className="btn-primary flex items-center gap-2">
               <PlusCircle className="w-5 h-5" /> New Job
             </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-500 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Fetching jobs from the blockchain...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 dark:text-red-400">
            <p className="font-bold text-lg mb-2">Network Error</p>
            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
              We couldn't connect to the blockchain. Please ensure your wallet is on the 
              <span className="font-bold text-blue-500"> Sepolia Testnet</span> and you have a stable connection.
            </p>
            <button onClick={() => refetch()} className="btn-secondary py-2 px-8">Retry Connection</button>
          </div>
        ) : (jobs as any[])?.length === 0 ? (
          <div className="text-center py-32 solid-card border border-dashed border-black/10 dark:border-white/10 rounded-2xl">
            <p className="text-slate-500 dark:text-slate-400 mb-6">No jobs found in the marketplace yet.</p>
            <Link href="/jobs/create" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium underline">
              Be the first to create one!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(jobs as any[])?.map((job) => (
              <JobCard 
                key={Number(job.id)} 
                job={job} 
                onRate={(jobId) => setSelectedJobForReview(jobId)}
              />
            ))}
          </div>
        )}

        <ReviewForm 
          jobId={selectedJobForReview ?? 0}
          isOpen={selectedJobForReview !== null}
          onClose={() => setSelectedJobForReview(null)}
        />
      </main>
    </div>
  );
}
