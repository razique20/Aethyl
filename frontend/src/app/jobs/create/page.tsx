'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants';
import Navbar from '@/components/Navbar';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CreateJob() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Development');
  const [skills, setSkills] = useState('');

  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category) return;

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'createJob',
      args: [title, description, category, skills],
    });
  };

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-6 py-20">
        <div className="glass-card">
          <h1 className="text-4xl font-black text-black dark:text-white mb-8">Post a New Job</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium">
            Describe the project and requirements. You can hire a specific freelancer once the job is posted in the marketplace.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                  Project Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Build a Web3 Dashboard"
                  className="w-full !bg-white dark:!bg-slate-900 border-2 border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white font-medium"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                  Category
                </label>
                <select
                  className="w-full !bg-white dark:!bg-slate-900 border-2 border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white font-medium appearance-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Writing">Writing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                Required Skills (Comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. React, Solidity, Tailwind"
                className="w-full !bg-white dark:!bg-slate-900 border-2 border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white font-medium"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                Detailed Description
              </label>
              <textarea
                rows={5}
                placeholder="Describe the job requirements, deliverables, and timeline..."
                className="w-full !bg-white dark:!bg-slate-900 border-2 border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white font-medium"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isPending || isConfirming}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3"
            >
              {(isPending || isConfirming) ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {isPending ? 'Requesting Approval...' : 'Posting to Chain...'}
                </>
              ) : (
                'Post Job Listing'
              )}
            </button>
          </form>

          {isConfirmed && (
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              Job posted successfully! Go to the Dashboard to manage it.
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5" />
              Error: {error.message.split('\n')[0]}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
