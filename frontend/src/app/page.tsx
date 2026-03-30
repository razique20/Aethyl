'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Sparkles, ArrowRight, Shield, Zap, Users, Brain, Wallet, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const STATS = [
  { label: 'Jobs Processed', value: '2,400+' },
  { label: 'Avg Match Time', value: '< 3s' },
  { label: 'Total Escrowed', value: '$1.2M' },
  { label: 'Success Rate', value: '98.5%' },
];

const STEPS = [
  {
    icon: Brain,
    title: 'Describe Your Project',
    desc: 'Tell our AI what you need in plain English. It extracts skills, budget, timeline, and deliverables automatically.',
    color: 'from-cyan-500 to-cyan-600',
    glow: 'rgba(6, 182, 212, 0.3)',
  },
  {
    icon: Users,
    title: 'AI Matches You Instantly',
    desc: 'Our engine scores freelancers by skill fit, rating, availability, and budget — top 5 matches in under 3 seconds.',
    color: 'from-violet-500 to-violet-600',
    glow: 'rgba(139, 92, 246, 0.3)',
  },
  {
    icon: Wallet,
    title: 'Escrow Secures Payment',
    desc: 'Funds are locked in a smart contract. Milestone-based releases ensure freelancers get paid and clients stay protected.',
    color: 'from-fuchsia-500 to-fuchsia-600',
    glow: 'rgba(217, 70, 239, 0.3)',
  },
];

const FEATURES = [
  { icon: Shield, title: 'Trustless Escrow', desc: 'Smart contracts lock funds until work is approved. No middleman.' },
  { icon: Zap, title: 'Instant Matching', desc: 'AI scores and ranks freelancers in real-time. No more browsing.' },
  { icon: CheckCircle, title: 'Milestone Tracking', desc: 'Break projects into milestones with automatic payment releases.' },
  { icon: Sparkles, title: 'AI Assistant', desc: 'Refines job descriptions, suggests milestones, and tracks progress.' },
];

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={`absolute w-1 h-1 rounded-full bg-violet-500/30 ${i % 3 === 0 ? 'animate-float' : i % 3 === 1 ? 'animate-float-delayed' : 'animate-float-slow'}`}
          style={{
            left: `${15 + i * 15}%`,
            top: `${10 + (i % 3) * 30}%`,
            width: `${2 + i}px`,
            height: `${2 + i}px`,
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-mesh bg-grid relative">
      <Navbar />
      <FloatingParticles />

      <main className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Hero Section */}
        <section className="pt-24 pb-32 text-center relative">
          {/* Glow orb */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className={`transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-600 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Powered by AI + Blockchain
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-6 leading-[0.9]">
              <span className="text-zinc-900">AI that hires &</span>
              <br />
              <span className="gradient-text">pays automatically</span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-600 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              Describe your project. Our AI finds the perfect freelancer, structures milestones,
              and locks payment in a smart contract escrow — all in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/hire" className="btn-primary flex items-center gap-2.5 text-lg px-8 py-4 group">
                <Sparkles className="w-5 h-5" />
                Start Hiring with AI
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/dashboard" className="btn-secondary text-lg px-8 py-4">
                View Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="pb-20">
          <div className="glass rounded-2xl p-1">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px">
              {STATS.map((stat, i) => (
                <div key={i} className="text-center py-6 px-4">
                  <div className="text-2xl md:text-3xl font-extrabold gradient-text mb-1">{stat.value}</div>
                  <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="pb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              How <span className="gradient-text">FrethiX</span> Works
            </h2>
            <p className="text-zinc-600 text-lg max-w-xl mx-auto">Three steps. Zero friction. Fully automated.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div key={i} className="glow-card relative group">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}
                    style={{ boxShadow: `0 4px 15px -3px ${step.glow}` }}
                  >
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-bold text-zinc-600">Step {i + 1}</span>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-3">{step.title}</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="pb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Built for the <span className="gradient-text-alt">Modern Workforce</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <div key={i} className="glass-card flex gap-5">
                <div className="w-11 h-11 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0 border border-violet-500/20">
                  <feature.icon className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-1.5">{feature.title}</h3>
                  <p className="text-zinc-600 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="pb-20">
          <div className="glow-card text-center py-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-cyan-500/5" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                Ready to hire <span className="gradient-text">smarter</span>?
              </h2>
              <p className="text-zinc-600 max-w-lg mx-auto mb-8">
                Just describe what you need. FrethiX handles the rest — matching, milestones, and secure payments.
              </p>
              <Link href="/hire" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4 group">
                <Sparkles className="w-5 h-5" />
                Start Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-200 py-8 text-center">
          <p className="text-zinc-600 text-sm">
            © 2026 <span className="gradient-text font-semibold">FrethiX</span> by Aethyl — AI-Powered Hiring on Blockchain
          </p>
        </footer>
      </main>
    </div>
  );
}
