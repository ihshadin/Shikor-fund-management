import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });

  return NextResponse.json({
    id: (user as any).id ?? (user as any)._id?.toString(),
    name: (user as any).name,
    email: (user as any).email,
    role: (user as any).role,
  });
}
