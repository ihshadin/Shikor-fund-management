import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import Payment from '@/models/Payment';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });

  const role = (user as any).role;
  const canReview = role === 'admin' || (user as any).isReviewer === true;
  if (!canReview)
    return NextResponse.json({ message: 'Access denied.' }, { status: 403 });

  const { status } = await request.json();
  if (!['Approved', 'Rejected'].includes(status))
    return NextResponse.json({ message: 'Invalid status.' }, { status: 400 });

  await connectDB();

  const payment = await Payment.findByIdAndUpdate(
    params.id,
    {
      status,
      approvedByName: (user as any).name,
      reviewedBy: (user as any)._id ?? (user as any).id,
    },
    { new: true }
  );

  if (!payment) return NextResponse.json({ message: 'পেমেন্ট পাওয়া যায়নি।' }, { status: 404 });

  const obj = payment.toObject();
  return NextResponse.json({
    ...obj,
    id: obj._id.toString(),
    userId: obj.userId.toString(),
    _id: undefined,
    __v: undefined,
  });
}
