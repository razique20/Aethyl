'use client';

import { useReadContract, useAccount } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants';
import { formatEther } from 'viem';
import Navbar from '@/components/Navbar';
import { Loader2, TrendingUp, ArrowDownRight, Wallet, Receipt, CreditCard, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function MyPayments() {
  const { address, isConnected } = useAccount();

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
          <p className="text-lg font-bold text-slate-600 dark:text-slate-400">Please connect your wallet to view your payment history.</p>
        </main>
      </div>
    );
  }

  // Payments received (Completed jobs where user is freelancer)
  // Note: Since amount is reset to 0 in contract after payment release, 
  // we might need a separate 'JobDetails' or 'PaymentReceived' event for historical amounts.
  // HOWEVER, for this demo, we'll assume completed jobs represent historical payments.
  // Ideally, the contract would store a 'finalBudget' field.
  const paidJobs = (jobs as any[])?.filter(j => 
    j.freelancer.toLowerCase() === address?.toLowerCase() && j.status === 3
  ) || [];

  const totalEarned = paidJobs.reduce((acc, j) => acc + Number(formatEther(j.amount || BigInt(0))), 0);

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <h1 className="text-5xl font-black text-black dark:text-white mb-2 tracking-tighter uppercase">Payment History</h1>
            <p className="text-slate-500 font-medium">Track your on-chain earnings and transaction receipts.</p>
          </div>
          
          <div className="glass-card !p-8 bg-blue-600 text-white border-none shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
            <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10 flex items-center gap-6">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Wallet className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Total Earned</p>
                <h2 className="text-4xl font-black tracking-tight">{totalEarned.toFixed(6)} ETH</h2>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="text-slate-500 font-medium">Fetching payment records...</p>
          </div>
        ) : paidJobs.length === 0 ? (
          <div className="text-center py-32 glass border-2 border-dashed border-black/5 dark:border-white/5 rounded-[40px] flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 text-slate-400">
              <Receipt className="w-10 h-10" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-6 font-bold text-xl uppercase tracking-tighter">No payments detected yet.</p>
            <Link href="/my-jobs" className="btn-primary px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest">
              View Active Projects
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {paidJobs.map((job) => (
              <div key={Number(job.id)} className="glass-card hover:bg-white dark:hover:bg-slate-900/50 transition-all border-l-8 border-l-green-500 group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                      <ArrowDownRight className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project ID: #{Number(job.id)}</span>
                         <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded text-[9px] font-black uppercase">Paid</span>
                      </div>
                      <h3 className="text-xl font-black text-black dark:text-white leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tighter">{job.title}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Income</p>
                      <p className="text-xl font-black text-green-600 dark:text-green-500 tracking-tighter font-mono">+{Number(formatEther(job.amount || BigInt(0))).toFixed(6)} ETH</p>
                    </div>
                    <Link href={`/jobs/${job.id}`} className="p-3 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-black/10 transition-all">
                      <ChevronRight className="w-6 h-6 text-slate-400" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
