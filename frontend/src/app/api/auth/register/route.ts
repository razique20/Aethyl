import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import { setSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { email, password, role } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash,
      role,
      setupComplete: false,
    });

    await setSession(user._id.toString(), user.role, user.setupComplete);

    return NextResponse.json({ success: true, user: { id: user._id, role: user.role, setupComplete: user.setupComplete } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
