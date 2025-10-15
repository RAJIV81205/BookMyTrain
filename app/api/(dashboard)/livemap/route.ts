import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA2MzUxMjYwNTcsImlhdCI6MTc2MDU0ODcyNjA1NywidHlwZSI6ImludGVybmFsIiwicm5kIjoidlQyeEJtUHc2aFhZIn0=_OGRlMjQ2MGMwMzc5MmI5OTM4NDgzMWZjZWRkZDFkMGIxNDkzOGYzOTYwM2Q0MjM5YzQyOWU5ZmNkYWUwNzI5Zg==",
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
