import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || (user as any).role !== 'admin') {
    return NextResponse.json({ message: 'Access denied.' }, { status: 403 });
  }

  await connectDB();
  const reviewers = await User.find({ role: 'reviewer' }).select('-password').lean();

  return NextResponse.json(
    reviewers.map((l: any) => ({
      id: l._id.toString(),
      name: l.name,
      email: l.email,
      role: l.role,
    }))
  );
}
