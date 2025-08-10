import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import Admin from "@/lib/db/model/Admin"; // You'll need to create this model
import connectDB from "@/lib/db/db";

// Input validation schema for admin registration
const adminRegistrationSchema = z.object({
    email: z.string()
        .email("Invalid email format")
        .min(1, "Email is required")
        .max(255, "Email is too long"),
    password: z.string()
        .min(8, "Admin password must be at least 8 characters")
        .max(100, "Password is too long")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
    mobile: z.string()
        .regex(/^[6-9]\d{9}$/, "Mobile number must be a valid 10-digit Indian number starting with 6-9")
        .transform((val) => parseInt(val, 10)),
    dateOfBirth: z.string()
        .refine((date) => !isNaN(Date.parse(date)), "Invalid date format")
        .transform((date) => new Date(date))
        .refine((date) => {
            const today = new Date();
            const age = today.getFullYear() - date.getFullYear();
            return age >= 18 && age <= 65;
        }, "Age must be between 18 and 65 years for admin access"),
    name: z.string()
        .min(1, "Name is required")
        .max(100, "Name is too long")
        .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces")
        .trim()
});

export async function POST(request: Request) {
    try {
        // Parse request body
        let requestBody;
        try {
            requestBody = await request.json();
        } catch (parseError) {
            return NextResponse.json(
                {
                    error: "Invalid JSON format",
                    message: "Request body must be valid JSON"
                },
                { status: 400 }
            );
        }

        const { email, password, mobile, dateOfBirth, name } = requestBody;

        // Validate input using Zod schema
        const validation = adminRegistrationSchema.safeParse({
            email,
            password,
            mobile,
            dateOfBirth,
            name
        });

        if (!validation.success) {
            const errorMessages = validation.error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message
            }));

            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: errorMessages
                },
                { status: 400 }
            );
        }

        const validatedData = validation.data;

        // Connect to database
        try {
            await connectDB();
        } catch (dbError) {
            console.error('Database connection error:', dbError);
            return NextResponse.json(
                {
                    error: "Database connection failed",
                    message: "Unable to connect to database"
                },
                { status: 500 }
            );
        }

        // Check if admin already exists (by email)
        let existingAdmin;
        try {
            existingAdmin = await Admin.findOne({ email: validatedData.email });
        } catch (dbError) {
            console.error('Database query error:', dbError);
            return NextResponse.json(
                {
                    error: "Database error",
                    message: "Error checking existing admin"
                },
                { status: 500 }
            );
        }

        if (existingAdmin) {
            return NextResponse.json(
                {
                    error: "Admin already exists",
                    message: "An admin with this email already exists"
                },
                { status: 409 }
            );
        }

        // Check if mobile number already exists
        let existingMobile;
        try {
            existingMobile = await Admin.findOne({ mobile: validatedData.mobile });
        } catch (dbError) {
            console.error('Database query error:', dbError);
            return NextResponse.json(
                {
                    error: "Database error",
                    message: "Error checking existing mobile number"
                },
                { status: 500 }
            );
        }

        if (existingMobile) {
            return NextResponse.json(
                {
                    error: "Mobile number already registered",
                    message: "An admin with this mobile number already exists"
                },
                { status: 409 }
            );
        }

        // Hash password
        let hashedPassword;
        try {
            const saltRounds = 12;
            hashedPassword = await bcrypt.hash(validatedData.password, saltRounds);
        } catch (hashError) {
            console.error('Password hashing error:', hashError);
            return NextResponse.json(
                {
                    error: "Password processing failed",
                    message: "Unable to process password"
                },
                { status: 500 }
            );
        }

        // Create new admin
        let newAdmin;
        try {
            newAdmin = new Admin({
                name: validatedData.name,
                email: validatedData.email,
                password: hashedPassword,
                mobile: validatedData.mobile,
                dateOfBirth: new Date(validatedData.dateOfBirth).toLocaleDateString("en-IN"),
                isAdmin: false
            });

            await newAdmin.save();
        } catch (dbError: any) {
            console.error('Admin creation error:', dbError);

            // Handle specific MongoDB errors
            if (dbError.code === 11000) {
                const duplicateField = Object.keys(dbError.keyPattern)[0];
                return NextResponse.json(
                    {
                        error: "Duplicate entry",
                        message: `${duplicateField} already exists`
                    },
                    { status: 409 }
                );
            }

            return NextResponse.json(
                {
                    error: "Admin creation failed",
                    message: "Unable to create admin account"
                },
                { status: 500 }
            );
        }



        return NextResponse.json(
            {
                message: "Admin account created successfully! Please wait for approval from a super administrator."
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Unexpected admin registration error:', error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message: "An unexpected error occurred during admin registration"
            },
            { status: 500 }
        );
    }
}
