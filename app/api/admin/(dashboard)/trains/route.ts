import { NextResponse } from "next/server";
import connectDB from "@/lib/db/db";
import Train from "@/lib/db/model/Train";
import verifyAdmin from "@/lib/db/middleware/verifyAdmin";

export async function GET(request: Request) {
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
    await connectDB();
    const trains = await Train.find({}).sort({ addedDate: -1 });
    return NextResponse.json({ trains }, { status: 200 });
  } catch (error) {
    console.error("Error fetching trains:", error);
    return NextResponse.json(
      { error: "Failed to fetch trains" }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const headers = request.headers;
  const token = headers.get("Authorization")?.split(" ")[1];

  const { trainNo, trainName, classes } = body;

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

  // Validation
  if (!trainNo || !trainName || !classes || typeof classes !== 'object') {
    return NextResponse.json(
      { error: "Missing required fields: trainNo, trainName, classes" }, 
      { status: 400 }
    );
  }

  try {
    await connectDB();

    // Check if train already exists
    const existingTrain = await Train.findOne({ trainNo });
    if (existingTrain) {
      return NextResponse.json(
        { error: "Train with this number already exists" }, 
        { status: 409 }
      );
    }

    const trainData = {
      trainNo,
      trainName,
      classes,
      addedDate: new Date().toLocaleDateString("en-IN")
    };

    const newTrain = new Train(trainData);
    await newTrain.save();

    return NextResponse.json(
      { message: "Train added successfully", train: newTrain }, 
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding train:", error);
    return NextResponse.json(
      { error: "Failed to add train" }, 
      { status: 500 }
    );
  }
}
