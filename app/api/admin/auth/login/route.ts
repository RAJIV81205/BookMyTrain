import { NextResponse } from "next/server";
import z from "zod";
import jwt from "jsonwebtoken";
import Admin from "@/lib/db/model/Admin";
import connectDB from "@/lib/db/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {

    try {
        const body = await request.json();

        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        await connectDB();

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return NextResponse.json(
                { error: "No User Present" },
                { status: 401 }
            );
            }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        if (!admin.isAdmin) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }


        if (!process.env.JWT_SECRET) {
            return NextResponse.json(
                {
                    error: "No Secret Key Present",
                    status: 500
                }
            );
        }

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });

        if (!token) {
            return NextResponse.json(
                {
                    error: "Failed to generate token",
                    status: 500
                }
            );
        }

        return NextResponse.json({ token ,admin }, { status: 200 });
    } catch (error) {
    return NextResponse.json(
        {
            error: "Internal Server Error",
            status: 500
        }
    );
    }
}