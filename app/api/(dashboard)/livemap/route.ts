import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA4MDc4NjcwNTcsImlhdCI6MTc2MDcyMTQ2NzA1NywidHlwZSI6ImludGVybmFsIiwicm5kIjoiN3FVc01IT0lEeUVjIn0=_NGU1OWJhYWJmOWFkNDlhNmViZGUzMzc2Y2U1MzYxMTVlYjdlYzNiYzA5OThlN2M5MjI3MDQwZDJjYzc3YTU1Zg==",
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
