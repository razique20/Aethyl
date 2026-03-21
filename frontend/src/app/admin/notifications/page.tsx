'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants';
import { Send, Loader2, BellRing } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminNotifications() {
  const [targetUser, setTargetUser] = useState('');
  const [message, setMessage] = useState('');
  const [notifType, setNotifType] = useState('INFO');

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      setTargetUser('');
      setMessage('');
    }
  }, [isSuccess]);

  const handleSend = (e: React.FormEvent) => {
      e.preventDefault();
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'adminSendNotification',
        args: [targetUser as `0x${string}`, message, notifType],
      });
  };

  return (
    <div className="p-10">
      <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter">Broadcast Center</h1>
      <p className="text-slate-500 dark:text-slate-400 font-medium mb-10">Push direct on-chain notifications to specific wallets.</p>

      {/* Broadcast Form */}
      <div className="bg-white dark:bg-white/5 rounded-[2rem] p-8 border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none mb-12 max-w-2xl">
        <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter flex items-center gap-3">
            <BellRing className="w-6 h-6 text-yellow-500" /> Issue Alert
        </h2>
        
        <form onSubmit={handleSend} className="space-y-4">
           <input 
              type="text" 
              placeholder="Target Wallet Address (0x...)" 
              value={targetUser}
              required
              onChange={(e) => setTargetUser(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-black dark:text-white focus:outline-none focus:border-yellow-500"
           />
           <div className="flex gap-4">
             <select 
               className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 font-bold text-sm text-black dark:text-white focus:outline-none focus:border-yellow-500"
               value={notifType}
               onChange={(e) => setNotifType(e.target.value)}
             >
               <option value="INFO">INFO</option>
               <option value="WARNING">WARNING</option>
               <option value="SUCCESS">SUCCESS</option>
             </select>
           </div>
           <textarea 
              placeholder="Notification Message" 
              value={message}
              required
              rows={4}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-black dark:text-white focus:outline-none focus:border-yellow-500 resize-none"
           />
           <button 
             type="submit"
             disabled={isPending || isConfirming}
             className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-yellow-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
           >
             {isPending || isConfirming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
             Send Broadcast
           </button>
        </form>
      </div>
    </div>
  );
}
