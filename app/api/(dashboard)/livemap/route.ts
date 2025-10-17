import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA3OTQxNTg4NDksImlhdCI6MTc2MDcwNzc1ODg0OSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiRm1Lems2VWNjUWl6In0=_NTBmYmNjNGUyMDVmZjQzNTFjZTgxZGZmMWZjNjU3ZDU2ZWE2YTFhZjk2OWYyYjQ0OGJmN2E2YWFiZWFmOWIzMA==",
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
