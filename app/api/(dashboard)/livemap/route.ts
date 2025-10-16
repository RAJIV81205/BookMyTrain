import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA2ODI2ODI2MzcsImlhdCI6MTc2MDU5NjI4MjYzNywidHlwZSI6ImludGVybmFsIiwicm5kIjoibnhLQUVQalpBV1VtIn0=_ZTU5YWE5NWM1MzdkOWJlZWYxZWY3ODA4MmMxNGM0Y2I4NTA4NzljOTZhZjkyZTdhMDE2ZDQ3NWM4YTRjOWI0NQ==",
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
