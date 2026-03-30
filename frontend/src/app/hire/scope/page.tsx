'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAccount } from 'wagmi';
import {
  ArrowLeft, CheckCircle, Loader2, Star, Calendar, DollarSign,
  Milestone, ArrowRight, Sparkles, Send
} from 'lucide-react';

interface MilestoneItem {
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: string;
}

interface Scope {
  title: string;
  description: string;
  freelancer: {
    id: string;
    name: string;
    title: string;
    avatar: string;
    rating: number;
  };
  milestones: MilestoneItem[];
  totalCost: number;
  timeline: string;
  startDate: string;
  endDate: string;
}

export default function ScopePage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [scope, setScope] = useState<Scope | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [jobCreatedId, setJobCreatedId] = useState<string | null>(null);

  useEffect(() => {
    generateScope();
  }, []);

  const generateScope = async () => {
    const parsedJob = sessionStorage.getItem('frethix_parsed_job');
    const freelancer = sessionStorage.getItem('frethix_selected_freelancer');

    if (!parsedJob || !freelancer) {
      router.push('/hire');
      return;
    }

    try {
      const res = await fetch('/api/ai/generate-scope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parsedJob: JSON.parse(parsedJob),
          freelancer: JSON.parse(freelancer),
        }),
      });
      const data = await res.json();
      if (data.success) setScope(data.scope);
    } catch (err) {
      console.error('Error generating scope:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMilestone = (index: number, field: string, value: any) => {
    if (!scope) return;
    const updatedMilestones = [...scope.milestones];
    updatedMilestones[index] = { ...updatedMilestones[index], [field]: value };
    const newTotal = updatedMilestones.reduce((acc, m) => acc + Number(m.amount), 0);
    setScope({ ...scope, milestones: updatedMilestones, totalCost: newTotal });
  };

  const handleRequestQuote = async () => {
    if (!scope || !isConnected || !address) return alert("Please connect wallet first");

    try {
      setSaving(true);
      const rawInput = sessionStorage.getItem('frethix_raw_input') || '';
      const parsedJob = JSON.parse(sessionStorage.getItem('frethix_parsed_job') || '{}');

      const jobRes = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: scope.title,
          description: scope.description,
          rawInput,
          category: parsedJob.category,
          skills: parsedJob.skills,
          budgetMin: parsedJob.budgetMin,
          budgetMax: parsedJob.budgetMax,
          timeline: parsedJob.timeline,
          deliverables: parsedJob.deliverables,
          milestones: scope.milestones,
          selectedFreelancer: scope.freelancer.id,
          clientAddress: address,
          escrowAmount: scope.milestones.reduce((acc, m) => acc + Number(m.amount), 0),
          status: 'scoped',
          quotingStatus: 'pending_quote',
          paymentType: 'fixed_price'
        }),
      });
      const jobData = await jobRes.json();
      setSaving(false);

      if (jobData.success) {
        setJobCreatedId(jobData.job._id);
        setTimeout(() => {
          router.push(`/dashboard/negotiate/${jobData.job._id}`);
        }, 1500);
      }
    } catch (err) {
      console.error('Save error:', err);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh bg-grid">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-4" />
          <p className="text-zinc-600">Generating project scope & milestones...</p>
        </div>
      </div>
    );
  }

  if (!scope) {
    return (
      <div className="min-h-screen bg-mesh bg-grid">
        <Navbar />
        <div className="text-center py-32">
          <p className="text-zinc-600 mb-4">Could not generate scope. Please try again.</p>
          <button onClick={() => router.push('/hire')} className="btn-primary">Start Over</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh bg-grid">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="btn-ghost p-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-medium mb-2">
              <Sparkles className="w-3 h-3" />
              Project Scope Ready
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Review & <span className="gradient-text">Request Quote</span>
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Milestones */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Title */}
            <div className="glow-card">
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">{scope.title}</h2>
              <div className="flex items-center gap-4 text-sm text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {scope.timeline}
                </span>
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  ${scope.totalCost.toLocaleString()} total
                </span>
              </div>
            </div>

            {/* Milestones */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <Milestone className="w-5 h-5 text-violet-500" />
                Milestones
              </h3>
              {scope.milestones.map((m, i) => (
                <div key={i} className="glass-card bg-slate-50 border-zinc-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 border border-violet-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-violet-600">{i + 1}</span>
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={m.title}
                          onChange={(e) => handleUpdateMilestone(i, 'title', e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-sm font-semibold text-zinc-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                          placeholder="Milestone Title"
                        />
                        <textarea
                          value={m.description}
                          onChange={(e) => handleUpdateMilestone(i, 'description', e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-sm text-zinc-600 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all resize-none h-16"
                          placeholder="Detailed description of deliverables..."
                        />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 w-32">
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          value={m.amount}
                          onChange={(e) => handleUpdateMilestone(i, 'amount', Number(e.target.value))}
                          className="w-full bg-white border border-zinc-200 rounded-md pl-8 pr-3 py-2 text-lg font-bold text-zinc-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">payment</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Freelancer & Deploy */}
          <div className="space-y-6">
            {/* Selected Freelancer */}
            <div className="glow-card">
              <h3 className="text-sm font-semibold text-zinc-500 mb-4 uppercase tracking-wider">Selected Freelancer</h3>
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={scope.freelancer.avatar}
                  alt={scope.freelancer.name}
                  className="w-12 h-12 rounded-full border-2 border-violet-200"
                />
                <div>
                  <h4 className="font-bold text-zinc-900">{scope.freelancer.name}</h4>
                  <p className="text-sm text-zinc-600">{scope.freelancer.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Star className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-zinc-900">{scope.freelancer.rating}</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="glow-card">
              <div className="flex items-center gap-2 mb-4">
                <Send className="w-5 h-5 text-violet-500" />
                <h3 className="text-sm font-semibold text-zinc-600">Send Request</h3>
              </div>

              {!isConnected ? (
                <div className="text-sm text-amber-500 mb-4">Please connect your wallet array to proceed.</div>
              ) : jobCreatedId ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                  <p className="text-emerald-400 font-semibold mb-1">Quote Requested!</p>
                  <p className="text-xs text-zinc-500 mb-4">Redirecting to negotiation space...</p>
                </div>
              ) : (
                <button
                  onClick={handleRequestQuote}
                  disabled={saving}
                  className="btn-primary flex items-center justify-center gap-2 w-full"
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    <>Request Quote <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
