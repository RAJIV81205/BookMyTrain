import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA1ODg2OTE5NTUsImlhdCI6MTc2MDUwMjI5MTk1NSwidHlwZSI6ImludGVybmFsIiwicm5kIjoic0hsd2NzOVpFQXhIIn0=_OTU4YmE4MzkzYjAzNWY2ZGUyZGM0ZjQzMzFjM2ZiMjU1YzlkZTNiNDQ5ZWE5YzBjMWYxMDM1YzEyNGVkNWQzNw==",
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
