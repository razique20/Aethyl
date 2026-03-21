'use client';

import Navbar from '@/components/Navbar';
import BlogCard from '@/components/BlogCard';
import { Newspaper, Loader2 } from 'lucide-react';
import Footer from '@/components/Footer';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants';

export default function BlogsPage() {
  const { data: blogs, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllBlogs',
  });

  const allBlogs = ((blogs as any[]) || []).filter(b => b.isPublished);

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-20 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-600/20">
            <Newspaper className="w-3.5 h-3.5" /> Aethyl Journal
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-black dark:text-white mb-6 uppercase tracking-tighter leading-none">
            Our Insightful <br /> <span className="text-blue-600">Community</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
            Stay updated with the latest trends in Web3, freelancing, and decentralized technology.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
             <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing with blockchain...</p>
          </div>
        ) : allBlogs.length === 0 ? (
          <div className="text-center py-32 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No decentralized blogs published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {allBlogs.map((post, idx) => (
              <BlogCard key={idx} post={post} />
            ))}
          </div>
        )}

        {/* Newsletter / CTA */}
        <div className="mt-32 rounded-[2.5rem] p-16 bg-white dark:bg-[#020617] border border-black/5 dark:border-white/10 relative overflow-hidden text-center shadow-2xl transition-colors duration-300">
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 to-transparent opacity-50 dark:from-blue-600/20" />
           <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl font-black mb-6 uppercase tracking-tighter text-black dark:text-white">Stay in the Loop</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-10 font-medium">Get the latest Aethyl updates and industry insights delivered straight to your inbox.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                 <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-1 bg-slate-100 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-black dark:text-white focus:outline-none focus:border-blue-500 flex-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                 />
                 <button className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 active:scale-95">
                    Subscribe
                 </button>
              </div>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
