import { NextResponse } from "next/server";
import verifyToken from "@/lib/db/middleware/verifyToken";

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return NextResponse.json({ error: 'No authentication token provided' }, { status: 401 });
        }

        const user = await verifyToken(token);
        
   
        if (!user) {
            return NextResponse.json({ error: 'Invalid token or user not found' }, { status: 401 });
        }

        return NextResponse.json({ 
            message: 'Token is valid',
            user: {
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                dateOfBirth: user.dateOfBirth,
                createdAt: user.createdAt
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Token verification error:', error);
        
        // You can provide more specific error messages based on the error
        const errorMessage = error instanceof Error ? error.message : 'Token verification failed';
        
        return NextResponse.json({ error: errorMessage }, { status: 401 });
    }
}