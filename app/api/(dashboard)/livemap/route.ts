import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAzNjE3ODgzMTgsImlhdCI6MTc2MDI3NTM4ODMxOCwidHlwZSI6ImludGVybmFsIiwicm5kIjoiY1RkQ2x3ajZSc0J5In0=_NmZmMmY1ODQ0OTZlNzIwOWI4NTE3MDcyZjQzMTVjYzBmYTY0NmI3NWQyMmFmMjExYmIzYzg4NTliZjZhZWEzZg==",
        Referer: "https://railradar.in/",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // If you want strong typing, define ApiResponse separately
    const data: any = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server Error" },
      { status: 500 }
    );
  }
}
