import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA3ODI5Mzc1MTQsImlhdCI6MTc2MDY5NjUzNzUxNCwidHlwZSI6ImludGVybmFsIiwicm5kIjoiZkFYTDF2N0xUNmJ6In0=_YWUwYjBlOWFiNjM0Nzk4ZmJhZThjZmNkNjQ4ZWQyNjc5NzhhMTBmNTg4ZTIzYzI1ZWQ5MGRjZDM0MzMwYTY1NA==",
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
