'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Brain, ArrowUp, Loader2, Sparkles, CheckCircle } from 'lucide-react';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

const QUESTIONS = [
  "Hi there! Let's get your freelance profile set up. What is your profession or main title? (e.g. Smart Contract Developer, UI Designer)",
  "Great to meet you! In a few sentences, tell me about your background and experience.",
  "Awesome. What are your top 3 to 5 skills? (Please separate them with commas)",
  "What is your target hourly rate in USD? (Just the number, e.g. 50)",
  "Almost done! Paste a link to your profile picture, or just type 'skip' to get an auto-generated Web3 avatar.",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshAuth } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([
    { id: 'q0', sender: 'ai', text: QUESTIONS[0] }
  ]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Collected data
  const [answers, setAnswers] = useState({
    title: '',
    bio: '',
    skills: [] as string[],
    hourlyRate: 0,
    avatar: '',
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userText }]);

    // Map answer to state
    const newAnswers = { ...answers };
    if (step === 0) newAnswers.title = userText;
    else if (step === 1) newAnswers.bio = userText;
    else if (step === 2) newAnswers.skills = userText.split(',').map(s => s.trim()).filter(Boolean);
    else if (step === 3) newAnswers.hourlyRate = parseInt(userText.replace(/[^0-9]/g, ''), 10) || 0;
    else if (step === 4) newAnswers.avatar = userText.toLowerCase() === 'skip' ? '' : userText;
    
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      // Ask next question
      setTimeout(() => {
        setMessages(prev => [...prev, { id: `q${step + 1}`, sender: 'ai', text: QUESTIONS[step + 1] }]);
        setStep(step + 1);
      }, 600);
    } else {
      // Finish onboarding
      await finalizeSetup(newAnswers);
    }
  };

  const finalizeSetup = async (finalData: any) => {
    setLoading(true);
    setMessages(prev => [...prev, { id: 'saving', sender: 'ai', text: "Perfect! Saving your profile to FrethiX database..." }]);

    try {
      const res = await fetch('/api/freelancers/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });
      const data = await res.json();
      
      if (data.success) {
        setMessages(prev => [...prev, { id: 'done', sender: 'ai', text: "All done! Welcome aboard. Redirecting you to your dashboard..." }]);
        await refreshAuth();
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setMessages(prev => [...prev, { id: 'error', sender: 'ai', text: `Oops, something went wrong: ${data.error}` }]);
        setLoading(false);
      }
    } catch {
      setMessages(prev => [...prev, { id: 'error', sender: 'ai', text: "Network error. Please try again." }]);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh bg-grid flex flex-col items-center py-12 px-4">
      <div className="max-w-3xl w-full flex flex-col h-[80vh]">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI Profile Builder
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900">Let's build your profile</h1>
        </div>

        {/* Chat window */}
        <div className="flex-1 glass-card overflow-y-auto mb-4 flex flex-col gap-6 p-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                msg.sender === 'ai' 
                  ? 'bg-gradient-to-br from-cyan-500 to-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)]' 
                  : 'bg-zinc-100 border border-zinc-200'
              }`}>
                {msg.sender === 'ai' ? <Brain className="w-5 h-5 text-white" /> : <div className="text-zinc-700 text-sm font-bold">You</div>}
              </div>

              {/* Bubble */}
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'ai'
                  ? 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-sm shadow-sm'
                  : 'bg-violet-600 border border-violet-700 text-white rounded-tr-sm shadow-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-4 max-w-[85%]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-zinc-200 flex items-center gap-2 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse delay-75" />
                <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse delay-150" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || step >= QUESTIONS.length}
            placeholder={step >= QUESTIONS.length ? 'Profile complete!' : 'Type your answer...'}
            className="w-full bg-white border border-zinc-200 rounded-xl py-4 pl-6 pr-14 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all shadow-sm"
            autoFocus
          />
          <button
            type="submit"
            disabled={!input.trim() || loading || step >= QUESTIONS.length}
            className="absolute right-2 top-2 p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 disabled:opacity-50 transition-colors"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
