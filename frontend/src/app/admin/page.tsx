'use client';

import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants';
import { Users, Briefcase, FileText, Activity } from 'lucide-react';
import { formatEther } from 'viem';

export default function AdminDashboard() {
  const { data: allUsers } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllUsers',
  });

  const { data: allJobs } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllJobs',
  });

  const { data: allBlogs } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllBlogs',
  });

  const usersCount = (allUsers as any[])?.length || 0;
  const jobs = (allJobs as any[]) || [];
  const blogsCount = (allBlogs as any[])?.length || 0;

  const totalVolume = jobs.reduce((acc, job) => acc + Number(formatEther(job.amount || BigInt(0))), 0);
  const activeJobs = jobs.filter(j => j.status !== 3 && j.status !== 4).length;

  const stats = [
    { title: 'Registered Users', value: usersCount, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Total Jobs Posted', value: jobs.length, icon: Briefcase, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Active Jobs', value: activeJobs, icon: Activity, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { title: 'Total Volume (ETH)', value: totalVolume.toFixed(4), icon: FileText, color: 'text-green-500', bg: 'bg-green-500/10' },
  ];

  return (
    <div className="p-10">
      <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter">Overview</h1>
      <p className="text-slate-500 dark:text-slate-400 font-medium mb-10">Welcome to the FrethiX decentralized command center.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white dark:bg-white/5 rounded-[2rem] p-8 border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${stat.bg}`}>
                <Icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-wider mb-2">{stat.title}</p>
              <h3 className="text-4xl font-black tracking-tighter">{stat.value}</h3>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-white/5 rounded-[2rem] p-8 border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter">System Health</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/5">
            <span className="font-bold text-slate-600 dark:text-slate-400">Total Blogs Published</span>
            <span className="font-black text-xl">{blogsCount}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/5">
            <span className="font-bold text-slate-600 dark:text-slate-400">Escrow Contract Status</span>
            <span className="font-bold text-green-500 px-3 py-1 bg-green-500/10 rounded-full text-xs uppercase tracking-widest">Active & Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}
