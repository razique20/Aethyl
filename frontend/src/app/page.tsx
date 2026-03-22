'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ShieldCheck, Zap, Globe, ArrowRight, PlusCircle, Send, Wallet, CheckCircle, Trophy } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import BlogSection from '@/components/BlogSection';

export default function Home() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-12">
        {/* Hero Section */}
        <section className="text-center mb-24">
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">
            <span className={`${theme === 'light' ? 'text-black' : 'text-white'} drop-shadow-sm`}>
              The Future of
            </span> <br />
            <span className="bg-gradient-to-r from-blue-700 via-purple-700 to-pink-600 dark:from-blue-400 dark:via-purple-500 dark:to-pink-500 bg-clip-text text-transparent filter drop-shadow-md">
              Freelancing is Here
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 font-medium">
            Secure, transparent, and decentralized. FrethiX (powered by Aethyl) uses blockchain escrow 
            smart contracts to ensure you get paid for every milestone.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/jobs/create" className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
              Post a Job <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/dashboard" className="btn-secondary text-lg px-8 py-4">
              Go to Dashboard
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
          <div className="glass-card">
            <div className="w-14 h-14 bg-blue-600/10 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-600/5 dark:border-blue-400/10">
              <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Escrow Security</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Funds are held in a smart contract and only released when the client 
              approves the completed work.
            </p>
          </div>

          <div className="glass-card">
            <div className="w-14 h-14 bg-purple-600/10 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 border border-purple-600/5 dark:border-purple-400/10">
              <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Instant Payments</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              No more waiting weeks for wire transfers. Payments are settled in 
              ETH instantly upon approval.
            </p>
          </div>

          <div className="glass-card">
            <div className="w-14 h-14 bg-pink-600/10 dark:bg-pink-500/20 rounded-2xl flex items-center justify-center mb-6 border border-pink-600/5 dark:border-pink-400/10">
              <Globe className="w-8 h-8 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No Middlemen</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Direct peer-to-peer interaction. Lower fees and total transparency 
              for both clients and freelancers.
            </p>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-40 relative">
          <div className="text-center mb-24">
            <h2 className={`text-5xl md:text-6xl font-black mb-6 ${theme === 'light' ? '!text-black' : 'text-white'}`}>
              How It Works
            </h2>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">A seamless, high-trust workflow powered by blockchain smart contracts.</p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Shared SVG defs (hidden) */}
            <svg width="0" height="0" className="absolute">
              <defs>
                <marker id="arr-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                </marker>
                <marker id="arr-purple" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6" />
                </marker>
                <marker id="arr-pink" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#ec4899" />
                </marker>
              </defs>
            </svg>

            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-12 group">
              <div className="flex-1 text-right hidden md:block group-hover:-translate-x-4 transition-transform duration-500">
                <h3 className={`text-3xl font-black mb-4 ${theme === 'light' ? '!text-black' : 'text-white'}`}>Post Your Vision</h3>
                <p className="text-slate-500 text-lg leading-relaxed font-medium">
                  Define milestones, deliverables, and budget. Your project is minted directly to the decentralized marketplace.
                </p>
              </div>
              <div className="relative">
                <div className="w-24 h-24 bg-blue-600/10 dark:bg-blue-500/20 rounded-full flex items-center justify-center border-4 border-blue-600/30 group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-500 z-10 bg-mesh shadow-2xl">
                  <PlusCircle className="w-10 h-10 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
                </div>
                <span className="absolute -top-4 -left-4 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-lg shadow-xl">1</span>
              </div>
              <div className="flex-1 text-left md:hidden">
                <h3 className={`text-2xl font-black mb-3 ${theme === 'light' ? '!text-black' : 'text-white'}`}>Post Your Vision</h3>
                <p className="text-slate-500 font-medium">Define milestones and budget. Your project is on-chain instantly.</p>
              </div>
              <div className="flex-1 md:block hidden" />
            </div>

            {/* Arrow 1→2: gentle rightward arc, center to center */}
            <div className="hidden md:flex justify-center my-2" aria-hidden="true">
              <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
                <path d="M 60 0 C 110 0, 110 80, 60 80" stroke="#8b5cf6" strokeWidth="2.5" strokeDasharray="6 5" markerEnd="url(#arr-blue)" />
              </svg>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 group">
              <div className="flex-1 text-left hidden md:block group-hover:translate-x-4 transition-transform duration-500">
                <h3 className={`text-3xl font-black mb-4 ${theme === 'light' ? '!text-black' : 'text-white'}`}>Review Talent</h3>
                <p className="text-slate-500 text-lg leading-relaxed font-medium">
                  Freelancers submit cryptographic proofs of their work. Review quotes and verified histories side-by-side.
                </p>
              </div>
              <div className="relative">
                <div className="w-24 h-24 bg-purple-600/10 dark:bg-purple-500/20 rounded-full flex items-center justify-center border-4 border-purple-600/30 group-hover:scale-110 group-hover:bg-purple-600 transition-all duration-500 z-10 bg-mesh shadow-2xl">
                  <Send className="w-10 h-10 text-purple-600 dark:text-purple-400 group-hover:text-white transition-colors" />
                </div>
                <span className="absolute -top-4 -right-4 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-black text-lg shadow-xl">2</span>
              </div>
              <div className="flex-1 text-left md:hidden">
                <h3 className={`text-2xl font-black mb-3 ${theme === 'light' ? '!text-black' : 'text-white'}`}>Review Talent</h3>
                <p className="text-slate-500 font-medium">Review verified work proofs and competitive on-chain quotes.</p>
              </div>
              <div className="flex-1 md:block hidden" />
            </div>

            {/* Arrow 2→3: gentle leftward arc, center to center */}
            <div className="hidden md:flex justify-center my-2" aria-hidden="true">
              <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
                <path d="M 60 0 C 10 0, 10 80, 60 80" stroke="#ec4899" strokeWidth="2.5" strokeDasharray="6 5" markerEnd="url(#arr-purple)" />
              </svg>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-12 group">
              <div className="flex-1 text-right hidden md:block group-hover:-translate-x-4 transition-transform duration-500">
                <h3 className={`text-3xl font-black mb-4 ${theme === 'light' ? '!text-black' : 'text-white'}`}>Secure Escrow</h3>
                <p className="text-slate-500 text-lg leading-relaxed font-medium">
                  Fund the smart contract once and enjoy total peace of mind. Your funds stay locked until work is delivered.
                </p>
              </div>
              <div className="relative">
                <div className="w-24 h-24 bg-pink-600/10 dark:bg-pink-500/20 rounded-full flex items-center justify-center border-4 border-pink-600/30 group-hover:scale-110 group-hover:bg-pink-600 transition-all duration-500 z-10 bg-mesh shadow-2xl">
                  <Wallet className="w-10 h-10 text-pink-600 dark:text-pink-400 group-hover:text-white transition-colors" />
                </div>
                <span className="absolute -top-4 -left-4 w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center font-black text-lg shadow-xl">3</span>
              </div>
              <div className="flex-1 text-left md:hidden">
                <h3 className={`text-2xl font-black mb-3 ${theme === 'light' ? '!text-black' : 'text-white'}`}>Secure Escrow</h3>
                <p className="text-slate-500 font-medium">Fund the contract once. Your capital is protected by Ethereum.</p>
              </div>
              <div className="flex-1 md:block hidden" />
            </div>

            {/* Arrow 3→4: gentle rightward arc, center to center */}
            <div className="hidden md:flex justify-center my-2" aria-hidden="true">
              <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
                <path d="M 60 0 C 110 0, 110 80, 60 80" stroke="#22c55e" strokeWidth="2.5" strokeDasharray="6 5" markerEnd="url(#arr-pink)" />
              </svg>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 group">
              <div className="flex-1 text-left hidden md:block group-hover:translate-x-4 transition-transform duration-500">
                <h3 className={`text-3xl font-black mb-4 ${theme === 'light' ? '!text-black' : 'text-white'}`}>Success Delivered</h3>
                <p className="text-slate-500 text-lg leading-relaxed font-medium">
                  Upon milestone approval, the contract releases payment instantly to the freelancer. No middleman needed.
                </p>
              </div>
              <div className="relative">
                <div className="w-24 h-24 bg-green-600/10 dark:bg-green-500/20 rounded-full flex items-center justify-center border-4 border-green-600/30 group-hover:scale-110 group-hover:bg-green-600 transition-all duration-500 z-10 bg-mesh shadow-2xl">
                  <Trophy className="w-10 h-10 text-green-600 dark:text-green-400 group-hover:text-white transition-colors" />
                </div>
                <span className="absolute -top-4 -right-4 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-black text-lg shadow-xl">4</span>
              </div>
              <div className="flex-1 text-left md:hidden">
                <h3 className={`text-2xl font-black mb-3 ${theme === 'light' ? '!text-black' : 'text-white'}`}>Success Delivered</h3>
                <p className="text-slate-500 font-medium">Funds release instantly upon approval. Decentralized trust in action.</p>
              </div>
              <div className="flex-1 md:block hidden" />
            </div>
          </div>

          <div className="mt-32 text-center">
            <Link href="/jobs/create" className="btn-primary inline-flex items-center gap-4 px-12 py-6 text-2xl font-black group">
              Kickstart Your Journey <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </section>
        {/* Blogs Section */}
        <BlogSection />
      </main>
    </div>
  );
}
