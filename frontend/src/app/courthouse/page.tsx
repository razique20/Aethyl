'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants';
import Navbar from '@/components/Navbar';
import { Loader2, Gavel, Scale, ExternalLink, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { formatEther } from 'viem';
import { useEffect, useState } from 'react';

function DisputeItem({ job, userAddress, refetch }: { job: any, userAddress: string, refetch: () => void }) {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isWaiting } = useWaitForTransactionReceipt({ hash });

  const { data: disputeData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'disputes',
    args: [job.id],
  });

  const { data: hasVoted } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'jurorHasVoted',
    args: [job.id, userAddress as `0x${string}`],
  });

  useEffect(() => {
    if (!isWaiting && hash) {
      refetch();
    }
  }, [isWaiting, hash, refetch]);

  if (!disputeData) return null;
  const [jobId, clientVotes, freelancerVotes, evidenceURI, isResolved] = (disputeData as any);

  const handleVote = (favorFreelancer: boolean) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'voteOnDispute',
      args: [job.id, favorFreelancer],
    });
  };

  return (
    <div className="glass-card flex flex-col h-full border-red-500/10 hover:border-red-500/30 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] text-red-500 font-black uppercase tracking-widest block mb-1">Dispute Active</span>
          <h3 className="text-xl font-black text-black dark:text-white line-clamp-1">{job.title}</h3>
        </div>
        <Link href={`/jobs/${job.id}`} className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
          <ExternalLink className="w-4 h-4 text-slate-500" />
        </Link>
      </div>

      <div className="space-y-4 mb-6 flex-grow">
        <div className="p-3 bg-slate-50 dark:bg-black/20 rounded-xl border border-black/5 dark:border-white/5">
          <span className="text-[10px] text-slate-500 uppercase font-black block mb-1">Evidence Provided</span>
          <a 
            href={evidenceURI} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs font-mono text-blue-500 hover:underline break-all block"
          >
            {evidenceURI}
          </a>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
            <span className="text-[10px] text-blue-500 uppercase font-black block mb-1 italic">Favor Client</span>
            <div className="text-2xl font-black">{Number(clientVotes)}</div>
          </div>
          <div className="p-3 bg-purple-500/5 rounded-xl border border-purple-500/10">
            <span className="text-[10px] text-purple-500 uppercase font-black block mb-1 italic">Favor Freelancer</span>
            <div className="text-2xl font-black">{Number(freelancerVotes)}</div>
          </div>
        </div>
        
        <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl">
           <span className="text-[10px] text-slate-500 uppercase font-black block mb-1">Dispute Value</span>
           <span className="text-lg font-black text-blue-600 dark:text-blue-400">{formatEther(job.amount)} ETH</span>
        </div>
      </div>

      <div className="space-y-3">
        {hasVoted ? (
          <div className="w-full py-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">You have voted</span>
          </div>
        ) : isPending || isWaiting ? (
          <div className="w-full py-4 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="flex gap-3">
            <button 
              onClick={() => handleVote(false)}
              className="flex-1 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-600 border border-red-600/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Refund Client
            </button>
            <button 
              onClick={() => handleVote(true)}
              className="flex-1 py-3 bg-green-600/10 hover:bg-green-600/20 text-green-600 border border-green-600/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Release Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Courthouse() {
  const { address, isConnected } = useAccount();

  const { data: jobs, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllJobs',
  });

  const { data: isJuror } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'jurors',
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address }
  });

  const { data: isAdmin } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'admins',
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address }
  });

  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'owner',
    query: { enabled: !!address }
  });

  const isOwner = address?.toLowerCase() === (owner as string)?.toLowerCase();
  const isAuthorized = isJuror || isAdmin || isOwner;

  const disputedJobs = (jobs as any[])?.filter(j => j.status === 5);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-mesh text-center">
        <Navbar />
        <main className="pt-32 px-6">
          <h2 className="text-4xl font-black mb-4 text-black dark:text-white uppercase tracking-tighter">Connect Wallet</h2>
          <p className="text-lg font-bold text-slate-600 dark:text-slate-400">Please connect your MetaMask wallet to enter the Courthouse.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
              <Gavel className="w-10 h-10 text-red-500" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-black dark:text-white tracking-tighter uppercase">The Courthouse</h1>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Decentralized Arbitration Layer</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 p-6 glass-card border-red-500/10 bg-red-500/5">
             <ShieldAlert className="w-8 h-8 text-red-500" />
             <div>
               <span className="text-[10px] text-red-500 font-black uppercase tracking-widest block mb-1">Juror Status</span>
               {isAuthorized ? (
                 <span className="text-xl font-black text-green-500 flex items-center gap-2">ACTIVE <CheckCircle2 className="w-5 h-5" /></span>
               ) : (
                 <span className="text-xl font-black text-slate-400 flex items-center gap-2">UNAUTHORIZED <XCircle className="w-5 h-5" /></span>
               )}
             </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 animate-spin text-red-500 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Summoning cases...</p>
          </div>
        ) : !isAuthorized ? (
          <div className="text-center py-32 glass-card border-slate-200 dark:border-white/5 rounded-3xl">
            <Scale className="w-16 h-16 text-slate-300 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-tight">Access Restricted</h2>
            <p className="text-slate-500 max-w-md mx-auto font-medium">
              Only authorized Jurors and Administrators can participate in the arbitration process. 
              If you believe this is an error, please contact the platform governance.
            </p>
          </div>
        ) : disputedJobs?.length === 0 ? (
          <div className="text-center py-32 glass-card border-slate-200 dark:border-white/5 rounded-3xl">
            <CheckCircle2 className="w-16 h-16 text-green-500/30 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-tight">All Cases Resolved</h2>
            <p className="text-slate-500 font-medium">The courthouse is currently empty. No active disputes require your attention.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {disputedJobs?.map((job) => (
              <DisputeItem 
                key={Number(job.id)} 
                job={job} 
                userAddress={address!}
                refetch={refetch}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
