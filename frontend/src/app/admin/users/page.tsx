'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants';
import { Shield, Ban, XCircle, Loader2, Users, ShieldCheck, Copy } from 'lucide-react';
import { useState, useEffect } from 'react';

const STATUS_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'Created', color: 'text-blue-500 bg-blue-500/10' },
  1: { label: 'Assigned', color: 'text-yellow-500 bg-yellow-500/10' },
  2: { label: 'Funded', color: 'text-orange-500 bg-orange-500/10' },
  3: { label: 'Completed', color: 'text-green-500 bg-green-500/10' },
  4: { label: 'Canceled', color: 'text-red-500 bg-red-500/10' },
};

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function AdminUsersAndJobs() {
  const { address: myAddress } = useAccount();
  const [targetAddress, setTargetAddress] = useState('');
  const [banStatus, setBanStatus] = useState(true);
  const [copiedAddr, setCopiedAddr] = useState('');

  const { data: allUsers, refetch: refetchUsers } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllUsers',
  });

  const { data: allJobs, refetch: refetchJobs } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllJobs',
  });

  const { data: ownerAddress } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const users = (allUsers as string[]) || [];
  const jobs = (allJobs as any[]) || [];

  // Fetch admin status for each user
  const [adminStatuses, setAdminStatuses] = useState<Record<string, boolean>>({});
  const [profileData, setProfileData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (isSuccess) {
      refetchJobs();
      refetchUsers();
      setTargetAddress('');
    }
  }, [isSuccess]);

  const handleBanUser = () => {
    if (!targetAddress) return;
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'adminBanUser',
      args: [targetAddress as `0x${string}`, banStatus],
    });
  };

  const handleCancelJob = (jobId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'adminCancelJob',
      args: [jobId],
    });
  };

  const copyToClipboard = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddr(addr);
    setTimeout(() => setCopiedAddr(''), 2000);
  };

  const isAdmin = (addr: string) => addr.toLowerCase() === (ownerAddress as string)?.toLowerCase();

  return (
    <div className="p-10">
      <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter">Moderation</h1>
      <p className="text-slate-500 dark:text-slate-400 font-medium mb-10">Manage users, admins, and active jobs to maintain platform safety.</p>

      {/* ── Registered Users List ── */}
      <div className="bg-white dark:bg-white/5 rounded-[2rem] p-8 border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter">All Registered Users</h2>
            <p className="text-xs text-slate-500 font-medium">{users.length} account{users.length !== 1 ? 's' : ''} registered on-chain</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">
                <th className="pb-4">#</th>
                <th className="pb-4">Wallet Address</th>
                <th className="pb-4">Role</th>
                <th className="pb-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium">
              {users.map((addr, idx) => {
                const isOwner = addr.toLowerCase() === (ownerAddress as string)?.toLowerCase();
                const isMe = addr.toLowerCase() === myAddress?.toLowerCase();
                return (
                  <tr key={idx} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 text-slate-400 font-bold text-xs">{idx + 1}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{shortAddr(addr)}</span>
                        {isMe && <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-full">You</span>}
                        <button onClick={() => copyToClipboard(addr)} className="text-slate-400 hover:text-slate-600 transition-colors">
                          <Copy className="w-3 h-3" />
                        </button>
                        {copiedAddr === addr && <span className="text-[10px] text-green-500 font-bold">Copied!</span>}
                      </div>
                    </td>
                    <td className="py-4">
                      {isOwner ? (
                        <span className="text-[11px] font-black uppercase px-3 py-1 bg-yellow-500/10 text-yellow-600 rounded-full flex items-center gap-1 w-fit">
                          <ShieldCheck className="w-3 h-3" /> Owner
                        </span>
                      ) : (
                        <span className="text-[11px] font-black uppercase px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-full flex items-center gap-1 w-fit">
                          <Users className="w-3 h-3" /> User
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      {!isOwner && (
                        <button
                          onClick={() => { setTargetAddress(addr); setBanStatus(true); }}
                          className="text-red-500 hover:text-red-600 font-bold text-xs uppercase tracking-widest flex items-center gap-1 justify-end ml-auto"
                        >
                          <Ban className="w-3 h-3" /> Ban
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-slate-500 text-sm">No registered users yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── User Ban Control ── */}
      <div className="bg-white dark:bg-white/5 rounded-[2rem] p-8 border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none mb-8">
        <h2 className="text-xl font-black mb-5 uppercase tracking-tighter flex items-center gap-3">
          <Shield className="w-5 h-5 text-red-500" /> User Access Control
        </h2>
        <div className="flex flex-col md:flex-row gap-4 max-w-2xl">
          <input
            type="text"
            placeholder="Enter wallet address (0x...)"
            value={targetAddress}
            onChange={(e) => setTargetAddress(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-black dark:text-white focus:outline-none focus:border-red-500 font-mono"
          />
          <select
            className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-black dark:text-white focus:outline-none"
            value={banStatus ? 'ban' : 'unban'}
            onChange={(e) => setBanStatus(e.target.value === 'ban')}
          >
            <option value="ban">Ban User</option>
            <option value="unban">Unban User</option>
          </select>
          <button
            onClick={handleBanUser}
            disabled={isPending || isConfirming || !targetAddress}
            className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-red-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isPending || isConfirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
            Execute
          </button>
        </div>
      </div>

      {/* ── Job Moderation ── */}
      <div className="bg-white dark:bg-white/5 rounded-[2rem] p-8 border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <h2 className="text-xl font-black mb-6 uppercase tracking-tighter">Job Moderation</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">
                <th className="pb-4">ID</th>
                <th className="pb-4">Title</th>
                <th className="pb-4">Client</th>
                <th className="pb-4">Status</th>
                <th className="pb-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium">
              {jobs.map((job, idx) => {
                const s = STATUS_LABELS[job.status] || { label: 'Unknown', color: 'text-slate-500 bg-slate-100' };
                return (
                  <tr key={idx} className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-4 text-slate-400 font-bold text-xs">#{job.id.toString()}</td>
                    <td className="py-4 font-bold max-w-[200px] truncate">{job.title}</td>
                    <td className="py-4 font-mono text-xs">{shortAddr(job.client)}</td>
                    <td className="py-4">
                      <span className={`text-[11px] font-black uppercase px-3 py-1 rounded-full ${s.color}`}>{s.label}</span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleCancelJob(job.id)}
                        disabled={job.status === 3 || job.status === 4 || isPending || isConfirming}
                        className="text-red-500 hover:text-red-600 font-bold text-xs uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 justify-end ml-auto"
                      >
                        <XCircle className="w-4 h-4" /> Cancel
                      </button>
                    </td>
                  </tr>
                );
              })}
              {jobs.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500">No jobs exist yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
