import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAzMDc0NzU1MTcsImlhdCI6MTc2MDIyMTA3NTUxNywidHlwZSI6ImludGVybmFsIiwicm5kIjoiekxRRjlTWTc2WjFQIn0=_ZDdkYWZmNjEwNGZhZDhjOTcwOTI4ZWI0MjQyODY3ZGIwM2ZjYTIxYjg2YjQ3ZDc3Njc0NmEzNTVkNTM4NjQ2Zg==",
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
