import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA5Njk4MzgwMzMsImlhdCI6MTc2MDg4MzQzODAzMywidHlwZSI6ImludGVybmFsIiwicm5kIjoiMTd0NHlJbUZyYmxLIn0=_MzA4YTJmNzkwZWUyYmFjNDQ5NzliNjc2MDE0Y2Y1Y2Q1ODZjOWE1ZTlmMmQ4ZmJjNDkxZWMxNjk1MjZhNGZlOQ==",
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
