'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, Building2, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const [role, setRole] = useState<'client' | 'freelancer' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !email || !password) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      
      if (data.success) {
        await refreshAuth();
        if (role === 'freelancer') {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-mesh bg-grid">
      {/* Left pane - visual */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center relative overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-cyan-500/10" />
        <div className="relative z-10 text-center px-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 via-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(139,92,246,0.5)]">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold mb-4 text-zinc-900">
            Join <span className="gradient-text">FrethiX</span>
          </h1>
          <p className="text-zinc-600 text-lg">
            AI-powered matching meets trustless Web3 escrow. The future of work is here.
          </p>
        </div>
      </div>

      {/* Right pane - form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24">
        <div className="max-w-md w-full mx-auto">
          <Link href="/" className="inline-flex text-zinc-500 hover:text-zinc-900 text-sm mb-8 transition-colors">
            ← Back to Home
          </Link>

          <h2 className="text-3xl font-extrabold mb-2 text-zinc-900">Create an account</h2>
          <p className="text-zinc-600 mb-8">First, tell us how you want to use FrethiX.</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => setRole('client')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all duration-300 ${
                role === 'client'
                  ? 'bg-violet-500/10 border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.15)] glow-card'
                  : 'bg-white border-zinc-200 hover:border-violet-300 hover:bg-slate-50 glass'
              }`}
            >
              <Building2 className={`w-6 h-6 z-10 ${role === 'client' ? 'text-violet-600' : 'text-zinc-500'}`} />
              <span className={`text-sm font-semibold z-10 ${role === 'client' ? 'text-violet-900' : 'text-zinc-600'}`}>I want to Hire</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('freelancer')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all duration-300 ${
                role === 'freelancer'
                  ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.15)] glow-card'
                  : 'bg-white border-zinc-200 hover:border-cyan-300 hover:bg-slate-50 glass'
              }`}
            >
              <Briefcase className={`w-6 h-6 z-10 ${role === 'freelancer' ? 'text-cyan-600' : 'text-zinc-500'}`} />
              <span className={`text-sm font-semibold z-10 ${role === 'freelancer' ? 'text-cyan-900' : 'text-zinc-600'}`}>I want to Work</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-600 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-600 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

            <button
              type="submit"
              disabled={loading || !role || !email || !password}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-600 mt-8">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-violet-600 hover:text-violet-500 font-medium">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
