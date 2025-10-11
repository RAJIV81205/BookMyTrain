import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAyMzIzNTE0NzIsImlhdCI6MTc2MDE0NTk1MTQ3MiwidHlwZSI6ImludGVybmFsIiwicm5kIjoiZmVOdmtQN1Bob3FoIn0=_MjIwNTY0Y2MzNTNjNmQ5NDI0OGY1MzEyOGMwODg5MmEyYmY3YmY5NjAwNGVkMzk2YTlhYTk3MjhkMzEzZmVjMg==",
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
