'use client';

import BlogCard from './BlogCard';
import Link from 'next/link';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants';

export default function BlogSection() {
  const { data: blogs, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllBlogs',
  });

  const allBlogs = ((blogs as any[]) || []).filter(b => b.isPublished);
  const latestBlogs = [...allBlogs].reverse().slice(0, 3);

  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-5xl md:text-7xl font-black text-black dark:text-white uppercase tracking-tighter leading-none mb-6">
              Latest <br /> <span className="text-blue-600">Insights</span>
            </h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              Discover the latest trends in the decentralized economy and level up your freelancing game.
            </p>
          </div>
          <Link href="/blogs" className="flex items-center gap-2 px-10 py-4 bg-slate-900 text-white dark:bg-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl group">
             Visit Journal <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
             <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : latestBlogs.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-white/10">
             <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No blogs published on-chain yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {latestBlogs.map((post, idx) => (
              <BlogCard key={idx} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
