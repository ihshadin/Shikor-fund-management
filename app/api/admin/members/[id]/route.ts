import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import User from '@/models/User';

// PATCH /api/admin/members/[id] — approve/reject/promote/demote
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser(request);
  if (!authUser || (authUser as any).role !== 'admin')
    return NextResponse.json({ message: 'Access denied.' }, { status: 403 });

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.status !== undefined)     updates.status     = body.status;      // 'active' | 'rejected'
  if (body.role !== undefined)       updates.role       = body.role;        // 'member' | 'admin'
  if (body.isReviewer !== undefined) updates.isReviewer = body.isReviewer;  // true | false

  await connectDB();

  const member = await User.findByIdAndUpdate(params.id, { $set: updates }, { new: true, strict: false }).select('-password');
  if (!member) return NextResponse.json({ message: 'সদস্য পাওয়া যায়নি।' }, { status: 404 });

  return NextResponse.json({
    id: member._id.toString(),
    name: member.name,
    email: member.email,
    role: member.role,
    status: member.status,
    isReviewer: member.isReviewer ?? false,
  });
}
