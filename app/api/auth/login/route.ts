import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { signToken } from '@/lib/auth';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password)
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !(await user.comparePassword(password)))
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });

    if (user.status === 'pending')
      return NextResponse.json({ message: 'Your account is pending admin approval. Please wait.' }, { status: 403 });

    if (user.status === 'rejected')
      return NextResponse.json({ message: 'Your account has been rejected. Please contact admin.' }, { status: 403 });

    const token = signToken({ id: user._id.toString(), role: user.role });

    return NextResponse.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        isReviewer: user.isReviewer ?? false,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ message: 'Server error. Please try again.' }, { status: 500 });
  }
}
