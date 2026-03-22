'use client';

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants';
import { Send, Loader2, Edit3, Eye, EyeOff, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminBlogs() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('FrethiX Team');
  const [category, setCategory] = useState('Tech');
  const [imageURL, setImageURL] = useState('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=2232');

  const { data: allBlogs, refetch: refetchBlogs } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllBlogs',
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      refetchBlogs();
      resetForm();
    }
  }, [isSuccess]);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setAuthor('FrethiX Team');
    setCategory('Tech');
    setImageURL('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=2232');
  }

  const handlePublish = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingId !== null) {
          writeContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'editBlog',
            args: [BigInt(editingId), title, content, category, imageURL],
          });
      } else {
          writeContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'createBlog',
            args: [title, content, author, category, imageURL],
          });
      }
  };

  const startEdit = (blog: any) => {
      setEditingId(Number(blog.id));
      setTitle(blog.title);
      setContent(blog.content);
      setAuthor(blog.author);
      setCategory(blog.category);
      setImageURL(blog.imageURL);
  };

  const toggleVisibility = (id: number) => {
      writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'toggleBlogVisibility',
          args: [BigInt(id)],
      });
  };

  const blogs = (allBlogs as any[]) || [];

  return (
    <div className="p-10">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter text-black dark:text-white">Blogs & Content</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Publish and manage on-chain insights.</p>
        </div>
        {editingId !== null && (
           <button onClick={resetForm} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">
              <X className="w-4 h-4" /> Cancel Editing
           </button>
        )}
      </div>

      {/* Write/Edit Blog Section */}
      <div className="bg-white dark:bg-white/5 rounded-[2rem] p-8 border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none mb-12">
        <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter flex items-center gap-3 text-black dark:text-white">
            <Edit3 className="w-6 h-6 text-blue-500" /> {editingId !== null ? `Editing ID: ${editingId}` : 'New Publication'}
        </h2>
        
        <form onSubmit={handlePublish} className="space-y-4">
           <input 
              type="text" 
              placeholder="Blog Title" 
              value={title}
              required
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 font-bold text-black dark:text-white focus:outline-none focus:border-blue-500"
           />
           <div className="grid grid-cols-2 gap-4">
              <input 
                  type="text" 
                  placeholder="Author Name" 
                  value={author}
                  disabled={editingId !== null}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 font-bold text-black dark:text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
              <input 
                  type="text" 
                  placeholder="Category (e.g. Web3, Security)" 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 font-bold text-black dark:text-white focus:outline-none focus:border-blue-500"
              />
           </div>
           <input 
              type="text" 
              placeholder="Cover Image URL" 
              value={imageURL}
              onChange={(e) => setImageURL(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 font-bold text-black dark:text-white focus:outline-none focus:border-blue-500"
           />
           <textarea 
              placeholder="Blog Content" 
              value={content}
              required
              rows={8}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-black dark:text-white focus:outline-none focus:border-blue-500 resize-none font-mono"
           />
           <button 
             type="submit"
             disabled={isPending || isConfirming}
             className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
           >
             {isPending || isConfirming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
             {editingId !== null ? 'Save Changes' : 'Publish On-Chain'}
           </button>
        </form>
      </div>

      {/* Directory Section */}
      <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter text-black dark:text-white">Live Directory ({blogs.length})</h2>
      <div className="grid grid-cols-1 gap-4">
        {blogs.length === 0 ? (
          <p className="p-10 text-center bg-slate-50 dark:bg-white/5 rounded-2xl text-slate-500 font-medium">No publications found.</p>
        ) : (
          [...blogs].reverse().map((blog) => (
            <div key={Number(blog.id)} className={`bg-white dark:bg-white/5 rounded-2xl px-6 py-4 flex items-center justify-between border transition-all ${blog.isPublished ? 'border-slate-100 dark:border-white/5' : 'border-red-500/30 opacity-60'}`}>
              <div className="flex items-center gap-4">
                 <img src={blog.imageURL} className="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-white/5" alt="" />
                 <div>
                    <h3 className="font-bold text-black dark:text-white line-clamp-1">{blog.title}</h3>
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{blog.category} • By {blog.author}</p>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <button 
                    onClick={() => startEdit(blog)}
                    title="Edit Post"
                    className="p-3 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                 >
                    <Edit3 className="w-4 h-4" />
                 </button>
                 <button 
                    onClick={() => toggleVisibility(Number(blog.id))}
                    title={blog.isPublished ? "Hide Post" : "Show Post"}
                    className={`p-3 rounded-xl transition-all ${blog.isPublished ? 'bg-green-500/10 text-green-500 hover:bg-slate-500 hover:text-white' : 'bg-red-500/10 text-red-500 hover:bg-green-500 hover:text-white'}`}
                 >
                    {blog.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                 </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
