import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import User from '@/lib/db/Schema/User';
import connectDB from '@/lib/db/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Connect to database
    await connectDB();
   
    
    // Find user in the database
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      process.env.JWT_SECRET || 'default', 
      { expiresIn: '1h' }
    );

    return NextResponse.json({ 
      token,
      user: {
        id: user._id,
        email: user.email,

      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}