import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAyMzk2NjI3OTEsImlhdCI6MTc2MDE1MzI2Mjc5MSwidHlwZSI6ImludGVybmFsIiwicm5kIjoia0pmakxDQ3ZYcXJNIn0=_MTFlNzI1Mjk4ZmE0YjlmZmU3YWE2YzZiNGZlZmU3NzY5MDI4MGMzNjE0ZGI5NGExN2QzM2IwZDdhYTE0NzdkNg==",
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
