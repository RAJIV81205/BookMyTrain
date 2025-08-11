import { NextResponse } from "next/server";
import connectDB from "@/lib/db/db";
import Train from "@/lib/db/model/Train";
import verifyAdmin from "@/lib/db/middleware/verifyAdmin";

export async function DELETE(request: Request) {
  const headers = request.headers;
  const token = headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminResult = await verifyAdmin(token);
  if (adminResult.error) {
    return NextResponse.json(
      { error: adminResult.error },
      { status: adminResult.status || 401 }
    );
  }

  try {
    const body = await request.json();
    const { trainNo } = body;

    if (!trainNo) {
      return NextResponse.json(
        { error: "Train number is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const deletedTrain = await Train.findOneAndDelete({ trainNo });

    if (!deletedTrain) {
      return NextResponse.json(
        { error: "Train not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Train deleted successfully", deletedTrain },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting train:", error);
    return NextResponse.json(
      { error: "Failed to delete train" },
      { status: 500 }
    );
  }
}