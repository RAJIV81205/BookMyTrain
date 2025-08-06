import { NextResponse } from "next/server";
import z from "zod";

export async function POST (request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    const validation = z.object({
      email: z.string().email(),
      password: z.string().min(6).max(100),
    }).safeParse({ email, password });

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues }, { status: 400 });
    }

    // Here you would typically check the credentials against a database
    // For this example, we will just return a success message
    return NextResponse.json({ message: "Login successful" });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}