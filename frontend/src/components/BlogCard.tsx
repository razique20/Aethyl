import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export interface BlogPost {
  id: string | bigint;
  title: string;
  content: string;
  author: string;
  category: string;
  imageURL: string;
  timestamp: string | bigint;
}

export default function BlogCard({ post }: { post: BlogPost }) {
  // Use blockchain data or fallback to defaults
  const image = post.imageURL || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=2232';
  const category = post.category || 'Tech';
  const date = typeof post.timestamp === 'bigint' 
    ? new Date(Number(post.timestamp) * 1000).toLocaleDateString()
    : 'Recently';
  
  // Calculate read time based on content length
  const wordsPerMinute = 200;
  const noOfWords = post.content.split(/\s+/).length;
  const minutes = Math.ceil(noOfWords / wordsPerMinute);
  const readTime = `${minutes} min read`;

  return (
    <div className="glass-card !p-0 overflow-hidden group hover:border-blue-500/50 transition-all duration-500">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={post.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">
            {category}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {date}</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {readTime}</span>
        </div>
        
        <h3 className="text-xl font-black text-black dark:text-white mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 uppercase leading-tight">
          {post.title}
        </h3>
        
        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium line-clamp-3 mb-6 leading-relaxed">
          {post.content}
        </p>
        
        <Link href={`/blogs/${post.id.toString()}`} className="flex items-center gap-2 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest group/link">
          Read Full Article <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
