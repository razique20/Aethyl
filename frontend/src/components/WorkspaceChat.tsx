'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { Loader2, Send, Lock, MessageSquare } from 'lucide-react';

export default function WorkspaceChat({ client, freelancer, jobId }: { client: string, freelancer: string, jobId: number }) {
  const { address } = useAccount();
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Poll for messages
  useEffect(() => {
    let interval: any;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?jobId=${jobId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error("Failed to fetch messages", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds for new messages

    return () => clearInterval(interval);
  }, [jobId]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || sending || !address) return;
    setSending(true);
    
    // Optimistic UI update
    const tempMsg = { _id: Date.now(), sender: address, content: text, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, tempMsg]);
    setText('');

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: String(jobId), sender: address, content: tempMsg.content })
      });
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  // Only show to the involved parties after all hooks have successfully executed
  if (!address || (address !== client && address !== freelancer)) return null;
  const isClient = address === client;

  return (
    <div className="mt-16 bg-white dark:bg-[#020617] border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
               <MessageSquare className="w-6 h-6 text-blue-500" />
            </div>
            <div>
               <h3 className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tighter">Project Workspace</h3>
               <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Live connection with {isClient ? 'Freelancer' : 'Client'}
               </p>
            </div>
         </div>
         <div className="px-4 py-2 bg-green-500/10 text-green-600 rounded-full text-xs font-black uppercase tracking-widest hidden md:block">
            Connected
         </div>
      </div>

      {/* Body */}
      <div className="flex-1 bg-slate-50/50 dark:bg-black/20 p-6 flex flex-col relative overflow-hidden">
         {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
               <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
               <p className="text-sm font-bold uppercase tracking-widest">Loading workspace messages...</p>
            </div>
         ) : (
            <div className="w-full h-full flex flex-col">
               <div className="flex-1 overflow-y-auto pr-2 space-y-4" ref={scrollRef}>
                  {messages.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                        <MessageSquare className="w-12 h-12 mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest">No messages yet. Say hello!</p>
                     </div>
                  ) : (
                     messages.map((msg: any) => {
                        const isMe = msg.sender.toLowerCase() === address.toLowerCase();
                        return (
                           <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] p-4 rounded-2xl ${isMe ? 'bg-blue-600 text-white rounded-br-sm shadow-blue-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm'} shadow-lg`}>
                                 <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                 <p className={`text-[9px] mt-2 font-mono uppercase tracking-widest ${isMe ? 'text-blue-200' : 'text-slate-500'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                 </p>
                              </div>
                           </div>
                        )
                     })
                  )}
               </div>

               {/* Input Area */}
               <div className="mt-6 flex gap-3 pb-2">
                  <input 
                     type="text"
                     value={text}
                     onChange={(e) => setText(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                     placeholder="Type a message..."
                     className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                     disabled={sending}
                  />
                  <button 
                     onClick={handleSend}
                     disabled={!text.trim() || sending}
                     className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                     {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
               </div>
            </div>
         )}
      </div>
    </div>
  );
}
