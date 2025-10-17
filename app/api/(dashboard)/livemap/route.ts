import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA3NTE0ODE0NDIsImlhdCI6MTc2MDY2NTA4MTQ0MiwidHlwZSI6ImludGVybmFsIiwicm5kIjoiRjZLb1hKQlhkMWFkIn0=_ODg3ZWE3OTM0MzgwNjkwOTU1OGEyNWM1YjA0OGFmYjE4ODc3N2YyMDM1NTBlNDZhZjVmOGJjYmQxNzM2NjI0OQ==",
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
