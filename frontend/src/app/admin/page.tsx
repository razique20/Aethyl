'use client';

import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants';
import Navbar from '@/components/Navbar';
import { Shield, Users, Briefcase, DollarSign, Loader2, AlertTriangle, Wallet } from 'lucide-react';
import { formatEther } from 'viem';

export default function AdminPage() {
  const { isConnected, address } = useAccount();

  const { data: isAdmin } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'admins',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  });

  const { data: allJobs, isLoading: jobsLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllJobs',
  });

  const { data: allUsers } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllUsers',
  });

  const isAuthorized = isAdmin || (owner && address && owner === address);
  const jobs = (allJobs as any[]) || [];
  const users = (allUsers as any[]) || [];

  // Stats
  const totalJobs = jobs.length;
  const fundedJobs = jobs.filter((j: any) => Number(j.status) >= 2).length;
  const completedJobs = jobs.filter((j: any) => Number(j.status) === 3).length;
  const totalEscrowed = jobs.reduce((sum: bigint, j: any) => sum + BigInt(j.amount || 0), BigInt(0));

  const statusLabels = ['Created', 'Assigned', 'Funded', 'Completed', 'Canceled', 'Disputed'];
  const statusColors = ['text-zinc-400', 'text-amber-400', 'text-cyan-400', 'text-emerald-400', 'text-red-400', 'text-orange-400'];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-mesh bg-grid">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32 text-center">
          <Wallet className="w-12 h-12 text-violet-600 mb-6" />
          <h2 className="text-3xl font-extrabold mb-3 text-zinc-900">Connect Wallet</h2>
          <p className="text-zinc-600 max-w-md">Admin access requires a connected wallet.</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-mesh bg-grid">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mb-6" />
          <h2 className="text-3xl font-extrabold mb-3 text-zinc-900">Access Denied</h2>
          <p className="text-zinc-600 max-w-md">Your wallet is not authorized as an admin.</p>
          <p className="text-xs text-zinc-500 mt-4 font-mono">{address}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh bg-grid">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs font-medium mb-2">
            <Shield className="w-3 h-3" />
            Admin Panel
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Platform <span className="gradient-text">Overview</span>
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="glass-card">
            <Briefcase className="w-5 h-5 text-violet-600 mb-3" />
            <p className="text-2xl font-extrabold text-zinc-900">{totalJobs}</p>
            <p className="text-xs text-zinc-600 mt-1">Total Jobs</p>
          </div>
          <div className="glass-card">
            <DollarSign className="w-5 h-5 text-emerald-600 mb-3" />
            <p className="text-2xl font-extrabold text-zinc-900">
              {totalEscrowed > 0 ? `${parseFloat(formatEther(totalEscrowed)).toFixed(4)} ETH` : '0 ETH'}
            </p>
            <p className="text-xs text-zinc-600 mt-1">Total Escrowed</p>
          </div>
          <div className="glass-card">
            <Users className="w-5 h-5 text-cyan-600 mb-3" />
            <p className="text-2xl font-extrabold text-zinc-900">{users.length}</p>
            <p className="text-xs text-zinc-600 mt-1">Registered Users</p>
          </div>
          <div className="glass-card">
            <Shield className="w-5 h-5 text-fuchsia-600 mb-3" />
            <p className="text-2xl font-extrabold text-zinc-900">{completedJobs}</p>
            <p className="text-xs text-zinc-600 mt-1">Completed</p>
          </div>
        </div>

        {/* On-Chain Jobs Table */}
        <div className="glow-card">
          <h2 className="text-lg font-bold text-zinc-900 mb-6">On-Chain Jobs</h2>
          {jobsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
            </div>
          ) : jobs.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-8">No on-chain jobs yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-600 border-b border-zinc-200">
                    <th className="pb-3 font-medium">ID</th>
                    <th className="pb-3 font-medium">Title</th>
                    <th className="pb-3 font-medium">Client</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {jobs.map((job: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 text-zinc-500">#{Number(job.id)}</td>
                      <td className="py-3 text-zinc-900 font-medium">{job.title || 'Untitled'}</td>
                      <td className="py-3 text-zinc-500 font-mono text-xs">
                        {job.client?.slice(0, 6)}...{job.client?.slice(-4)}
                      </td>
                      <td className="py-3">
                        <span className={`text-xs font-semibold ${statusColors[Number(job.status)] || 'text-zinc-400'}`}>
                          {statusLabels[Number(job.status)] || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3 text-right text-zinc-900 font-medium">
                        {BigInt(job.amount || 0) > 0 ? `${parseFloat(formatEther(BigInt(job.amount))).toFixed(4)} ETH` : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Registered Users */}
        {users.length > 0 && (
          <div className="glow-card mt-6">
            <h2 className="text-lg font-bold text-zinc-900 mb-6">Registered Users</h2>
            <div className="space-y-2">
              {users.map((addr: string, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-200 last:border-0">
                  <span className="text-sm text-zinc-600 font-mono">{addr}</span>
                  <span className={`text-xs font-semibold ${addr === owner ? 'text-amber-500' : 'text-zinc-500'}`}>
                    {addr === owner ? 'Owner' : 'User'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
