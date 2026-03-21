'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants';
import { formatEther, parseEther } from 'viem';
import Navbar from '@/components/Navbar';
import { 
  Loader2, ArrowLeft, ShieldCheck, Mail, User, Info, DollarSign, 
  UserPlus, Wallet, Send, Check, Plus, Trash2, ExternalLink, PartyPopper 
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const WorkspaceChat = dynamic(() => import('@/components/WorkspaceChat'), { ssr: false });

const USD_TO_ETH_RATE = 0.0004;

export default function JobDetails() {
  const { id } = useParams();
  const { address } = useAccount();
  
  // Bid Form state
  const [bidAmountUSD, setBidAmountUSD] = useState('');
  const [bidText, setBidText] = useState('');
  const [workLinks, setWorkLinks] = useState<string[]>(['']);
  
  // Funding state
  const [tipUSD, setTipUSD] = useState('0');
  const [showFundingModal, setShowFundingModal] = useState(false);

  // Success state
  const [showSuccess, setShowSuccess] = useState(false);

  // Safe integer conversion
  const isValidId = Boolean(id && /^\d+$/.test(id as string));
  const jobIdBigInt = isValidId ? BigInt(id as string) : BigInt(0);

  // Fetch Job details
  const { data: job, isLoading: isJobLoading, error: jobError, refetch: refetchJob } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'jobs',
    args: [jobIdBigInt],
    query: {
      enabled: isValidId
    }
  });

  // Fetch Quotes
  const { data: quotes, isLoading: isQuotesLoading, refetch: refetchQuotes } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getJobQuotes',
    args: [jobIdBigInt],
    query: {
      enabled: isValidId
    }
  });

  const { writeContract, data: hash, isPending, isError, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed) {
      refetchJob();
      refetchQuotes();
      setShowSuccess(true);
      // Reset form if it was a bid
      if (!job || (job as any)[4] === 0) {
        setBidAmountUSD('');
        setBidText('');
        setWorkLinks(['']);
      }
      // Hide Success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
      setShowFundingModal(false);
    }
  }, [isConfirmed]);

  if (!isValidId) return <div className="min-h-screen bg-mesh text-center pt-32"><Navbar /><h2 className="text-2xl font-bold text-red-500 uppercase tracking-tighter">Invalid Project ID</h2><Link href="/dashboard" className="text-blue-500 mt-4 inline-block font-black uppercase tracking-widest text-[10px]">Back to Marketplace</Link></div>;
  if (isJobLoading) return <div className="min-h-screen bg-mesh flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-blue-500" /></div>;
  if (jobError || !job || (job as any)[5] === "") return <div className="min-h-screen bg-mesh text-center pt-32"><Navbar /><h2 className="text-2xl font-bold text-red-400 capitalize tracking-tighter">Project Not Found</h2><Link href="/dashboard" className="text-blue-400 mt-4 inline-block font-black uppercase tracking-widest text-[10px]">Back to Marketplace</Link></div>;

  const [jobId, client, freelancer, amount, status, title, description, category, skills] = (job as any);
  const isClient = address?.toLowerCase() === client.toLowerCase();
  const isFreelancerFound = address?.toLowerCase() === freelancer.toLowerCase();

  // Find the selected quote for funding auto-fill
  const selectedQuote = quotes?.find((q: any) => q.freelancer.toLowerCase() === freelancer.toLowerCase());
  const basePriceUSD = selectedQuote ? Number(selectedQuote.amountUSD) : 0;
  const totalUSD = basePriceUSD + Number(tipUSD || 0);
  const totalETH = (totalUSD * USD_TO_ETH_RATE).toFixed(7);

  const handleAddLink = () => {
    if (workLinks.length < 5) setWorkLinks([...workLinks, '']);
  };

  const handleRemoveLink = (index: number) => {
    const newLinks = workLinks.filter((_, i) => i !== index);
    setWorkLinks(newLinks.length ? newLinks : ['']);
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...workLinks];
    newLinks[index] = value;
    setWorkLinks(newLinks);
  };

  const handleSubmitBid = () => {
    if (!bidAmountUSD || !bidText) return;
    const filteredLinks = workLinks.filter(link => link.trim() !== '');
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'submitQuote',
      args: [jobId, BigInt(bidAmountUSD), bidText, filteredLinks],
    });
  };

  const handleHire = (freelancerAddress: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'assignFreelancer',
      args: [jobId, freelancerAddress as `0x${string}`],
    });
  };

  const handleFund = () => {
    if (!totalETH || isNaN(Number(totalETH))) return;
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'fundJob',
      args: [jobId],
      value: parseEther(totalETH),
    });
  };

  const handleComplete = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'completeJob',
      args: [jobId],
    });
  };

  const ensureAbsoluteUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>

        {/* Success Alert */}
        {showSuccess && (
          <div className="mb-8 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-4 animate-in slide-in-from-top duration-500">
            <div className="p-2 bg-green-500 rounded-lg">
              <PartyPopper className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-green-400">Success!</p>
              <p className="text-sm text-green-500/80">Your transaction has been confirmed on-chain.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="glass-card">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-4xl md:text-5xl font-black text-black dark:text-white">{title}</h1>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Contract Address</span>
                  <span className="text-[10px] font-mono text-slate-400">{CONTRACT_ADDRESS.slice(0, 10)}...</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-4 py-1.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-black uppercase tracking-widest border-2 border-blue-200 dark:border-blue-500/30">
                  {category || 'General'}
                </span>
                {skills && skills.split(',').map((skill: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold border-2 border-slate-200 dark:border-slate-700 uppercase tracking-tight">
                    {skill.trim()}
                  </span>
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-medium text-lg border-l-4 border-blue-500 pl-6 py-2">{description}</p>
            </div>

            {/* Bids List for Client */}
            {isClient && status === 0 && (
              <div className="glass-card">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-400" /> Received Proposals ({quotes?.length || 0})
                </h3>
                {isQuotesLoading ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /> : !quotes?.length ? <p className="text-slate-500 text-center py-10">Waiting for proposals...</p> : (
                  <div className="space-y-4">
                    {quotes.map((quote: any, idx: number) => (
                      <div key={idx} className="p-6 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">${Number(quote.amountUSD)} USD</span>
                            <span className="text-slate-500 dark:text-slate-500 text-sm ml-2">≈ {(Number(quote.amountUSD) * USD_TO_ETH_RATE).toFixed(4)} ETH</span>
                            <div className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-1">
                              <User className="w-3 h-3" /> {quote.freelancer}
                            </div>
                          </div>
                          <button onClick={() => handleHire(quote.freelancer)} disabled={isPending || isConfirming} className="btn-primary py-2 px-6 text-sm flex items-center gap-2">
                            {isPending || isConfirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Hire</>}
                          </button>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-sm mb-4 leading-relaxed bg-black/5 dark:bg-black/20 p-4 rounded-xl">"{quote.bidText}"</p>
                        {quote.workLinks?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {quote.workLinks.map((link: string, lIdx: number) => link && (
                              <a key={lIdx} href={ensureAbsoluteUrl(link)} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] text-blue-400 hover:bg-blue-500/20 flex items-center gap-1 transition-all">
                                <ExternalLink className="w-3 h-3" /> Work Sample {lIdx + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Proposal Form for Freelancer */}
            {!isClient && status === 0 && (
              <div className="glass-card">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Send className="w-5 h-5 text-blue-400" /> Submit Proposal</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Bid Amount (USD)</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</div>
                        <input type="number" placeholder="0.00" className="w-full !bg-white dark:!bg-slate-900 border-2 border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-4 py-3 focus:border-blue-500 outline-none text-slate-900 dark:text-white font-bold" value={bidAmountUSD} onChange={(e) => setBidAmountUSD(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Previous Work Links (Max 5)</label>
                      <div className="space-y-2">
                        {workLinks.map((link, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input type="url" placeholder="https://..." className="flex-1 !bg-white dark:!bg-slate-900 border-2 border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:border-blue-500 outline-none text-slate-900 dark:text-white font-medium" value={link} onChange={(e) => handleLinkChange(idx, e.target.value)} />
                            {workLinks.length > 1 && <button onClick={() => handleRemoveLink(idx)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>}
                          </div>
                        ))}
                        {workLinks.length < 5 && <button onClick={handleAddLink} className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:text-blue-500 transition-colors"><Plus className="w-3 h-3" /> Add another link</button>}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Cover Letter</label>
                    <textarea rows={4} placeholder="Why should you be hired? Describe your experience and approach..." className="w-full !bg-white dark:!bg-slate-900 border-2 border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none text-slate-900 dark:text-white font-medium" value={bidText} onChange={(e) => setBidText(e.target.value)} />
                  </div>
                  {isError && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center">Error: {writeError?.message?.split('\n')[0]}</div>}
                  <button onClick={handleSubmitBid} disabled={isPending || isConfirming} className="btn-primary w-full py-4 flex items-center justify-center gap-3">
                    {isPending || isConfirming ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Send className="w-5 h-5" /> Submit Proposal</>}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card">
              <div className="mb-6">
                <span className="text-sm text-slate-500 block mb-1">Status</span>
                <div className="mt-1">
                  {status === 0 && <span className="px-4 py-1.5 bg-blue-500/10 text-blue-400 rounded-full text-sm font-bold border border-blue-500/20 block text-center">Bidding</span>}
                  {status === 1 && <span className="px-4 py-1.5 bg-yellow-500/10 text-yellow-500 rounded-full text-sm font-bold border border-yellow-500/20 block text-center">Assigned</span>}
                  {status === 2 && <span className="px-4 py-1.5 bg-purple-500/10 text-purple-400 rounded-full text-sm font-bold border border-purple-500/20 block text-center">Funded</span>}
                  {status === 3 && <span className="px-4 py-1.5 bg-green-500/10 text-green-400 rounded-full text-sm font-bold border border-green-500/20 block text-center">Completed</span>}
                </div>
              </div>

              <div className="mb-8">
                <span className="text-sm text-slate-500 block mb-1">Agreed Budget</span>
                <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <DollarSign className="w-7 h-7" /> {status > 1 ? Number(formatEther(amount)).toFixed(7) : '0.0000000'} ETH
                </div>
                {status === 1 && <p className="text-[10px] text-yellow-600 dark:text-yellow-500 mt-1">Waiting for funding...</p>}
              </div>

              <div className="space-y-3">
                {isClient && status === 1 && (
                  <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/10">
                    <div className="p-4 bg-black/5 dark:bg-white/5 rounded-xl space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Proposal Price:</span>
                        <span className="text-slate-900 dark:text-white">${basePriceUSD}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">Add Tip (USD):</span>
                         <div className="relative w-28">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">$</span>
                          <input type="number" className="w-full !bg-white dark:!bg-slate-900 border-2 border-slate-200 dark:border-white/10 rounded-lg px-6 py-2 text-sm text-right text-slate-900 dark:text-white font-black" value={tipUSD} onChange={(e) => setTipUSD(e.target.value)} />
                        </div>
                      </div>
                      <div className="flex justify-between text-sm font-bold pt-2 border-t border-black/5 dark:border-white/5">
                        <span className="text-blue-600 dark:text-blue-400">Total:</span>
                        <span className="text-blue-600 dark:text-blue-400">${totalUSD} ≈ {totalETH} ETH</span>
                      </div>
                    </div>
                    <button onClick={handleFund} disabled={isPending || isConfirming} className="btn-primary w-full py-4 flex items-center justify-center gap-2">
                      <Wallet className="w-5 h-5" /> {isPending || isConfirming ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Fund & Start Project'}
                    </button>
                  </div>
                )}

                {isClient && status === 2 && (
                  <button onClick={handleComplete} disabled={isPending || isConfirming} className="btn-secondary w-full py-4 bg-green-600 hover:bg-green-500 text-white flex items-center justify-center gap-2">
                    <ShieldCheck className="w-5 h-5" /> {isPending || isConfirming ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Delivery & Pay'}
                  </button>
                )}
              </div>
            </div>

            <div className="glass-card">
              <h3 className="text-lg font-bold mb-4">Contract Details</h3>
              <div className="space-y-4">
                <div><span className="text-xs text-slate-500 block mb-1 uppercase tracking-wider">Client</span><p className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-black/5 dark:bg-white/5 p-2 rounded truncate">{client}</p></div>
                <div><span className="text-xs text-slate-500 block mb-1 uppercase tracking-wider">Freelancer</span><p className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-black/5 dark:bg-white/5 p-2 rounded truncate">{freelancer === '0x0000000000000000000000000000000000000000' ? 'Selecting...' : freelancer}</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Chat - Only visible if Funded/Completed and user is participant */}
        {status >= 2 && (
          <WorkspaceChat jobId={Number(id)} client={client} freelancer={freelancer} />
        )}
      </main>
    </div>
  );
}
