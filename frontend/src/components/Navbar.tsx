'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ShieldCheck, Sun, Moon, Bell, Gavel } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants';
import { useState } from 'react';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { address } = useAccount();
  const [showNotif, setShowNotif] = useState(false);
  const [liveAlerts, setLiveAlerts] = useState<any[]>([]);

  // Fetch specific user notifications (Warnings, Success, etc sent by Admin)
  const { data: notifications } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getNotifications',
    args: address ? [address] : undefined,
    query: {
       enabled: !!address,
    }
  });

  // Listen globally to New Jobs being created on the platform
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: 'JobCreated',
    onLogs(logs) {
      logs.forEach((log: any) => {
        // Prevent notifying the user about their own created job
        if (log.args.client !== address) {
            const newAlert = {
              message: `New Escrow Job Posted: "${log.args.title}"`,
              notifType: 'NEW JOB',
              timestamp: Math.floor(Date.now() / 1000)
            };
            
            // Add live alert and flash the notification box if viewing
            setLiveAlerts(prev => {
              const exists = prev.find(a => a.message === newAlert.message);
              return exists ? prev : [newAlert, ...prev];
            });
        }
      });
    },
  });

  // Merge live blockchain events with personal static notifications
  const allNotifs = [...liveAlerts, ...((notifications as any[]) || [])].sort(
     (a, b) => Number(b.timestamp) - Number(a.timestamp)
  );

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-black/5 dark:border-white/5 px-6 py-4 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="text-2xl font-extrabold tracking-tighter bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            FrethiX
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-10 font-black">
          <Link href="/dashboard" className={`${theme === 'light' ? 'text-black' : 'text-white'} text-xs uppercase tracking-widest hover:text-blue-600 transition-colors`}>Marketplace</Link>
          <Link href="/my-jobs" className={`${theme === 'light' ? 'text-black' : 'text-white'} text-xs uppercase tracking-widest hover:text-blue-600 transition-colors`}>My Jobs</Link>
          <Link href="/my-payments" className={`${theme === 'light' ? 'text-black' : 'text-white'} text-xs uppercase tracking-widest hover:text-blue-600 transition-colors`}>Payments</Link>
          <Link href="/courthouse" className={`${theme === 'light' ? 'text-black' : 'text-white'} text-xs uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-1`}>
            <Gavel className="w-3 h-3" /> Courthouse
          </Link>
          <Link href="/blogs" className={`${theme === 'light' ? 'text-black' : 'text-white'} text-xs uppercase tracking-widest hover:text-blue-600 transition-colors`}>Blogs</Link>
          <Link href="/profile" className={`${theme === 'light' ? 'text-black' : 'text-white'} text-xs uppercase tracking-widest hover:text-blue-600 transition-colors`}>Profile</Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Global Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotif(!showNotif)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-black/5 dark:border-white/5 shadow-sm relative"
            >
              <Bell className="w-5 h-5" />
              {allNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-[#020617]"></span>
              )}
            </button>

            {showNotif && (
               <div className="absolute right-0 mt-4 w-80 bg-white dark:bg-[#020617] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-4 z-[60] max-h-96 overflow-y-auto">
                  <h3 className="font-black mb-4 pb-2 border-b border-slate-100 dark:border-white/10 text-black dark:text-white uppercase text-xs tracking-widest">Inbox</h3>
                  {!allNotifs.length ? (
                     <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center py-4 font-bold uppercase">Clear skies! No alerts.</p>
                  ) : (
                     <div className="space-y-3">
                        {[...allNotifs].reverse().map((n: any, idx: number) => (
                           <div key={idx} className={`p-3 rounded-xl border transition-all ${n.notifType === 'WARNING' ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20' : n.notifType === 'SUCCESS' ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5'}`}>
                              <p className={`text-[9px] font-black mb-1 opacity-70 uppercase tracking-widest ${n.notifType === 'WARNING' ? 'text-orange-600' : n.notifType === 'SUCCESS' ? 'text-green-600' : 'text-blue-600'}`}>{n.notifType}</p>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{n.message}</p>
                              <p className="text-[8px] text-slate-400 mt-2 font-mono">{new Date(Number(n.timestamp)*1000).toLocaleDateString()}</p>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            )}
          </div>

          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-black/5 dark:border-white/5 shadow-sm"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <ConnectButton 
            accountStatus="address"
            showBalance={false}
          />
        </div>
      </div>
    </nav>
  );
}
