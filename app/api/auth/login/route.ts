import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import z, { date } from 'zod';
import User from '@/lib/db/Schema/User';
import connectDB from '@/lib/db/db';


const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),

});

export async function POST(request: Request) {
  try {
    const { email, password} = await request.json();

    // Validate input
    const validation = loginSchema.safeParse({ email, password});
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues }, { status: 400 });
    }

    // Find user in the database
    await connectDB();
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1h',
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}