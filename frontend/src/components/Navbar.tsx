'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Brain, LayoutDashboard, Shield, Sparkles, Menu, X, LogOut, LogIn } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, loading } = useAuth();

  const NAV_LINKS = [
    { href: '/hire', label: 'AI Hire', icon: Sparkles, requireClient: true },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/profile', label: 'Profile', icon: Brain },
    { href: '/admin', label: 'Admin', icon: Shield },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full px-6 py-4 glass border-b border-zinc-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="text-2xl font-extrabold tracking-tight">
            <span className="text-zinc-900">Freth</span>
            <span className="gradient-text">iX</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon, requireClient }) => {
            // Hide "AI Hire" for freelancers to keep UX clean
            if (requireClient && user?.role === 'freelancer') return null;
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-all duration-300"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {!loading && !user && (
            <Link href="/auth/login" className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          )}

          {!loading && user && (
            <button onClick={logout} className="btn-ghost text-sm px-4 py-2 flex items-center gap-2 text-red-400 hover:bg-red-500/10">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          )}

          {/* Show Connect Wallet if logged in */}
          {!loading && user && (
            <ConnectButton
              accountStatus="address"
              showBalance={false}
            />
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-zinc-200 space-y-1">
          {NAV_LINKS.map(({ href, label, icon: Icon, requireClient }) => {
            if (requireClient && user?.role === 'freelancer') return null;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
          
          {!loading && !user && (
            <Link href="/auth/login" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-all">
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
