'use client';

import { useAccount, useReadContract } from 'wagmi';
import {CONTRACT_ABI , CONTRACT_ADDRESS } from '@/constants';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, FileText, Bell, LogOut, Loader2, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();

  const { data: ownerAddress, isLoading: ownerLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  });

  const { data: isAdminInMapping, isLoading: adminLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'admins',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const isLoading = ownerLoading || adminLoading;
  const isOwner = isConnected && address && ownerAddress &&
    address.toLowerCase() === (ownerAddress as string).toLowerCase();
  const hasAdminAccess = isOwner || !!isAdminInMapping;

  useEffect(() => {
    if (!isLoading && !hasAdminAccess) {
      router.push('/');
    }
  }, [isLoading, hasAdminAccess, router, address]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!hasAdminAccess) return null;

  const links = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users & Jobs', href: '/admin/users', icon: Users },
    { name: 'Admin Management', href: '/admin/admins', icon: ShieldCheck },
    { name: 'Blogs & Content', href: '/admin/blogs', icon: FileText },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-mesh flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#020617] border-r border-slate-200 dark:border-white/10 flex flex-col h-screen sticky top-0">
        <div className="p-8">
          <Link href="/" className="text-2xl font-extrabold tracking-tighter bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            FrethiX Admin
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-white/10">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-red-500 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors">
            <LogOut className="w-5 h-5" />
            Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
