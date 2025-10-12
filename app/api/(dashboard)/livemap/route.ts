import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAzOTc0NzkzOTQsImlhdCI6MTc2MDMxMTA3OTM5NCwidHlwZSI6ImludGVybmFsIiwicm5kIjoiazQ0Q0k2QkpWRkVqIn0=_NzM5ODg1OTg3MjEyZDg3NjY4N2ExMmQwMzA0MGM2YTgzNDM0NWRiNmNlZDk5MDkyOGMxOTRlYjMxYmUxMTJiMw==",
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
