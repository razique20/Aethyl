import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/mongodb';
import Freelancer from '@/models/Freelancer';

function calculateMatchScore(freelancerSkills: string[], jobSkills: string[], freelancerRate: number, budgetMax: number, rating: number, availability: string): number {
  // Skill match (40% weight)
  const normalizedJobSkills = jobSkills.map(s => s.toLowerCase());
  const normalizedFreelancerSkills = freelancerSkills.map(s => s.toLowerCase());
  const matchingSkills = normalizedFreelancerSkills.filter(s => 
    normalizedJobSkills.some(js => s.includes(js.toLowerCase()) || js.toLowerCase().includes(s))
  );
  const skillScore = jobSkills.length > 0 ? (matchingSkills.length / jobSkills.length) * 40 : 20;

  // Budget fit (20% weight)
  const budgetScore = freelancerRate <= budgetMax * 0.05 ? 20 : 
                      freelancerRate <= budgetMax * 0.1 ? 15 : 
                      freelancerRate <= budgetMax * 0.2 ? 10 : 5;

  // Rating (25% weight)
  const ratingScore = (rating / 5) * 25;

  // Availability (15% weight)
  const availScore = availability === 'available' ? 15 : availability === 'busy' ? 7 : 0;

  return Math.min(Math.round(skillScore + budgetScore + ratingScore + availScore), 99);
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { skills, budgetMax, budgetMin } = await req.json();

    if (!skills || !Array.isArray(skills)) {
      return NextResponse.json({ error: 'Skills array is required' }, { status: 400 });
    }

    const freelancers = await Freelancer.find({ availability: { $ne: 'unavailable' } }).lean();

    if (freelancers.length === 0) {
      return NextResponse.json({ 
        success: true, 
        matches: [],
        message: 'No freelancers available. Please seed the database first via /api/seed.' 
      });
    }

    const scored = freelancers.map((f: any) => ({
      ...f,
      _id: f._id.toString(),
      matchScore: calculateMatchScore(f.skills, skills, f.hourlyRate, budgetMax || 5000, f.rating, f.availability),
    }));

    scored.sort((a: any, b: any) => b.matchScore - a.matchScore);

    const topMatches = scored.slice(0, 5);

    return NextResponse.json({
      success: true,
      matches: topMatches,
    });
  } catch (error) {
    console.error('Match error:', error);
    return NextResponse.json({ error: 'Failed to match freelancers' }, { status: 500 });
  }
}
