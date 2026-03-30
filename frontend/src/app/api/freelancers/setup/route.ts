import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Freelancer from '@/models/Freelancer';
import User from '@/models/User';
import { getSession, setSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'freelancer') {
      return NextResponse.json({ success: false, error: 'Only freelancers need profile setup' }, { status: 400 });
    }

    const data = await req.json();

    // Generate random avatar based on name if none provided
    const seed = data.title ? data.title.replace(/\s+/g, '') : 'freelancer';
    const avatar = data.avatar && data.avatar.length > 5 
      ? data.avatar 
      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random().toString(36).substring(7)}&backgroundColor=8b5cf6`;

    const freelancer = await Freelancer.create({
      userId: user._id,
      name: user.email.split('@')[0], // Simple placeholder name
      title: data.title || 'Freelancer',
      bio: data.bio || '',
      skills: data.skills || [],
      hourlyRate: data.hourlyRate || 0,
      avatar,
      rating: 0,
      completedJobs: 0,
      availability: 'available',
      location: 'Remote',
      responseTime: '< 1 hour',
      successRate: 100,
    });

    user.setupComplete = true;
    await user.save();

    // Update cookie with new setupComplete status
    await setSession(user._id.toString(), user.role, true);

    return NextResponse.json({ success: true, freelancer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
