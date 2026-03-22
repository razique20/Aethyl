'use client';

import { useState } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants';
import { Star, X, Loader2, CheckCircle, ShieldAlert, MessageSquare } from 'lucide-react';

interface ReviewFormProps {
  jobId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReviewForm({ jobId, isOpen, onClose, onSuccess }: { jobId: number; isOpen: boolean; onClose: () => void; onSuccess?: () => void }) {
  const { address } = useAccount();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const { data: job, isLoading: isLoadingJob } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'jobs',
    args: [BigInt(jobId)],
  });

  const { data: alreadyReviewed } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'hasReviewed',
    args: [BigInt(jobId), address as `0x${string}`] as const,
    query: { enabled: !!address }
  });

  const { writeContract, data: hash, isPending, error: writeError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'submitReview',
      args: [BigInt(jobId), rating, comment],
    });
  };

  if (isSuccess && isOpen) {
    setTimeout(() => {
      onSuccess?.();
      onClose();
    }, 2000);
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80">
        <div className="text-center p-12 rounded-[2.5rem] bg-white dark:bg-slate-50 border border-slate-200 shadow-2xl animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Star className="w-10 h-10 text-green-500 fill-green-500" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 text-slate-900 dark:text-slate-900">Review Submitted!</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Your feedback helps the FrethiX community thrive.</p>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 animate-in fade-in duration-300">
      <div className="w-full max-w-xl !p-10 relative bg-white dark:bg-slate-50 overflow-y-auto max-h-[90vh] rounded-[2.5rem] border border-slate-200 shadow-2xl animate-in zoom-in duration-300">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-2 bg-slate-100 dark:bg-white/5 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        
        <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter text-slate-900 dark:text-slate-900">Rate Your Experience</h2>
        <p className="text-slate-500 mb-6 text-sm font-medium leading-relaxed">How was your interaction on Job #{jobId}? Your review will be permanently stored on-chain.</p>
        
        {job && (
          <div className="mb-8 p-4 bg-blue-50 dark:bg-slate-100 rounded-xl border border-blue-100 flex flex-col gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">
            <div className="flex justify-between items-center">
              <span>Client:</span>
              <span className="font-mono text-slate-900 truncate max-w-[200px]">{job[1]}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Freelancer:</span>
              <span className="font-mono text-slate-900 truncate max-w-[200px]">{job[2]}</span>
            </div>
            <div className="flex justify-between items-center border-t border-blue-200 pt-2 mt-2">
              <span>On-Chain Status:</span>
              <span className={`px-2 py-0.5 rounded-full ${job[4] === 3 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {job[4] === 3 ? '3 (Completed)' : `${job[4]} (Not Completed)`}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-blue-200 pt-2 mt-2">
              <span>Already Reviewed?</span>
              <span className={`px-2 py-0.5 rounded-full ${alreadyReviewed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {alreadyReviewed ? 'YES (Cannot Review Again)' : 'NO (Ready to Review)'}
              </span>
            </div>
            {address?.toLowerCase() !== job[1]?.toLowerCase() && address?.toLowerCase() !== job[2]?.toLowerCase() && (
              <div className="mt-2 text-red-600 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Warning: You are not a participant in this job.
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col items-center gap-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="p-2 transition-all active:scale-95"
                >
                  <Star 
                    className={`w-10 h-10 ${
                      (hoveredRating || rating) >= star 
                        ? 'text-yellow-500 fill-yellow-500' 
                        : 'text-slate-300 dark:text-slate-700'
                    }`} 
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
              {['Poor', 'Fair', 'Good', 'Very Good', 'Exceptional'][rating - 1]}
            </p>
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MessageSquare className="w-3 h-3" /> Detailed Comment
            </label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Great communication and high-quality deliverables. Highly recommended!"
              className="w-full bg-slate-100/50 dark:bg-slate-100 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold min-h-[150px] focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-slate-900"
              required
            />
          </div>

          {writeError && (
             <p className="text-red-500 text-[10px] font-black uppercase text-center bg-red-500/10 p-4 rounded-xl">
                {writeError.message.includes('Already reviewed') 
                  ? 'You have already reviewed this job' 
                  : writeError.message.includes('Only client or freelancer') 
                  ? 'Not authorized: You must be the client or freelancer' 
                  : writeError.message.includes('Only completed jobs')
                  ? 'Job not completed yet'
                  : `Error: ${writeError.message}`}
             </p>
          )}

          <button 
            type="submit"
            disabled={isPending || isConfirming}
            className="w-full py-5 bg-blue-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> {isConfirming ? 'Finalizing Review...' : 'Awaiting Approval...'}
              </>
            ) : 'Publish Review On-Chain'}
          </button>
        </form>
      </div>
    </div>
  );
}
