import { NextRequest, NextResponse } from 'next/server';

interface Milestone {
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending';
}

function generateMilestones(deliverables: string[], budgetMin: number, budgetMax: number, timeline: string): Milestone[] {
  const totalBudget = Math.round((budgetMin + budgetMax) / 2);
  const numMilestones = Math.min(deliverables.length + 1, 5); // Max 5 milestones

  // Parse timeline to get days
  let totalDays = 21; // default
  const weekMatch = timeline.match(/(\d+)/);
  if (weekMatch) {
    if (timeline.includes('week')) totalDays = parseInt(weekMatch[1]) * 7;
    else if (timeline.includes('month')) totalDays = parseInt(weekMatch[1]) * 30;
    else if (timeline.includes('day')) totalDays = parseInt(weekMatch[1]);
  }

  const milestones: Milestone[] = [];
  const today = new Date();

  // First milestone: Project Setup & Planning (15% of budget)
  const setupAmount = Math.round(totalBudget * 0.15);
  milestones.push({
    title: 'Project Setup & Planning',
    description: 'Initial project setup, architecture planning, repository configuration, and environment setup.',
    amount: setupAmount,
    dueDate: new Date(today.getTime() + (totalDays * 0.1) * 86400000).toISOString().split('T')[0],
    status: 'pending',
  });

  // Deliverable milestones (70% of budget split evenly)
  const deliverableBudget = Math.round(totalBudget * 0.7);
  const perDeliverable = Math.round(deliverableBudget / Math.max(deliverables.length, 1));
  
  deliverables.slice(0, 3).forEach((deliverable, idx) => {
    const progress = (idx + 1) / (deliverables.length + 1);
    milestones.push({
      title: deliverable,
      description: `Development and implementation of: ${deliverable}. Includes testing and code review.`,
      amount: perDeliverable,
      dueDate: new Date(today.getTime() + (totalDays * (0.2 + progress * 0.6)) * 86400000).toISOString().split('T')[0],
      status: 'pending',
    });
  });

  // Final milestone: QA, Testing & Delivery (15% of budget)
  const finalAmount = totalBudget - setupAmount - (perDeliverable * Math.min(deliverables.length, 3));
  milestones.push({
    title: 'Final QA, Testing & Delivery',
    description: 'Comprehensive testing, bug fixes, performance optimization, documentation, and final delivery.',
    amount: Math.max(finalAmount, Math.round(totalBudget * 0.15)),
    dueDate: new Date(today.getTime() + totalDays * 86400000).toISOString().split('T')[0],
    status: 'pending',
  });

  return milestones;
}

export async function POST(req: NextRequest) {
  try {
    const { parsedJob, freelancer } = await req.json();

    if (!parsedJob || !freelancer) {
      return NextResponse.json({ error: 'Parsed job and freelancer data are required' }, { status: 400 });
    }

    const milestones = generateMilestones(
      parsedJob.deliverables || [],
      parsedJob.budgetMin || 1000,
      parsedJob.budgetMax || 5000,
      parsedJob.timeline || '2-4 weeks'
    );

    const totalCost = milestones.reduce((sum: number, m: Milestone) => sum + m.amount, 0);

    return NextResponse.json({
      success: true,
      scope: {
        title: parsedJob.title,
        description: parsedJob.description,
        freelancer: {
          id: freelancer._id,
          name: freelancer.name,
          title: freelancer.title,
          avatar: freelancer.avatar,
          rating: freelancer.rating,
        },
        milestones,
        totalCost,
        timeline: parsedJob.timeline,
        startDate: new Date().toISOString().split('T')[0],
        endDate: milestones[milestones.length - 1]?.dueDate,
      },
    });
  } catch (error) {
    console.error('Scope generation error:', error);
    return NextResponse.json({ error: 'Failed to generate project scope' }, { status: 500 });
  }
}
