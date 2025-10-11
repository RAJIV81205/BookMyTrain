import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAyNTM0MjQ2OTUsImlhdCI6MTc2MDE2NzAyNDY5NSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiWHlRMU9KdFA2Y0FqIn0=_Y2E1MjY5YTA4MzIxYzIyMTE2NDg0NjdiODdjMWQyYWI3ZTkwZGU4NmY0NzE2NGFjZGM2NWFiMjNjYzUyZTc1NQ==",
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
