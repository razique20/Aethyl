import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ auth: false });
    }

    return NextResponse.json({
      auth: true,
      user: {
        id: session.userId,
        role: session.role,
        setupComplete: session.setupComplete,
      }
    });
  } catch (error) {
    return NextResponse.json({ auth: false });
  }
}
