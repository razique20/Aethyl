'use client';

import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Calendar, Clock, User, ArrowLeft, Share2, Facebook, Twitter, Linkedin, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants';

export default function BlogDetailsPage() {
  const { id } = useParams();
  
  const { data: blogs, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllBlogs',
  });

  const allBlogs = (blogs as any[]) || [];
  const post = allBlogs.find(p => p.id.toString() === id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-mesh text-center">
        <Navbar />
        <main className="pt-32 px-6">
          <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Article Not Found</h2>
          <Link href="/blogs" className="text-blue-600 font-bold hover:underline">Back to Journal</Link>
        </main>
      </div>
    );
  }

  const date = new Date(Number(post.timestamp) * 1000).toLocaleDateString();
  const wordsPerMinute = 200;
  const noOfWords = post.content.split(/\s+/).length;
  const readTime = `${Math.ceil(noOfWords / wordsPerMinute)} min read`;

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-20">
        <Link href="/blogs" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-12 hover:text-blue-600 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Journal
        </Link>

        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg mb-6 shadow-lg shadow-blue-500/20">
            {post.category || 'Insights'}
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-black dark:text-white mb-8 uppercase tracking-tighter leading-none">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-8 border-y border-black/5 dark:border-white/5 py-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-blue-500 bg-blue-500/10 flex items-center justify-center text-blue-500">
                 <User className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-tight text-black dark:text-white">{post.author}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verified Author</p>
              </div>
            </div>
            
            <div className="flex gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-2 font-bold"><Calendar className="w-4 h-4 text-blue-500" /> {date}</span>
              <span className="flex items-center gap-2 font-bold"><Clock className="w-4 h-4 text-blue-500" /> {readTime}</span>
            </div>
          </div>
        </div>

        <div className="w-full h-[400px] md:h-[500px] rounded-[40px] overflow-hidden mb-16 shadow-2xl relative group">
          <img src={post.imageURL || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=2232'} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:opacity-0 transition-opacity" />
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div 
             className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed font-medium space-y-8 whitespace-pre-wrap"
          >
             {post.content}
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Share this Insight:</span>
              <div className="flex gap-2">
                 <button className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-blue-600 hover:text-white transition-all">
                    <Twitter className="w-4 h-4" />
                 </button>
                 <button className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-blue-800 hover:text-white transition-all">
                    <Facebook className="w-4 h-4" />
                 </button>
                 <button className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-blue-700 hover:text-white transition-all">
                    <Linkedin className="w-4 h-4" />
                 </button>
              </div>
           </div>
           
           <Link href="/blogs" className="px-10 py-4 bg-slate-900 text-white dark:bg-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
              Back to Journal
           </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
