import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA2NzgzOTY1MzAsImlhdCI6MTc2MDU5MTk5NjUzMCwidHlwZSI6ImludGVybmFsIiwicm5kIjoiTGJ1bktzQXJEZ1RwIn0=_ZGRiMTAwOWM2YjAzYzYxOTE2NWE0NzA4NDU4Yjc4Y2RmYjJjMzk2NGNiYTFjOGRmYzhkNjcyMDU1MzI0ZGNiMA==",
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
