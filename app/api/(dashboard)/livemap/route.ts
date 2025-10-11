import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAzMDA0MDM1NTEsImlhdCI6MTc2MDIxNDAwMzU1MSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiaEQxYVlGTjFUZ2NCIn0=_MzJlYzYyMjg1MjdhNjgzZjRkYmZiNGFlODQyOWE5ZmRjZDg2ZDcyYTNjMDc5ZTI5ZGE3YTcxODZiNDI0YjhkNQ==",
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
