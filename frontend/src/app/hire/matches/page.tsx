'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Star, MapPin, Clock, CheckCircle, ArrowRight, Loader2, Users, ArrowLeft, Briefcase, TrendingUp } from 'lucide-react';

interface Freelancer {
  _id: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  skills: string[];
  rating: number;
  completedJobs: number;
  hourlyRate: number;
  availability: string;
  location: string;
  responseTime: string;
  successRate: number;
  matchScore: number;
}

function MatchScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none" />
        <circle
          cx="40" cy="40" r="36"
          stroke="url(#scoreGrad)"
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-extrabold text-zinc-900">{score}%</span>
      </div>
    </div>
  );
}

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [parsedJob, setParsedJob] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('frethix_parsed_job');
    if (!stored) {
      router.push('/hire');
      return;
    }
    const job = JSON.parse(stored);
    setParsedJob(job);
    fetchMatches(job);
  }, []);

  const fetchMatches = async (job: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: job.skills,
          budgetMin: job.budgetMin,
          budgetMax: job.budgetMax,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.matches.length === 0 && !seeding) {
          // Auto-seed and retry
          setSeeding(true);
          await fetch('/api/seed', { method: 'POST' });
          setSeeding(false);
          return fetchMatches(job);
        }
        setMatches(data.matches);
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (freelancer: Freelancer) => {
    sessionStorage.setItem('frethix_selected_freelancer', JSON.stringify(freelancer));
    router.push('/hire/scope');
  };

  return (
    <div className="min-h-screen bg-mesh bg-grid">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => router.back()} className="btn-ghost p-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-400 text-xs font-medium mb-2">
              <Users className="w-3 h-3" />
              AI Matching Engine
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Top <span className="gradient-text">Matches</span> for You
            </h1>
          </div>
        </div>

        {parsedJob && (
          <p className="text-zinc-600 mb-10 ml-13">
            Showing best matches for <span className="text-zinc-900 font-semibold">{parsedJob.title}</span>
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-4" />
            <p className="text-zinc-600 font-medium">
              {seeding ? 'Setting up freelancer database...' : 'AI is matching freelancers...'}
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && matches.length > 0 && (
          <div className="space-y-4">
            {matches.map((f, i) => (
              <div key={f._id} className="glow-card flex flex-col sm:flex-row items-start sm:items-center gap-6 group">
                {/* Rank badge */}
                <div className="hidden sm:flex flex-col items-center gap-1">
                  <span className={`text-xs font-bold uppercase tracking-wider ${i === 0 ? 'text-cyan-400' : i === 1 ? 'text-violet-400' : 'text-zinc-500'}`}>
                    #{i + 1}
                  </span>
                </div>

                {/* Score Ring */}
                <MatchScoreRing score={f.matchScore} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <img
                      src={f.avatar}
                      alt={f.name}
                      className="w-10 h-10 rounded-full border-2 border-zinc-200"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900">{f.name}</h3>
                      <p className="text-sm text-zinc-600">{f.title}</p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mt-3 mb-3">
                    {f.skills.slice(0, 5).map((s, si) => (
                      <span key={si} className="skill-tag text-xs">{s}</span>
                    ))}
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400" />
                      {f.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {f.completedJobs} jobs
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {f.successRate}% success
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {f.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {f.responseTime}
                    </span>
                  </div>
                </div>

                {/* Rate & Select */}
                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xl font-bold text-zinc-900">${f.hourlyRate}</p>
                    <p className="text-xs text-zinc-500">per hour</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {f.availability === 'available' && <span className="pulse-dot" />}
                    <span className={`text-xs font-medium ${f.availability === 'available' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {f.availability === 'available' ? 'Available' : 'Busy'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleSelect(f)}
                    className="btn-primary flex items-center gap-1.5 text-sm px-4 py-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && matches.length === 0 && (
          <div className="text-center py-32 glass-card">
            <p className="text-zinc-600 mb-4">No matches found. Try adjusting your project description.</p>
            <button onClick={() => router.push('/hire')} className="btn-secondary">
              Back to Input
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
