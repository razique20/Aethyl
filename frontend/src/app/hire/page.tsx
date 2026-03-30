'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Sparkles, ArrowRight, Loader2, Brain, Tag, DollarSign, Clock, Package, Wand2 } from 'lucide-react';

interface ParsedJob {
  title: string;
  description: string;
  category: string;
  skills: string[];
  budgetMin: number;
  budgetMax: number;
  timeline: string;
  deliverables: string[];
}

const PLACEHOLDER = `Example: "I need a React developer to build a modern SaaS dashboard with user authentication, Stripe payment integration, and responsive charts. Budget around $4,000, should be done in 3 weeks."`;

export default function HirePage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<ParsedJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!input.trim() || input.trim().length < 10) {
      setError('Please describe your project in more detail (at least 10 characters).');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/parse-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json();
      if (data.success) {
        setParsed(data.parsed);
      } else {
        setError(data.error || 'Failed to analyze.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFindMatches = () => {
    if (!parsed) return;
    // Store parsed job in sessionStorage for the next page
    sessionStorage.setItem('frethix_parsed_job', JSON.stringify(parsed));
    sessionStorage.setItem('frethix_raw_input', input);
    router.push('/hire/matches');
  };

  return (
    <div className="min-h-screen bg-mesh bg-grid">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-sm font-medium mb-6">
            <Brain className="w-4 h-4" />
            AI Job Analyzer
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Describe what you <span className="gradient-text">need</span>
          </h1>
          <p className="text-zinc-600 text-lg max-w-xl mx-auto">
            Tell us about your project in plain English. Our AI will structure everything for you.
          </p>
        </div>

        {/* Input Area */}
        <div className="glow-card mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Wand2 className="w-5 h-5 text-violet-400" />
            <span className="text-sm font-semibold text-zinc-500">Your Project Brief</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={PLACEHOLDER}
            rows={6}
            className="input-field resize-none text-base leading-relaxed"
          />
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleAnalyze}
              disabled={loading || !input.trim()}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze with AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Parsed Output */}
        {parsed && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-2">
              <div className="pulse-dot" />
              <span className="text-sm font-semibold text-emerald-500">AI Analysis Complete</span>
            </div>

            {/* Title & Category */}
            <div className="glow-card">
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">{parsed.title}</h2>
              <span className="skill-tag">{parsed.category}</span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Skills */}
              <div className="glass-card">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-semibold text-zinc-500">Detected Skills</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {parsed.skills.map((skill, i) => (
                    <span key={i} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="glass-card">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-zinc-500">Estimated Budget</span>
                </div>
                <p className="text-2xl font-bold text-zinc-900">
                  ${parsed.budgetMin.toLocaleString()} — ${parsed.budgetMax.toLocaleString()}
                </p>
              </div>

              {/* Timeline */}
              <div className="glass-card">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-cyan-500" />
                  <span className="text-sm font-semibold text-zinc-500">Timeline</span>
                </div>
                <p className="text-2xl font-bold text-zinc-900">{parsed.timeline}</p>
              </div>

              {/* Deliverables */}
              <div className="glass-card">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-fuchsia-500" />
                  <span className="text-sm font-semibold text-zinc-500">Deliverables</span>
                </div>
                <ul className="space-y-1.5">
                  {parsed.deliverables.map((d, i) => (
                    <li key={i} className="text-sm text-zinc-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTA */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleFindMatches}
                className="btn-primary flex items-center gap-2 text-lg px-8 py-4 group"
              >
                Find Matching Freelancers
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
