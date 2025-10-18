import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch("https://railradar.in/api/v1/trains/live-map", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": "rri_eyJleHAiOjE3NjA4NTgyOTE5NDksImlhdCI6MTc2MDc3MTg5MTk0OSwidHlwZSI6ImludGVybmFsIiwicm5kIjoib2duZ2FBV0Z4cXNIIn0=_ZmZjODhkMTQ0MTY5MWRlZDk3YzhkMDFhMWQ1NGViNWM5YmI1OGY3OTMyNjI0MGFlZjhiYjMzYzc5YTAzY2YzZg==",
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
