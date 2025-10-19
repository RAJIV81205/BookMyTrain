import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA5NTU1NTk5MDIsImlhdCI6MTc2MDg2OTE1OTkwMiwidHlwZSI6ImludGVybmFsIiwicm5kIjoiMW1DNFd5U1pySWtIIn0=_YzM2ZGU3YTRkY2M5YmMxMzc0MjA4ZjRjNmI2YzFmMTJhMGQxOTYzMjgwMDdlYmJkYzEzODNmOTdmOGE4ZmFkNA==",
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
