import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA1MjAxODE3NjQsImlhdCI6MTc2MDQzMzc4MTc2NCwidHlwZSI6ImludGVybmFsIiwicm5kIjoiN2hidHdaQ2pHTU1YIn0=_ZWVhZmM5YmQ2ZDIzNzdmY2FiNjY0YTczMzRkNjAxYTkxNzc0NmEyMjRjOWY0OTI1MzY0ZGQ1ZmI3OWRjMDE2Mw==",
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
