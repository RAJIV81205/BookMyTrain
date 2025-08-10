import connectDB from "../db";
import Admin from "../model/Admin";
import jwt, { JwtPayload } from "jsonwebtoken";

interface VerifyAdminResult {
  admin?: {
    id: string;
    name: string;
    email: string;
    dateOfBirth?: Date;
    mobile?: string;
  };
  error?: string;
  status?: number;
}

const verifyAdmin = async (token: string): Promise<VerifyAdminResult> => {
  try {
    // Ensure JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      return { error: "Server configuration error: JWT_SECRET missing", status: 500 };
    }

    // Connect to DB
    try {
      await connectDB();
    } catch (dbErr) {
      console.error("Database connection error:", dbErr);
      return { error: "Database connection failed", status: 500 };
    }

    // Verify token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    } catch (jwtErr) {
      console.error("JWT verification failed:", jwtErr);
      return { error: "Invalid or expired token", status: 401 };
    }

    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      return { error: "Invalid token payload", status: 401 };
    }

    // Find admin in DB
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return { error: "Admin not found", status: 404 };
    }

    if (!admin.isAdmin) {
      return { error: "User is not an admin", status: 403 };
    }

    return {
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        dateOfBirth: admin.dateOfBirth,
        mobile: admin.mobile
      }
    };
  } catch (err) {
    console.error("Unexpected error in verifyAdmin:", err);
    return { error: "Internal Server Error", status: 500 };
  }
};

export default verifyAdmin;