import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { connectDB } from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'shikor_showpno_secret';

export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { id: string; role: string };
}

export async function getAuthUser(request: NextRequest) {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;

  const token = header.slice(7);
  try {
    const payload = verifyToken(token);
    await connectDB();
    // Import here to avoid circular deps
    const { default: User } = await import('@/models/User');
    const user = await User.findById(payload.id).select('-password').lean();
    if (!user) return null;
    return { ...user, id: (user as any)._id.toString(), role: payload.role };
  } catch {
    return null;
  }
}
