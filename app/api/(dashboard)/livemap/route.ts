import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjAyMTAxOTU0ODEsImlhdCI6MTc2MDEyMzc5NTQ4MSwidHlwZSI6ImludGVybmFsIiwicm5kIjoiSGhnQm9HTmRkVUZJIn0=_OWQwNzc0MjFmMjEzYmM5MjFmMGI2NGE2YzdmYWQ5YzYyYzQ3MGRmMDg3MDdhZTE1MGUwN2MxM2Q1NTRhNzI4Zg==",
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
