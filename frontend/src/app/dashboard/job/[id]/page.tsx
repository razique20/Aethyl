'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants';
import Navbar from '@/components/Navbar';
import { ArrowLeft, Loader2, CheckCircle, Wallet, Milestone, DollarSign, UploadCloud } from 'lucide-react';
import Link from 'next/link';

export default function JobExecutionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { address, isConnected } = useAccount();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: txConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    fetchJob();
  }, [id, isSuccess]);

  const fetchJob = async () => {
    try {
      const res = await fetch(`/api/jobs/${id}`);
      const data = await res.json();
      if (data.success) {
        setJob(data.job);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const milestones = job?.freelancerQuote?.milestones || job?.milestones || [];
  const totalPrice = job?.freelancerQuote?.totalPrice || job?.escrowAmount;

  // Actions
  const handleFundEscrow = async () => {
    if (!isConnected || !address) return alert('Connect wallet');
    // Call Aethyl.sol fundJob
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'fundJob',
        args: [job.onChainJobId || 0], // Assuming onChainJobId exists or we create it here
        value: parseEther(totalPrice.toString()),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleEarlySubmit = async (milestoneIndex: number) => {
    setActionLoading(true);
    const updatedMilestones = [...milestones];
    updatedMilestones[milestoneIndex].status = 'completed';
    
    try {
      await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ['freelancerQuote.milestones']: updatedMilestones,
          milestones: updatedMilestones // Keep in sync
        })
      });
      await fetchJob();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveMilestone = async (milestoneIndex: number) => {
    if (!isConnected || !address) return alert('Connect wallet');
    setActionLoading(true);
    
    const milestoneAmount = milestones[milestoneIndex].amount;
    
    try {
      // For now, off-chain approval only to demo state updates. The contract releasePayment function would go here.
      // writeContract({ address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'releasePayment', args: [job.onChainJobId, parseEther(milestoneAmount)] });

      const updatedMilestones = [...milestones];
      updatedMilestones[milestoneIndex].status = 'approved';
      
      await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ['freelancerQuote.milestones']: updatedMilestones,
          milestones: updatedMilestones
        })
      });
      await fetchJob();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>;
  if (!job) return <div className="p-12 text-center">Job not found.</div>;

  const isClient = user?.role === 'client';
  const isFreelancer = user?.role === 'freelancer';

  return (
    <div className="min-h-screen bg-mesh bg-grid bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        
        <div className="glass-card mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-extrabold text-zinc-900">{job.title}</h1>
              <p className="text-zinc-500 mt-1">{job.paymentType === 'hourly' ? 'Hourly Contract' : 'Fixed Price Contract'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500 mb-1">Total Budget</p>
              <p className="text-2xl font-bold text-emerald-600">${totalPrice?.toLocaleString()}</p>
            </div>
          </div>
          
          {isClient && !job.isFundingComplete && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6 flex items-center justify-between">
              <div>
                <p className="font-semibold text-amber-800">Escrow Pending</p>
                <p className="text-sm text-amber-700">Please deposit funds into the smart contract to begin work.</p>
              </div>
              <button 
                onClick={handleFundEscrow}
                disabled={isPending || txConfirming}
                className="btn-primary bg-amber-500 hover:bg-amber-600 border-amber-500 text-white flex items-center gap-2"
              >
                {isPending || txConfirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                Deposit ${totalPrice?.toLocaleString()}
              </button>
            </div>
          )}
        </div>

        <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
          <Milestone className="w-5 h-5 text-violet-500" /> Milestones & Execution
        </h2>
        
        <div className="space-y-4">
          {milestones.map((m: any, i: number) => (
            <div key={i} className="glow-card border-l-4 border-l-violet-500">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded">Milestone {i + 1}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded capitalize ${
                      m.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                      m.status === 'completed' ? 'bg-blue-100 text-blue-700' : 
                      'bg-zinc-100 text-zinc-600'
                    }`}>{m.status}</span>
                  </div>
                  <h3 className="font-bold text-zinc-900 mb-1">{m.title}</h3>
                  <p className="text-sm text-zinc-600">{m.description}</p>
                </div>
                
                <div className="text-right shrink-0">
                  <p className="font-bold text-zinc-900 flex items-center justify-end gap-1"><DollarSign className="w-4 h-4 text-zinc-400"/> {m.amount}</p>
                  
                  <div className="mt-4">
                    {/* Freelancer Action */}
                    {isFreelancer && m.status === 'pending' && (
                      <button 
                        onClick={() => handleEarlySubmit(i)}
                        disabled={actionLoading}
                        className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1 w-full justify-center"
                      >
                         <UploadCloud className="w-4 h-4" /> Submit Early
                      </button>
                    )}
                    {/* Client Action */}
                    {isClient && m.status === 'completed' && (
                      <button 
                        onClick={() => handleApproveMilestone(i)}
                        disabled={actionLoading}
                        className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1 w-full justify-center bg-emerald-500 hover:bg-emerald-600 border-emerald-500 text-white"
                      >
                         <CheckCircle className="w-4 h-4" /> Approve & Pay
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
