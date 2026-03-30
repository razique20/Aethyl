import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/mongodb';
import Job from '@/models/Job';

export async function GET() {
  try {
    await dbConnect();
    const jobs = await Job.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, jobs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();
    const job = await Job.create(data);
    return NextResponse.json({ success: true, job }, { status: 201 });
  } catch (error) {
    console.error('Create job error:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
