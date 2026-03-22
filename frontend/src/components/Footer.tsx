'use client';

import Link from 'next/link';
import { ShieldCheck, Github, Twitter, Linkedin, Mail, ArrowRight, Globe } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';

export default function Footer() {
  const { theme } = useTheme();

  const footerLinks = {
    platform: [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Find Jobs', href: '/jobs' },
      { name: 'Create Job', href: '/jobs/create' },
      { name: 'Success Stories', href: '#' },
    ],
    resources: [
      { name: 'Documentation', href: '#' },
      { name: 'Smart Contracts', href: '#' },
      { name: 'Whitepaper', href: '#' },
      { name: 'FAQ', href: '#' },
    ],
    support: [
      { name: 'Help Center', href: '#' },
      { name: 'Contact Us', href: 'mailto:support@aethyl.io' },
      { name: 'Bug Bounty', href: '#' },
      { name: 'Status', href: '#' },
    ]
  };

  return (
    <footer className="w-full bg-white dark:!bg-[#000000] border-t border-black/5 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <span className="text-2xl font-extrabold tracking-tighter bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                FrethiX
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm font-medium leading-relaxed">
              The world's first truly decentralized freelance marketplace. 
              Secure escrow, instant payments, and zero middlemen — powered by blockchain.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="p-2.5 rounded-xl bg-white dark:!bg-[#000000] border border-black/5 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110 transition-all shadow-sm">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="p-2.5 rounded-xl bg-white dark:!bg-[#000000] border border-black/5 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:scale-110 transition-all shadow-sm">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="#" className="p-2.5 rounded-xl bg-white dark:!bg-[#000000] border border-black/5 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-500 hover:scale-110 transition-all shadow-sm">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="p-2.5 rounded-xl bg-white dark:!bg-[#000000] border border-black/5 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 hover:scale-110 transition-all shadow-sm">
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className={`font-black uppercase tracking-wider text-xs mb-6 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Platform</h4>
            <ul className="space-y-4">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={`font-black uppercase tracking-wider text-xs mb-6 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Resources</h4>
            <ul className="space-y-4">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={`font-black uppercase tracking-wider text-xs mb-6 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Support</h4>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 font-medium transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
            <span>© 2026 FrethiX. A product of</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">Aethyl</span>
          </div>
          
          <div className="flex gap-8 text-xs font-black uppercase tracking-widest text-slate-400">
            <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Cookie Policy</Link>
          </div>

          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
             <Globe className="w-4 h-4" />
             <span>English (US)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
