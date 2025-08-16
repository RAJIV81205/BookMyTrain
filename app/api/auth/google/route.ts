import { NextRequest, NextResponse } from "next/server";
import User from "@/lib/db/model/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db/db";

export async function POST(request: NextRequest) {
    try {
        const { idToken, name, email } = await request.json();

        console.log('Received auth request:', {
            hasToken: !!idToken,
            tokenLength: idToken?.length,
            name,
            email
        });

        if (!idToken || !name || !email) {
            return NextResponse.json(
                { error: "Missing required fields: idToken, name, email" },
                { status: 400 }
            );
        }

        // Basic token validation - check if it looks like a JWT
        const tokenParts = idToken.split('.');
        if (tokenParts.length !== 3) {
            return NextResponse.json(
                { error: "Invalid token format" },
                { status: 401 }
            );
        }

        // Try to decode the token payload for basic validation
        let tokenPayload;
        try {
            const payload = tokenParts[1];
            const decodedPayload = Buffer.from(payload, 'base64url').toString('utf8');
            tokenPayload = JSON.parse(decodedPayload);

            console.log('Token payload:', {
                email: tokenPayload.email,
                aud: tokenPayload.aud,
                exp: tokenPayload.exp,
                iss: tokenPayload.iss
            });

            // Basic validations
            if (tokenPayload.email !== email) {
                return NextResponse.json(
                    { error: "Email mismatch in token" },
                    { status: 400 }
                );
            }

            // Check if token is expired
            const now = Math.floor(Date.now() / 1000);
            if (tokenPayload.exp && tokenPayload.exp < now) {
                return NextResponse.json(
                    { error: "Token expired" },
                    { status: 401 }
                );
            }

        } catch (error) {
            console.error('Token decode error:', error);
            return NextResponse.json(
                { error: "Invalid token payload" },
                { status: 401 }
            );
        }

        // Connect to database
        await connectDB();

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user with random password and fixed DOB
            const randomPassword = Math.random().toString(36).slice(-12);
            const hashedPassword = await bcrypt.hash(randomPassword, 12);

            user = new User({
                name,
                email,
                password: hashedPassword,
                dateOfBirth: "1990-01-01", // Fixed DOB as requested
                mobile: Math.floor(1000000000 + Math.random() * 9000000000), // Random 10-digit mobile
            });

            await user.save();
            console.log("New user created:", user.email);
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email 
            },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );

        return NextResponse.json({
            success: true,
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                dateOfBirth: user.dateOfBirth,
                mobile: user.mobile,
            },
        });

    } catch (error) {
        console.error("Google auth error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}