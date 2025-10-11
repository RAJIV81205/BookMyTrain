import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAyNzg1NjA2NTYsImlhdCI6MTc2MDE5MjE2MDY1NiwidHlwZSI6ImludGVybmFsIiwicm5kIjoibUhHR081ZTRXcEhZIn0=_MTUwMTgyZmYyYTg3NzRkOWExM2NmMGUyNmIwOWNmODdkOTg0MDNmYmNkY2JmYzQ2YzI5ZTQ2ZThkZWFlZWI3Mw==",
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
