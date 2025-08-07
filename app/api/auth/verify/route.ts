import { NextResponse } from "next/server";
import verifyToken from "@/lib/db/middleware/verifyToken";

export async function POST(request: Request) {

    try {
        const token = await request.headers.get('Authorization')?.split(' ')[1];

        if (!token) {
            return NextResponse.json({ error: 'No authentication token provided' }, { status: 401 });
        }
        const isValid = await verifyToken(token);

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
        }

        return NextResponse.json({ message: 'Token is valid' }, { status: 200 });
    } catch (error) {
        console.error('Token verification error:', error);
        return NextResponse.json({ error: 'Token verification failed' }, { status: 500 });
    }

}
