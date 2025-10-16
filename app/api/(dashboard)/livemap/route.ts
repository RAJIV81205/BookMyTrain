import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA3MTQ1NTY2MjgsImlhdCI6MTc2MDYyODE1NjYyOCwidHlwZSI6ImludGVybmFsIiwicm5kIjoiRHVJMEVpYWdGWEJSIn0=_MTc0MGRlYjAyZWFjNGM0ZDQxOGFiZDU3ZGYwODVlZTZhYzE4Y2M4OTk1N2ViYWU0YWI2MjVlYjgwMjJkMmJkMw==",
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
