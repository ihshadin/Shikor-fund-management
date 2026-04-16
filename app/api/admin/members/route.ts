import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import User from '@/models/User';

// GET /api/admin/members?status=all|pending|active
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || (user as any).role !== 'admin')
    return NextResponse.json({ message: 'Access denied.' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status');

  await connectDB();

  const query = statusFilter && statusFilter !== 'all' ? { status: statusFilter } : {};
  const members = await User.find(query).select('-password').sort({ createdAt: -1 }).lean();

  return NextResponse.json(
    members.map((m: any) => ({
      id: m._id.toString(),
      name: m.name,
      email: m.email,
      role: m.role,
      status: m.status,
      isReviewer: m.isReviewer ?? false,
      createdAt: m.createdAt,
    }))
  );
}
