import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA1NzAzMjMzNDUsImlhdCI6MTc2MDQ4MzkyMzM0NSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiQUZJeUtMSWdLUmtSIn0=_NTgzMmRiY2NjNWY0M2Q0MzJlYmUyM2I4YmJlNjg2ZGQ5NTljNzBlYTc0Y2YyOTJkMmZhMjM5ZmRlMDVkOTU3Nw==",
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
