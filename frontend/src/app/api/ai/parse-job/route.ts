import { NextRequest, NextResponse } from 'next/server';

// Skill keywords to detect
const SKILL_MAP: Record<string, string[]> = {
  'React': ['react', 'reactjs', 'react.js', 'jsx', 'hooks'],
  'Next.js': ['next', 'nextjs', 'next.js', 'app router'],
  'Node.js': ['node', 'nodejs', 'node.js', 'express', 'backend'],
  'TypeScript': ['typescript', 'ts', 'typed'],
  'JavaScript': ['javascript', 'js', 'vanilla js'],
  'Python': ['python', 'django', 'flask', 'fastapi'],
  'Solidity': ['solidity', 'smart contract', 'blockchain', 'web3', 'ethereum'],
  'UI/UX Design': ['design', 'ui', 'ux', 'figma', 'wireframe', 'prototype'],
  'MongoDB': ['mongodb', 'mongoose', 'nosql', 'database', 'db'],
  'PostgreSQL': ['postgresql', 'postgres', 'sql', 'relational'],
  'AWS': ['aws', 'amazon', 'cloud', 's3', 'lambda', 'ec2'],
  'Docker': ['docker', 'container', 'kubernetes', 'k8s'],
  'GraphQL': ['graphql', 'apollo', 'query language'],
  'REST API': ['api', 'rest', 'restful', 'endpoints'],
  'TailwindCSS': ['tailwind', 'tailwindcss', 'utility-first'],
  'Mobile Development': ['mobile', 'ios', 'android', 'react native', 'flutter'],
  'Machine Learning': ['ml', 'machine learning', 'ai', 'artificial intelligence', 'neural'],
  'DevOps': ['devops', 'ci/cd', 'pipeline', 'deployment', 'infrastructure'],
  'Testing': ['testing', 'jest', 'cypress', 'unit test', 'e2e'],
  'Vue.js': ['vue', 'vuejs', 'vue.js', 'nuxt'],
};

// Category detection
const CATEGORY_MAP: Record<string, string[]> = {
  'Web Development': ['website', 'web app', 'web application', 'frontend', 'backend', 'full stack', 'fullstack'],
  'Mobile Development': ['mobile app', 'ios app', 'android app', 'react native', 'flutter'],
  'Blockchain & Web3': ['blockchain', 'smart contract', 'web3', 'defi', 'nft', 'crypto', 'solidity'],
  'AI & Machine Learning': ['ai', 'machine learning', 'ml', 'neural network', 'nlp', 'data science'],
  'UI/UX Design': ['design', 'ui/ux', 'user interface', 'mockup', 'prototype', 'figma'],
  'Data Engineering': ['data pipeline', 'etl', 'data warehouse', 'analytics', 'big data'],
  'DevOps & Cloud': ['devops', 'aws', 'cloud', 'infrastructure', 'ci/cd', 'kubernetes'],
};

function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const [skill, keywords] of Object.entries(SKILL_MAP)) {
    if (keywords.some(kw => lower.includes(kw))) {
      found.push(skill);
    }
  }
  return found.length > 0 ? found : ['General Development'];
}

function extractCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return category;
    }
  }
  return 'Web Development';
}

function extractBudget(text: string): { min: number; max: number } {
  const lower = text.toLowerCase();
  // Match patterns like "$3000", "$3,000", "$2000-$5000", "2k-5k", "around $3000"
  const rangeMatch = lower.match(/\$?([\d,]+)\s*[-–to]+\s*\$?([\d,]+)/);
  if (rangeMatch) {
    return {
      min: parseInt(rangeMatch[1].replace(/,/g, '')),
      max: parseInt(rangeMatch[2].replace(/,/g, '')),
    };
  }
  const singleMatch = lower.match(/\$?([\d,]+)\s*k?\b/);
  if (singleMatch) {
    let val = parseInt(singleMatch[1].replace(/,/g, ''));
    if (lower.includes('k') && val < 100) val *= 1000;
    return { min: Math.floor(val * 0.8), max: Math.ceil(val * 1.2) };
  }
  return { min: 1000, max: 5000 };
}

function extractTimeline(text: string): string {
  const lower = text.toLowerCase();
  const weekMatch = lower.match(/(\d+)\s*weeks?/);
  if (weekMatch) return `${weekMatch[1]} weeks`;
  const monthMatch = lower.match(/(\d+)\s*months?/);
  if (monthMatch) return `${monthMatch[1]} months`;
  const dayMatch = lower.match(/(\d+)\s*days?/);
  if (dayMatch) return `${dayMatch[1]} days`;
  if (lower.includes('asap') || lower.includes('urgent')) return '1-2 weeks';
  return '2-4 weeks';
}

function extractDeliverables(text: string): string[] {
  const deliverables: string[] = [];
  const lower = text.toLowerCase();
  
  if (lower.includes('dashboard')) deliverables.push('Interactive Dashboard');
  if (lower.includes('auth') || lower.includes('login') || lower.includes('sign')) deliverables.push('Authentication System');
  if (lower.includes('api') || lower.includes('backend')) deliverables.push('Backend API');
  if (lower.includes('database') || lower.includes('db')) deliverables.push('Database Schema & Integration');
  if (lower.includes('design') || lower.includes('ui')) deliverables.push('UI/UX Design & Implementation');
  if (lower.includes('deploy') || lower.includes('hosting')) deliverables.push('Deployment & Hosting Setup');
  if (lower.includes('test')) deliverables.push('Test Suite');
  if (lower.includes('documentation') || lower.includes('docs')) deliverables.push('Technical Documentation');
  if (lower.includes('responsive') || lower.includes('mobile')) deliverables.push('Responsive Mobile Design');
  if (lower.includes('chart') || lower.includes('graph') || lower.includes('analytics')) deliverables.push('Data Visualization & Charts');
  
  if (deliverables.length === 0) {
    deliverables.push('Core Application', 'Source Code & Documentation');
  }
  return deliverables;
}

function generateTitle(text: string, category: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('dashboard')) return `${category} Dashboard Development`;
  if (lower.includes('app') || lower.includes('application')) return `${category} Application Build`;
  if (lower.includes('website') || lower.includes('site')) return `${category} Website Development`;
  if (lower.includes('api') || lower.includes('backend')) return `${category} Backend Development`;
  return `${category} Project`;
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    
    if (!text || text.trim().length < 10) {
      return NextResponse.json({ error: 'Please provide a more detailed job description (at least 10 characters).' }, { status: 400 });
    }

    const skills = extractSkills(text);
    const category = extractCategory(text);
    const budget = extractBudget(text);
    const timeline = extractTimeline(text);
    const deliverables = extractDeliverables(text);
    const title = generateTitle(text, category);

    const description = `AI-structured project: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`;

    return NextResponse.json({
      success: true,
      parsed: {
        title,
        description,
        category,
        skills,
        budgetMin: budget.min,
        budgetMax: budget.max,
        timeline,
        deliverables,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to parse job description' }, { status: 500 });
  }
}
