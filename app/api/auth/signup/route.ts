import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import User from "@/lib/db/Schema/User";
import connectDB from "@/lib/db/db";

// Input validation schema
const userRegistrationSchema = z.object({
  email: z.string()
    .email("Invalid email format")
    .min(1, "Email is required")
    .max(255, "Email is too long"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  mobile: z.string()
    .regex(/^[6-9]\d{9}$/, "Mobile number must be a valid 10-digit Indian number starting with 6-9")
    .transform((val) => parseInt(val, 10)),
  dateOfBirth: z.string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid date format")
    .transform((date) => new Date(date))
    .refine((date) => {
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      return age >= 13 && age <= 120;
    }, "Age must be between 13 and 120 years"),
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
    const validation = userRegistrationSchema.safeParse({
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

    // Check if user already exists (by email)
    let existingUser;
    try {
      existingUser = await User.findOne({ email: validatedData.email });
    } catch (dbError) {
      console.error('Database query error:', dbError);
      return NextResponse.json(
        {
          error: "Database error",
          message: "Error checking existing user"
        },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        {
          error: "User already exists",
          message: "A user with this email already exists"
        },
        { status: 409 }
      );
    }

    // Check if mobile number already exists
    let existingMobile;
    try {
      existingMobile = await User.findOne({ mobile: validatedData.mobile });
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
          message: "A user with this mobile number already exists"
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

    // Create new user
    let newUser;
    try {
      newUser = new User({
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        mobile: validatedData.mobile,
        dateOfBirth: new Date(validatedData.dateOfBirth).toLocaleDateString("en-IN"),
      });

      await newUser.save();
    } catch (dbError:any) {
      console.error('User creation error:', dbError);

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
          error: "User creation failed",
          message: "Unable to create user account"
        },
        { status: 500 }
      );
    }

    // Return success response (without password)
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      mobile: newUser.mobile,
      dateOfBirth: newUser.dateOfBirth,
      createdAt: newUser.createdAt
    };

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: userResponse
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Unexpected registration error:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred during registration"
      },
      { status: 500 }
    );
  }
}