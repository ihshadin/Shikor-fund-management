import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import Payment from '@/models/Payment';

function normalize(p: any) {
  const obj = p.toObject ? p.toObject() : { ...p };
  return {
    ...obj,
    id: obj._id.toString(),
    userId: obj.userId.toString(),
    _id: undefined,
    __v: undefined,
    reviewedBy: undefined,
  };
}

// GET /api/payments
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });

  await connectDB();

  const role = (user as any).role;
  const query = role === 'member' ? { userId: (user as any)._id ?? (user as any).id } : {};
  const payments = await Payment.find(query).sort({ createdAt: -1 });

  return NextResponse.json(payments.map(normalize));
}

// POST /api/payments — member, reviewer, admin can all submit
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });

  const { year, months, amount, method, recipientName, date, transactionId } = await request.json();

  if (!year || !months?.length || !amount || !method || !date)
    return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });

  if (method === 'ToMember' && !recipientName?.trim())
    return NextResponse.json({ message: 'Please enter the recipient name.' }, { status: 400 });

  await connectDB();
  const userId = (user as any)._id ?? (user as any).id;

  // Check for duplicate month+year submissions
  for (const month of months) {
    const existing = await Payment.findOne({
      userId,
      year: Number(year),
      months: month,
      status: { $in: ['Pending', 'Approved'] },
    });
    if (existing) {
      return NextResponse.json(
        { message: `${month} ${year} payment has already been submitted.` },
        { status: 409 }
      );
    }
  }

  const payment = await Payment.create({
    userId,
    name: (user as any).name,
    year: Number(year),
    months,
    amount: Number(amount),
    method,
    recipientName: recipientName?.trim() || '',
    date,
    transactionId: transactionId?.trim() || '',
    status: 'Pending',
  });

  return NextResponse.json(normalize(payment), { status: 201 });
}
