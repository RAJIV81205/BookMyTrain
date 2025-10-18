import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA4NDc4MDk5OTQsImlhdCI6MTc2MDc2MTQwOTk5NCwidHlwZSI6ImludGVybmFsIiwicm5kIjoieVdHV05TQ2dmVUdwIn0=_MWJhYmMxMzBjZjkwYjU0ZTk4OTg4YzBhNzc0NzFhZmQyNzBiMzlkNGI2MTE5NWUzYmVlNmZkY2QxNTIzYmNhYw==",
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
