'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants';
import { formatEther, parseEther } from 'viem';
import { Loader2, ExternalLink, ShieldCheck, Clock, CheckCircle, UserPlus, Wallet } from 'lucide-react';
import Link from 'next/link';

const JobStatusBadge = ({ status }: { status: number }) => {
  switch (status) {
    case 0:
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-semibold border border-blue-500/20">
          <Clock className="w-3 h-3" /> Posting
        </span>
      );
    case 1:
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-xs font-semibold border border-yellow-500/20">
          <UserPlus className="w-3 h-3" /> Assigned
        </span>
      );
    case 2:
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs font-semibold border border-purple-500/20">
          <Wallet className="w-3 h-3" /> Funded
        </span>
      );
    case 3:
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-semibold border border-green-500/20">
          <CheckCircle className="w-3 h-3" /> Completed
        </span>
      );
    default:
      return null;
  }
};

export default function JobCard({ job }: { job: any }) {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const isClient = address?.toLowerCase() === job.client.toLowerCase();

  const handleFund = () => {
    const amount = prompt('Enter amount in ETH to fund this job:');
    if (!amount || isNaN(Number(amount))) return;

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'fundJob',
      args: [job.id],
      value: parseEther(amount),
    });
  };

  const handleComplete = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'completeJob',
      args: [job.id],
    });
  };

  return (
    <div className="glass-card flex flex-col justify-between hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5 transition-all duration-300">
      <div>
        <div className="flex justify-between items-start mb-4">
          <JobStatusBadge status={job.status} />
          <span className="text-xs text-slate-500 font-mono">ID: {Number(job.id)}</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-500/30">
            {job.category || 'General'}
          </span>
          {job.skills && job.skills.split(',').slice(0, 3).map((skill: string, i: number) => (
            <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-[9px] font-medium border border-slate-200 dark:border-slate-700">
              {skill.trim()}
            </span>
          ))}
        </div>

        <h3 className="text-xl font-black mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
          {job.title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-6 font-medium">
          {job.description}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Budget</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{Number(formatEther(job.amount)).toFixed(7)} ETH</span>
          </div>
          <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Freelancer</span>
            <span className="font-mono text-[10px] text-slate-600 dark:text-slate-300 truncate block">
              {job.freelancer === '0x0000000000000000000000000000000000000000' 
                ? 'Unassigned' 
                : `${job.freelancer.slice(0, 6)}...${job.freelancer.slice(-4)}`}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        {job.status === 0 && isClient && (
          <Link 
            href={`/jobs/${job.id}`}
            className="btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-2"
          >
            Assign Freelancer
          </Link>
        )}
        {job.status === 1 && isClient && (
          <button 
            onClick={handleFund} 
            disabled={isPending || isConfirming}
            className="btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-2"
          >
            {isPending || isConfirming ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fund Job'}
          </button>
        )}
        {job.status === 2 && isClient && (
          <button 
            onClick={handleComplete} 
            disabled={isPending || isConfirming}
            className="btn-secondary flex-1 py-3 text-sm flex items-center justify-center gap-2"
          >
            {isPending || isConfirming ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complete & Pay'}
          </button>
        )}
        {(job.status !== 0 || !isClient) && (
          <Link 
            href={`/jobs/${job.id}`} 
            className="p-3 border border-black/10 dark:border-white/10 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center"
          >
            <ExternalLink className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </Link>
        )}
      </div>
    </div>
  );
}
