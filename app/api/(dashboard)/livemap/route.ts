import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA2MzE3OTQxMTIsImlhdCI6MTc2MDU0NTM5NDExMiwidHlwZSI6ImludGVybmFsIiwicm5kIjoiWTVmSHU2SWdGd0JjIn0=_MjU2OTY2MTYxNTA1YTEyYTA1YjljZmIxMzBhZGQyZTI0NWI0YjJkZDc5NmE5N2M3NmQ5YjE4ZDQzMjA4MmI3NA==",
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
