import { NextResponse } from "next/server";
import verifyAdmin from "@/lib/db/middleware/verifyAdmin";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid Authorization header" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Token not provided" }, { status: 401 });
    }

    const { admin, error, status } = await verifyAdmin(token);
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    return NextResponse.json({ admin });
  } catch (err) {
    console.error("Unexpected error in admin verification route:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
