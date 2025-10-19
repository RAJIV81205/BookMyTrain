import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA5MzAyNDc1MjYsImlhdCI6MTc2MDg0Mzg0NzUyNiwidHlwZSI6ImludGVybmFsIiwicm5kIjoieThTdGxRTEhna1lDIn0=_NGJjNTBjMzE1ZTVmNDczNWU2M2FhYjkwMmIxZTJkYWY2NTIwZTFmNGUzYmRmNjBhY2MwMmU4OWM1YTg1YWM2Zg==",
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
