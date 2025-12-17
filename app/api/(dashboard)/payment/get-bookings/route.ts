import { NextResponse } from "next/server";
import verifyToken from "@/lib/db/middleware/verifyToken";
import Booking from "@/lib/db/model/Booking";

export async function GET(request: Request) {
  try {
    /* ---------------- Authorization Header Validation ---------------- */
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authorization token missing or invalid" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token not provided" },
        { status: 401 }
      );
    }

    /* ---------------- Token Verification ---------------- */
    const user = await verifyToken(token);

    if (!user || !user._id) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    /* ---------------- Fetch User Bookings ---------------- */
    const bookings = await Booking.find({ userId: user._id }).lean();

    return NextResponse.json(
      {
        success: true,
        count: bookings.length,
        data: bookings,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("GET /bookings error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
