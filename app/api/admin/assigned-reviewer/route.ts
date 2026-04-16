import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import Settings from '@/models/Settings';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || (user as any).role !== 'admin') {
    return NextResponse.json({ message: 'Access denied.' }, { status: 403 });
  }

  await connectDB();
  const setting = await Settings.findOne({ key: 'assignedReviewer' });
  return NextResponse.json({ reviewerId: setting ? setting.value : null });
}
