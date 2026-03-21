export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
}

export const MOCK_BLOGS: BlogPost[] = [
  {
    id: '1',
    title: 'The Future of Decentralized Freelancing',
    excerpt: 'Explore how blockchain is reshaping the relationship between clients and talent through trustless escrow.',
    content: `
      <p>The freelance economy is undergoing a radical shift. Digital nomads and independent contractors are no longer satisfied with centralized platforms that take hefty commissions and provide slow payment cycles.</p>
      <p>Decentralized protocols like Aethyl are stepping in to bridge the trust gap. By using smart contracts as an impartial escrow agent, we ensure that funds are only released when both parties agree on the outcome.</p>
      <h3>Why Decentralization Matters</h3>
      <ul>
        <li><strong>Transparency:</strong> Every contract interaction is recorded on the blockchain.</li>
        <li><strong>Security:</strong> Funds are locked in a public smart contract, not a private bank account.</li>
        <li><strong>Efficiency:</strong> Instant settlement in ETH eliminates wire transfer delays.</li>
      </ul>
      <p>As we move towards Web3, the boundary between "work" and "contribution" will blur. Aethyl is at the forefront of this movement, providing the infrastructure for a global, borderless workforce.</p>
    `,
    category: 'Industry',
    date: 'Mar 20, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800',
    author: {
      name: 'Alex Rivka',
      role: 'Core Contributor',
      avatar: 'https://i.pravatar.cc/150?u=alex'
    }
  },
  {
    id: '2',
    title: '5 Tips for Winning High-Value Bids',
    excerpt: 'Master the art of the proposal with our guide on leveraging your on-chain reputation and work history.',
    content: `
      <p>Winning high-ticket clients in the Web3 space requires more than just technical skills. It requires a verifiable proof of reputation. Here's how you can stand out on Aethyl.</p>
      <h3>1. Leverage Your On-Chain History</h3>
      <p>Clients values freelancers who have a track record. Your Aethyl profile displays your completion rate and total earnings. Make sure these stats are highlighted in your proposals.</p>
      <h3>2. Be Precise with Milestones</h3>
      <p>Instead of one large bid, break your project into smaller, manageable milestones. This builds trust and ensures you get paid regularly throughout the project lifecycle.</p>
      <p>Join the discussion on our Discord to learn more about how to optimize your bidding strategy.</p>
    `,
    category: 'Guides',
    date: 'Mar 18, 2026',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    author: {
      name: 'Sarah Chen',
      role: 'Community Lead',
      avatar: 'https://i.pravatar.cc/150?u=sarah'
    }
  },
  {
    id: '3',
    title: 'Security First: How Aethyl Protects Funds',
    excerpt: 'Learn about the multi-layered security approach we take to ensure your ETH is always safe in our escrow.',
    content: `
      <p>Security is not a feature; it's the foundation of Aethyl. Since our launch, we've focused on creating the most secure escrow environment for the decentralized workforce.</p>
      <h3>Smart Contract Audits</h3>
      <p>Our core contracts, including the escrow and profile systems, undergo continuous internal and community review. Every line of code is optimized for safety and gas efficiency.</p>
      <h3>The Power of Sepolia</h3>
      <p>We are currently operating on the Sepolia Testnet to ensure rigorous testing of all new features before mainnet migration. This allows us to battle-test our infrastructure without risking user capital.</p>
    `,
    category: 'Security',
    date: 'Mar 12, 2026',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
    author: {
      name: 'Marcus Thorne',
      role: 'Security Engineer',
      avatar: 'https://i.pravatar.cc/150?u=marcus'
    }
  },
];
