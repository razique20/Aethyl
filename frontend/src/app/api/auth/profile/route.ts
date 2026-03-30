import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Freelancer from '@/models/Freelancer';
import User from '@/models/User';
import { getSession } from '@/lib/auth';

export async function GET() {
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

    let profileData = null;

    if (user.role === 'freelancer') {
      profileData = await Freelancer.findOne({ userId: user._id });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      profile: profileData,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
