'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { ArrowLeft, Loader2, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useAccount, useSignMessage } from 'wagmi';

export default function NegotiatePage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Freelancer Quote Form State
  const [paymentType, setPaymentType] = useState<'fixed_price' | 'hourly'>('fixed_price');
  const [hourlyRate, setHourlyRate] = useState(0);
  const [estimatedHours, setEstimatedHours] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [milestones, setMilestones] = useState<any[]>([]);

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      const data = await res.json();
      if (data.success) {
        setJob(data.job);
        if (data.job.freelancerQuote) {
          setPaymentType(data.job.paymentType || 'fixed_price');
          setHourlyRate(data.job.freelancerQuote.hourlyRate || 0);
          setEstimatedHours(data.job.freelancerQuote.estimatedHours || 0);
          setTotalPrice(data.job.freelancerQuote.totalPrice || 0);
          setMilestones(data.job.freelancerQuote.milestones || []);
        } else {
          setMilestones(data.job.milestones || []);
          setTotalPrice(data.job.milestones?.reduce((acc: number, m: any) => acc + (m.amount || 0), 0) || 0);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMilestone = (index: number, field: string, value: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
    if (paymentType === 'fixed_price' && field === 'amount') {
      const newTotal = updated.reduce((sum, m) => sum + Number(m.amount || 0), 0);
      setTotalPrice(newTotal);
    }
  };

  const handleSubmitQuote = async () => {
    if (!user || user.role !== 'freelancer') return;
    setSaving(true);
    
    // Auto-derive total price for hourly
    const quoteTotal = paymentType === 'hourly' ? hourlyRate * estimatedHours : totalPrice;

    const payload = {
      paymentType,
      quotingStatus: 'negotiating',
      freelancerQuote: {
        totalPrice: quoteTotal,
        hourlyRate,
        estimatedHours,
        milestones
      }
    };

    try {
      await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await fetchJob();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAcceptQuote = async () => {
    if (!user || user.role !== 'client') return;
    setSaving(true);
    try {
      await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quotingStatus: 'agreed' })
      });
      await fetchJob();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeclineQuote = async () => {
    if (!user || user.role !== 'client') return;
    setSaving(true);
    try {
      await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quotingStatus: 'declined', status: 'completed' })
      });
      router.push('/hire/matches');
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  const handleSignAgreement = async () => {
    if (!address) return alert('Please connect your wallet first.');
    setSaving(true);
    try {
      const message = `I agree to the terms of the FrethiX Employment Contract for Job: ${job.title}. Total Amount: $${paymentType === 'hourly' ? hourlyRate * estimatedHours : totalPrice}`;
      const signature = await signMessageAsync({ message });
      
      const updateField = user?.role === 'client' ? 'clientSignature' : 'freelancerSignature';
      const payload = { [updateField]: signature };
      
      // If the other party already signed, transition to dual_signed
      if ((user?.role === 'client' && job.freelancerSignature) || (user?.role === 'freelancer' && job.clientSignature)) {
        Object.assign(payload, { quotingStatus: 'dual_signed' });
      }

      await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await fetchJob();
    } catch (err) {
      console.error("Signature failed", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>
      </div>
    );
  }

  if (!job) return <div className="p-12 text-center text-zinc-600">Job not found.</div>;

  const isFreelancer = user?.role === 'freelancer';
  const isClient = user?.role === 'client';
  const isAgreed = job.quotingStatus === 'agreed' || job.quotingStatus === 'dual_signed';
  const canEdit = isFreelancer && (job.quotingStatus === 'pending_quote' || job.quotingStatus === 'negotiating');

  return (
    <div className="min-h-screen bg-mesh bg-grid bg-slate-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-extrabold text-zinc-900">Negotiate Terms</h1>
            <span className="px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 text-sm font-semibold capitalize">
              {job.quotingStatus?.replace('_', ' ') || 'Pending Quote'}
            </span>
          </div>
          <p className="text-zinc-600 mt-2">{job.title}</p>
        </div>

        <div className="glass-card bg-white border-zinc-200 mb-8">
          <h2 className="text-xl font-bold text-zinc-900 mb-6 border-b border-zinc-100 pb-4">Payment Structure</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              disabled={!canEdit}
              onClick={() => setPaymentType('fixed_price')}
              className={`p-4 rounded-xl border text-left transition-all ${
                paymentType === 'fixed_price' ? 'border-violet-500 bg-violet-50' : 'border-zinc-200 bg-white hover:bg-slate-50'
              } ${(canEdit) ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className={`w-5 h-5 ${paymentType === 'fixed_price' ? 'text-violet-600' : 'text-zinc-400'}`} />
                <h3 className={`font-semibold ${paymentType === 'fixed_price' ? 'text-violet-900' : 'text-zinc-700'}`}>Fixed Price</h3>
              </div>
              <p className="text-sm text-zinc-500">Pay by the milestone or project completion.</p>
            </button>
            <button
              disabled={!canEdit}
              onClick={() => setPaymentType('hourly')}
              className={`p-4 rounded-xl border text-left transition-all ${
                paymentType === 'hourly' ? 'border-cyan-500 bg-cyan-50' : 'border-zinc-200 bg-white hover:bg-slate-50'
              } ${(canEdit) ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className={`w-5 h-5 ${paymentType === 'hourly' ? 'text-cyan-600' : 'text-zinc-400'}`} />
                <h3 className={`font-semibold ${paymentType === 'hourly' ? 'text-cyan-900' : 'text-zinc-700'}`}>Hourly Rate</h3>
              </div>
              <p className="text-sm text-zinc-500">Pay by the hour using a time tracker.</p>
            </button>
          </div>

          {paymentType === 'hourly' && (
            <div className="flex gap-4 mb-8 p-6 bg-slate-50 rounded-xl border border-zinc-100">
              <div className="flex-1">
                <label className="block text-sm font-medium text-zinc-600 mb-2">Hourly Rate (USD)</label>
                <input
                  type="number"
                  disabled={!canEdit}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2 text-zinc-900 disabled:opacity-50"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-zinc-600 mb-2">Estimated Hours</label>
                <input
                  type="number"
                  disabled={!canEdit}
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(Number(e.target.value))}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2 text-zinc-900 disabled:opacity-50"
                />
              </div>
            </div>
          )}

          <h3 className="text-lg font-bold text-zinc-900 mb-4">Milestones</h3>
          <div className="space-y-4 mb-8">
            {milestones.map((ms, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-zinc-100 bg-slate-50">
                <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    disabled={!canEdit}
                    value={ms.title}
                    onChange={(e) => handleUpdateMilestone(i, 'title', e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-zinc-900 disabled:bg-transparent disabled:border-transparent disabled:p-0"
                    placeholder="Milestone Title"
                  />
                  <textarea
                    disabled={!canEdit}
                    value={ms.description}
                    onChange={(e) => handleUpdateMilestone(i, 'description', e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-600 disabled:bg-transparent disabled:border-transparent disabled:p-0 resize-none h-16"
                    placeholder="Milestone Description"
                  />
                </div>
                {paymentType === 'fixed_price' && (
                  <div className="w-32 shrink-0">
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        disabled={!canEdit}
                        value={ms.amount}
                        onChange={(e) => handleUpdateMilestone(i, 'amount', Number(e.target.value))}
                        className="w-full bg-white border border-zinc-200 rounded-lg pl-9 pr-3 py-2 text-sm font-bold text-zinc-900 disabled:bg-slate-100"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-zinc-100">
            <div>
              <p className="text-sm text-zinc-500">Total Estimated Cost</p>
              <p className="text-2xl font-extrabold text-zinc-900">
                ${paymentType === 'hourly' ? hourlyRate * estimatedHours : totalPrice}
              </p>
            </div>
            
            <div className="flex gap-4">
              {isFreelancer && !isAgreed && (
                <button onClick={handleSubmitQuote} disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Quote
                </button>
              )}
              {isClient && job.quotingStatus === 'negotiating' && (
                <>
                  <button onClick={handleDeclineQuote} disabled={saving} className="btn-secondary flex items-center gap-2 text-red-500 hover:bg-red-50 hover:border-red-200">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Decline Quote
                  </button>
                  <button onClick={handleAcceptQuote} disabled={saving} className="btn-primary flex items-center gap-2">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Accept Quote
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Dual Signature Section */}
        {isAgreed && (
          <div className="glow-card bg-emerald-50 border-emerald-200 text-center py-8">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Terms Agreed</h2>
            <p className="text-zinc-600 mb-6 max-w-md mx-auto">
              Both parties have agreed to the terms. Please cryptographically sign the employment contract to proceed.
            </p>
            <div className="flex justify-center gap-12 mb-8">
              <div className="text-center">
                <p className="font-semibold text-zinc-900 mb-2">Client Signature</p>
                {job.clientSignature ? (
                  <span className="text-emerald-600 text-sm font-medium flex items-center gap-1 justify-center"><CheckCircle className="w-4 h-4" /> Signed</span>
                ) : (
                  <span className="text-amber-500 text-sm">Pending</span>
                )}
              </div>
              <div className="text-center">
                <p className="font-semibold text-zinc-900 mb-2">Freelancer Signature</p>
                {job.freelancerSignature ? (
                  <span className="text-emerald-600 text-sm font-medium flex items-center gap-1 justify-center"><CheckCircle className="w-4 h-4" /> Signed</span>
                ) : (
                  <span className="text-amber-500 text-sm">Pending</span>
                )}
              </div>
            </div>

            {((isClient && !job.clientSignature) || (isFreelancer && !job.freelancerSignature)) && (
              <button onClick={handleSignAgreement} disabled={saving} className="btn-primary px-8">
                {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Sign Contract"}
              </button>
            )}

            {job.quotingStatus === 'dual_signed' && isClient && (
              <div className="mt-8 pt-6 border-t border-emerald-200">
                <p className="text-zinc-700 font-medium mb-4">Contract is fully signed! You can now fund the escrow.</p>
                <Link href={`/dashboard/job/${job._id}`} className="btn-primary px-8 bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-900">
                  Go to Execution Tracker
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
