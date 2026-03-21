'use client';

import { useState } from 'react';
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants';
import { ShieldCheck, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { isAddress } from 'viem';

// Sub-component that checks if a single address is an admin on-chain
function AdminBadge({ addr, ownerAddress, onRevoke }: { addr: string; ownerAddress: string; onRevoke: (addr: string) => void }) {
  const { data: isAdmin } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'admins',
    args: [addr as `0x${string}`],
    query: { refetchInterval: 4000 },
  });
  const isOwner = addr.toLowerCase() === ownerAddress.toLowerCase();
  if (!isAdmin && !isOwner) return null;
  return (
    <tr className="border-b border-slate-100 dark:border-white/5">
      <td className="py-4 font-mono text-xs">{addr.slice(0, 10)}...{addr.slice(-6)}</td>
      <td className="py-4">
        {isOwner ? (
          <span className="text-[11px] font-black uppercase px-3 py-1 bg-yellow-500/10 text-yellow-600 rounded-full">Owner</span>
        ) : (
          <span className="text-[11px] font-black uppercase px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full">Admin</span>
        )}
      </td>
      <td className="py-4 text-right">
        {!isOwner && (
          <button onClick={() => onRevoke(addr)} className="text-rose-500 hover:text-rose-600 font-bold text-xs uppercase tracking-widest flex items-center gap-1 ml-auto">
            <UserMinus className="w-3 h-3" /> Revoke
          </button>
        )}
      </td>
    </tr>
  );
}

export default function AdminsManagementPage() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();
  const [newAdminAddress, setNewAdminAddress] = useState('');
  const [removeAdminAddress, setRemoveAdminAddress] = useState('');
  const [txStatus, setTxStatus] = useState<Record<string, 'pending' | 'success' | 'error'>>({});

  const refreshQueries = () => queryClient.invalidateQueries();

  const { data: allUsers } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllUsers',
  });

  const { data: ownerAddress } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  });

  const handleAddAdmin = async () => {
    if (!isAddress(newAdminAddress)) return alert('Invalid Ethereum address');
    try {
      setTxStatus(s => ({ ...s, add: 'pending' }));
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'addAdmin',
        args: [newAdminAddress as `0x${string}`],
      });
      setTxStatus(s => ({ ...s, add: 'success' }));
      setNewAdminAddress('');
      refreshQueries();
    } catch (e) {
      console.error(e);
      setTxStatus(s => ({ ...s, add: 'error' }));
    }
  };

  const handleRemoveAdmin = async () => {
    if (!isAddress(removeAdminAddress)) return alert('Invalid Ethereum address');
    try {
      setTxStatus(s => ({ ...s, remove: 'pending' }));
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'removeAdmin',
        args: [removeAdminAddress as `0x${string}`],
      });
      setTxStatus(s => ({ ...s, remove: 'success' }));
      setRemoveAdminAddress('');
      refreshQueries();
    } catch (e) {
      console.error(e);
      setTxStatus(s => ({ ...s, remove: 'error' }));
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter">Admin Management</h1>
      <p className="text-slate-500 dark:text-slate-400 font-medium mb-10">Grant or revoke administrative access to other wallet addresses on-chain.</p>

      {/* Add / Remove */}
      <div className="bg-white dark:bg-white/5 rounded-[2rem] p-8 border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none mb-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Manage Administrators</h2>
            <p className="text-sm text-slate-500 font-medium">Add or remove wallets with admin privileges.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add Admin */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus className="w-5 h-5 text-green-500" />
              <h3 className="font-black uppercase tracking-tight text-sm">Add Administrator</h3>
            </div>
            <input
              type="text"
              value={newAdminAddress}
              onChange={e => setNewAdminAddress(e.target.value)}
              placeholder="0x... wallet address"
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-indigo-500 transition-colors mb-3"
            />
            <button
              onClick={handleAddAdmin}
              disabled={!newAdminAddress || txStatus.add === 'pending'}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {txStatus.add === 'pending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {txStatus.add === 'pending' ? 'Confirming...' : txStatus.add === 'success' ? '✓ Admin Added!' : 'Add Admin'}
            </button>
          </div>

          {/* Remove Admin */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <UserMinus className="w-5 h-5 text-rose-500" />
              <h3 className="font-black uppercase tracking-tight text-sm">Remove Administrator</h3>
            </div>
            <input
              type="text"
              value={removeAdminAddress}
              onChange={e => setRemoveAdminAddress(e.target.value)}
              placeholder="0x... wallet address"
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-rose-500 transition-colors mb-3"
            />
            <button
              onClick={handleRemoveAdmin}
              disabled={!removeAdminAddress || txStatus.remove === 'pending'}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {txStatus.remove === 'pending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
              {txStatus.remove === 'pending' ? 'Confirming...' : txStatus.remove === 'success' ? '✓ Admin Removed!' : 'Remove Admin'}
            </button>
          </div>
        </div>
      </div>

      {/* Current Admins List */}
      <div className="bg-white dark:bg-white/5 rounded-[2rem] p-8 border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter">Current Administrators</h2>
            <p className="text-xs text-slate-500 font-medium">All wallets with admin or owner privileges on-chain.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">
                <th className="pb-4">Wallet Address</th>
                <th className="pb-4">Role</th>
                <th className="pb-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium">
              {ownerAddress && (
                <AdminBadge
                  addr={ownerAddress as string}
                  ownerAddress={ownerAddress as string}
                  onRevoke={(a) => setRemoveAdminAddress(a)}
                />
              )}
              {(allUsers as string[] || [])
                .filter(a => a.toLowerCase() !== (ownerAddress as string)?.toLowerCase())
                .map((addr) => (
                  <AdminBadge
                    key={addr}
                    addr={addr}
                    ownerAddress={ownerAddress as string || ''}
                    onRevoke={(a) => setRemoveAdminAddress(a)}
                  />
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
