import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjEwMjQwNzgwNzYsImlhdCI6MTc2MDkzNzY3ODA3NiwidHlwZSI6ImludGVybmFsIiwicm5kIjoiQk0xanh6SHVURENpIn0=_M2Y4MmQ4YTMyZjVmYWJhYmI4OTFhZjRkODc1MWUwN2U0Mzc5ZmI3MmJlYmRlYmUyYzg4MGU2MWE3YWNjMzE3Zg==",
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
