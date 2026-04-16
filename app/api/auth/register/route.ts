import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password)
      return NextResponse.json({ message: 'Name, email and password are required.' }, { status: 400 });

    if (password.length < 6)
      return NextResponse.json({ message: 'Password must be at least 6 characters.' }, { status: 400 });

    await connectDB();

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists)
      return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 409 });

    await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'member',
      status: 'pending',
    });

    return NextResponse.json(
      { message: 'Registration successful! You can login after admin approval.' },
      { status: 201 }
    );
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ message: 'Server error. Please try again.' }, { status: 500 });
  }
}
