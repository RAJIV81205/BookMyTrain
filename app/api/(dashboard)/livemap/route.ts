import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA1MTI4NzU1NjIsImlhdCI6MTc2MDQyNjQ3NTU2MiwidHlwZSI6ImludGVybmFsIiwicm5kIjoiZ212bjhPblpMeUN5In0=_YzYyMmJhZjRkYzAyNjE2MWJiZWZlNzQ4Zjk3ZjAyYjBhMmQ3OWUxOWRkOTQ1YTQ0Nzg2YzY4Y2Q1MjU2MThkOQ==",
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
