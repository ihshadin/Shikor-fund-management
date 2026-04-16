import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import User from '@/models/User';
import Settings from '@/models/Settings';

export async function PATCH(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || (user as any).role !== 'admin') {
    return NextResponse.json({ message: 'Access denied.' }, { status: 403 });
  }

  const { reviewerId } = await request.json();
  if (!reviewerId) return NextResponse.json({ message: 'reviewerId দিন।' }, { status: 400 });

  await connectDB();

  const reviewer = await User.findOne({ _id: reviewerId, role: 'reviewer' });
  if (!reviewer) return NextResponse.json({ message: 'লিডার পাওয়া যায়নি।' }, { status: 404 });

  await Settings.findOneAndUpdate(
    { key: 'assignedLeader' },
    { value: reviewerId },
    { upsert: true }
  );

  return NextResponse.json({ reviewerId });
}
